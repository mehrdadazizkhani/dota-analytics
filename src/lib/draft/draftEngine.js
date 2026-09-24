const DEFAULT_WEIGHTS = {
  playerComfort: 1.5,
  positionFit: 1,
  meta: 1.5,
  synergy: 1,
  counter: 1,
  threat: 1,
  conflict: 0.75,
  teamComposition: 1.5,
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

  if (!heroData?.meta) {
    return 0;
  }

  const winRate = Number(heroData.meta.winRate || 0);
  const pickRate = Number(heroData.meta.pickRate || 0);

  const winRateScore = Math.max(0, Math.min(100, ((winRate - 45) / 10) * 100));

  const pickRateScore = Math.max(0, Math.min(100, (pickRate / 10) * 100));

  return winRateScore * 0.7 + pickRateScore * 0.3;
}

/*
 * TEAM COMPOSITION
 *
 * These helpers evaluate the current OUR team and the candidate
 * hero together. They do not reject heroes. They only reward
 * heroes that improve the current team composition.
 */

function getHeroData(heroId, draftDataset) {
  return draftDataset?.heroes?.get(Number(heroId)) || null;
}

function getTeamHeroes(draftState, draftDataset) {
  return (draftState?.ourPicks || [])
    .map((pick) => getHeroData(pick.heroId, draftDataset))
    .filter(Boolean);
}

function getHeroRoles(hero) {
  if (!Array.isArray(hero?.roles)) {
    return [];
  }

  return hero.roles.map((role) => role.roleId);
}

function isSupportHero(hero) {
  return getHeroRoles(hero).includes("SUPPORT");
}

function isCoreHero(hero) {
  const roles = getHeroRoles(hero);

  return (
    roles.includes("CARRY") ||
    roles.includes("NUKER") ||
    roles.includes("INITIATOR") ||
    roles.includes("DURABLE")
  );
}

function calculateRoleCoverageScore(hero, draftState, draftDataset) {
  const teamHeroes = getTeamHeroes(draftState, draftDataset);

  const currentSupports = teamHeroes.filter(isSupportHero).length;
  const currentCores = teamHeroes.filter(isCoreHero).length;

  const candidateIsSupport = isSupportHero(hero);
  const candidateIsCore = isCoreHero(hero);

  const projectedSupports = currentSupports + (candidateIsSupport ? 1 : 0);

  const projectedCores = currentCores + (candidateIsCore ? 1 : 0);

  /*
   * Target composition:
   *
   * 3 Core
   * 2 Support
   *
   * Once the team has enough cores, additional support heroes
   * receive a stronger bonus.
   */
  if (projectedSupports >= 2 && projectedCores >= 3) {
    return 75;
  }

  if (projectedSupports < 2 && candidateIsSupport) {
    return 100;
  }

  if (projectedCores < 3 && candidateIsCore) {
    return 90;
  }

  if (projectedCores >= 3 && candidateIsCore) {
    return 25;
  }

  if (projectedSupports >= 2 && candidateIsSupport) {
    return 35;
  }

  return 50;
}

function calculateStunScore(hero, draftState, draftDataset) {
  const teamHeroes = getTeamHeroes(draftState, draftDataset);

  const currentStun = teamHeroes.reduce(
    (sum, teamHero) => sum + Number(teamHero.stats?.stunCount || 0),
    0,
  );

  const candidateStun = Number(hero.stats?.stunCount || 0);

  const projectedStun = currentStun + candidateStun;

  /*
   * We want some stun presence, but additional stun becomes
   * less valuable once the team already has enough.
   */
  if (projectedStun <= 0) {
    return 0;
  }

  if (projectedStun < 2) {
    return 100;
  }

  if (projectedStun < 5) {
    return 85;
  }

  if (projectedStun < 8) {
    return 65;
  }

  return 40;
}

function calculateDisableScore(hero, draftState, draftDataset) {
  const teamHeroes = getTeamHeroes(draftState, draftDataset);

  const currentDisable = teamHeroes.reduce(
    (sum, teamHero) => sum + Number(teamHero.stats?.disableCount || 0),
    0,
  );

  const candidateDisable = Number(hero.stats?.disableCount || 0);

  const projectedDisable = currentDisable + candidateDisable;

  if (projectedDisable <= 0) {
    return 0;
  }

  if (projectedDisable < 2) {
    return 100;
  }

  if (projectedDisable < 5) {
    return 85;
  }

  if (projectedDisable < 8) {
    return 65;
  }

  return 40;
}

function calculateDamageScore(hero, draftState, draftDataset) {
  const teamHeroes = getTeamHeroes(draftState, draftDataset);

  const currentHeroDamage = teamHeroes.reduce(
    (sum, teamHero) => sum + Number(teamHero.stats?.heroDamage || 0),
    0,
  );

  const currentTowerDamage = teamHeroes.reduce(
    (sum, teamHero) => sum + Number(teamHero.stats?.towerDamage || 0),
    0,
  );

  const candidateHeroDamage = Number(hero.stats?.heroDamage || 0);

  const candidateTowerDamage = Number(hero.stats?.towerDamage || 0);

  const projectedHeroDamage = currentHeroDamage + candidateHeroDamage;

  const projectedTowerDamage = currentTowerDamage + candidateTowerDamage;

  /*
   * We normalize the candidate contribution against the
   * current team average rather than using absolute values.
   */
  const teamSize = Math.max(teamHeroes.length, 1);

  const averageHeroDamage = currentHeroDamage / teamSize;

  const averageTowerDamage = currentTowerDamage / teamSize;

  let heroDamageScore = 50;
  let towerDamageScore = 50;

  if (averageHeroDamage > 0) {
    const ratio = candidateHeroDamage / averageHeroDamage;

    heroDamageScore = Math.max(0, Math.min(100, 50 + (ratio - 1) * 30));
  } else if (projectedHeroDamage > 0) {
    heroDamageScore = 75;
  }

  if (averageTowerDamage > 0) {
    const ratio = candidateTowerDamage / averageTowerDamage;

    towerDamageScore = Math.max(0, Math.min(100, 50 + (ratio - 1) * 30));
  } else if (projectedTowerDamage > 0) {
    towerDamageScore = 75;
  }

  return {
    heroDamage: heroDamageScore,
    towerDamage: towerDamageScore,
  };
}

export function calculateTeamCompositionScore(hero, draftState, draftDataset) {
  if (!hero || !draftState || !draftDataset) {
    return {
      total: 0,
      position: 0,
      stun: 0,
      disable: 0,
      heroDamage: 0,
      towerDamage: 0,
    };
  }

  const position = calculateRoleCoverageScore(hero, draftState, draftDataset);

  const stun = calculateStunScore(hero, draftState, draftDataset);

  const disable = calculateDisableScore(hero, draftState, draftDataset);

  const damage = calculateDamageScore(hero, draftState, draftDataset);

  const total =
    position * 0.35 +
    stun * 0.2 +
    disable * 0.2 +
    damage.heroDamage * 0.125 +
    damage.towerDamage * 0.125;

  return {
    total: Math.max(0, Math.min(100, total)),
    position,
    stun,
    disable,
    heroDamage: damage.heroDamage,
    towerDamage: damage.towerDamage,
  };
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
    Number(scores.conflict || 0) * finalWeights.conflict +
    Number(scores.teamComposition || 0) * finalWeights.teamComposition
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
  const teamComposition = calculateTeamCompositionScore(
    hero,
    draftState,
    draftDataset,
  );

  const scores = {
    playerComfort: calculatePlayerComfort(hero.id, player),

    positionFit: calculatePositionFit(hero, player?.position),

    meta: calculateMetaScore(hero.id, draftDataset),

    synergy: calculateSynergyScore(hero.id, draftState, draftDataset),

    counter: calculateCounterScore(hero.id, draftState, draftDataset),

    threat: calculateThreatScore(hero.id, draftSetup, draftDataset),

    conflict: calculateConflictScore(hero.id, draftState, draftDataset),

    teamComposition: teamComposition.total,
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
