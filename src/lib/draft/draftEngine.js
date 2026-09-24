const DEFAULT_WEIGHTS = {
  playerComfort: 1,
  positionFit: 1,
  meta: 1,
  synergy: 1,
  counter: 1,
  threat: 1,
  conflict: 1,
};

const POSITION_ROLE_MAP = {
  1: ["CARRY"],
  2: ["CARRY", "NUKER"],
  3: ["INITIATOR", "DURABLE"],
  4: ["SUPPORT", "DISABLER"],
  5: ["SUPPORT"],
};

export function createDraftWeights(overrides = {}) {
  return {
    ...DEFAULT_WEIGHTS,
    ...overrides,
  };
}

export function calculatePlayerComfort(heroId, player) {
  if (!player?.heroPool) {
    return 0;
  }

  const hero = player.heroPool.find(
    (item) => Number(item.heroId) === Number(heroId),
  );

  if (!hero) {
    return 0;
  }

  const level = Number(hero.comfort || 0);

  return Math.max(0, Math.min(100, level * 20));
}

export function calculatePositionFit(hero, position) {
  if (!hero || !position) {
    return 0;
  }

  const expectedRoles = POSITION_ROLE_MAP[position];

  if (!expectedRoles?.length) {
    return 0;
  }

  const heroRoles = Array.isArray(hero.roles)
    ? hero.roles.map((role) => role.roleId)
    : [];

  const matchingRoles = heroRoles.filter((role) =>
    expectedRoles.includes(role),
  );

  if (matchingRoles.length === 0) {
    return 25;
  }

  if (matchingRoles.length === 1) {
    return 75;
  }

  return 100;
}

export function calculateMetaScore(heroId, draftDataset) {
  const heroData = draftDataset?.heroes?.get(Number(heroId));

  if (!heroData?.meta) return 0;

  const winRate = Number(heroData.meta.winRate || 0);
  const pickRate = Number(heroData.meta.pickRate || 0);

  const winRateScore = Math.max(0, Math.min(100, ((winRate - 45) / 10) * 100));

  const pickRateScore = Math.max(0, Math.min(100, (pickRate / 10) * 100));

  return winRateScore * 0.7 + pickRateScore * 0.3;
}

export function calculatePickScore(scores, weights = DEFAULT_WEIGHTS) {
  const finalWeights = createDraftWeights(weights);

  return (
    Number(scores.playerComfort || 0) * finalWeights.playerComfort +
    Number(scores.positionFit || 0) * finalWeights.positionFit +
    Number(scores.meta || 0) * finalWeights.meta +
    Number(scores.synergy || 0) * finalWeights.synergy +
    Number(scores.counter || 0) * finalWeights.counter +
    Number(scores.threat || 0) * finalWeights.threat -
    Number(scores.conflict || 0) * finalWeights.conflict
  );
}

export function calculateHeroScore({
  hero,
  player,
  draftState,
  draftSetup,
  draftDataset,
  weights,
}) {
  const scores = {
    playerComfort: calculatePlayerComfort(hero.id, player),
    positionFit: calculatePositionFit(hero, player?.position),

    meta: calculateMetaScore(hero.id, draftDataset),
    synergy: calculateSynergyScore(hero.id, draftState, draftDataset),
    counter: calculateCounterScore(hero.id, draftState, draftDataset),
    threat: calculateThreatScore(hero.id, draftSetup, draftDataset),
    conflict: calculateConflictScore(hero.id, draftState, draftDataset),
  };

  const finalScore = calculatePickScore(scores, weights);

  return {
    heroId: hero.id,
    scores,
    finalScore,
  };
}

export function calculateSynergyScore(heroId, draftState, draftDataset) {
  const heroData = draftDataset?.heroes?.get(Number(heroId));

  if (!heroData?.with || !draftState?.ourPicks?.length) {
    return 0;
  }

  const synergyScores = [];

  for (const pick of draftState.ourPicks) {
    const pickedHeroId = Number(pick.heroId);

    if (!pickedHeroId) continue;

    const relation = heroData.with.get(pickedHeroId);

    if (!relation) continue;

    const synergy = Number(relation.synergy || 0);

    synergyScores.push(synergy);
  }

  if (!synergyScores.length) {
    return 0;
  }

  const average =
    synergyScores.reduce((sum, value) => sum + value, 0) / synergyScores.length;

  return Math.max(0, Math.min(100, average * 10));
}

export function calculateCounterScore(heroId, draftState, draftDataset) {
  const heroData = draftDataset?.heroes?.get(Number(heroId));

  if (!heroData?.vs || !draftState?.enemyPicks?.length) {
    return 0;
  }

  const counterScores = [];

  for (const pick of draftState.enemyPicks) {
    const enemyHeroId = Number(pick.heroId);

    if (!enemyHeroId) continue;

    const relation = heroData.vs.get(enemyHeroId);

    if (!relation) continue;

    const winRate = Number(relation.winRateHeroId1 || 0);

    counterScores.push(winRate);
  }

  if (!counterScores.length) {
    return 0;
  }

  const average =
    counterScores.reduce((sum, value) => sum + value, 0) / counterScores.length;

  return Math.max(0, Math.min(100, ((average - 40) / 20) * 100));
}

export function calculateThreatScore(heroId, draftSetup, draftDataset) {
  const heroData = draftDataset?.heroes?.get(Number(heroId));

  if (!heroData?.vs || !draftSetup?.teamThreats?.length) {
    return 0;
  }

  const threatScores = [];

  for (const threat of draftSetup.teamThreats) {
    const threatHeroId = Number(
      typeof threat === "object" ? threat.heroId : threat,
    );

    if (!threatHeroId) continue;

    const relation = heroData.vs.get(threatHeroId);

    if (!relation) continue;

    const winRate = Number(relation.winRateHeroId1 || 0);

    threatScores.push(winRate);
  }

  if (!threatScores.length) {
    return 0;
  }

  const average =
    threatScores.reduce((sum, value) => sum + value, 0) / threatScores.length;

  return Math.max(0, Math.min(100, ((average - 40) / 20) * 100));
}

export function calculateConflictScore(heroId, draftState, draftDataset) {
  const heroData = draftDataset?.heroes?.get(Number(heroId));

  if (!heroData?.with || !draftState?.ourPicks?.length) {
    return 0;
  }

  const conflictScores = [];

  for (const pick of draftState.ourPicks) {
    const pickedHeroId = Number(pick.heroId);

    if (!pickedHeroId) continue;

    const relation = heroData.with.get(pickedHeroId);

    if (!relation) continue;

    const synergy = Number(relation.synergy || 0);

    const conflict = Math.max(0, Math.min(100, 50 - synergy * 10));

    conflictScores.push(conflict);
  }

  if (!conflictScores.length) {
    return 0;
  }

  const average =
    conflictScores.reduce((sum, value) => sum + value, 0) /
    conflictScores.length;

  return Math.max(0, Math.min(100, average));
}
