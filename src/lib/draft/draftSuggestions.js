import { calculateHeroScore } from "./draftEngine";

function getAvailableHeroes(heroes, draftState) {
  const usedHeroIds = new Set(
    [
      ...draftState.ourPicks,
      ...draftState.ourBans,
      ...draftState.enemyPicks,
      ...draftState.enemyBans,
    ].map((item) => Number(item.heroId)),
  );

  return heroes.filter((hero) => !usedHeroIds.has(Number(hero.id)));
}

function getHeroDataset(hero, draftDataset) {
  return draftDataset?.heroes?.get(Number(hero.id)) || null;
}

function buildEngineHero(hero, draftDataset) {
  const datasetHero = getHeroDataset(hero, draftDataset);
  return {
    ...hero,
    heroId: Number(hero.id),
    roles: hero.roles || [],
    meta: datasetHero?.meta || {},
    stats: datasetHero?.stats || {},
    with: datasetHero?.with || new Map(),
    vs: datasetHero?.vs || new Map(),
    matchCountWith: datasetHero?.matchCountWith || 0,
    matchCountVs: datasetHero?.matchCountVs || 0,
  };
}

function scorePick({ hero, player, draftState, draftSetup, draftDataset }) {
  const engineHero = buildEngineHero(hero, draftDataset);

  const result = calculateHeroScore({
    hero: engineHero,
    player,
    draftState,
    draftSetup,
    draftDataset,
  });

  return {
    hero,
    score: result.finalScore,
    breakdown: result.scores,
  };
}

function calculateBanMetaScore(hero, draftDataset) {
  const heroData = getHeroDataset(hero, draftDataset);

  if (!heroData?.meta) return 0;

  const winRate = Number(heroData.meta.winRate || 0);
  const pickRate = Number(heroData.meta.pickRate || 0);

  const winRateScore = Math.max(0, Math.min(100, ((winRate - 45) / 10) * 100));

  const pickRateScore = Math.max(0, Math.min(100, (pickRate / 10) * 100));

  return winRateScore * 0.7 + pickRateScore * 0.3;
}

function calculateBanScore({ hero, draftState, draftSetup, draftDataset }) {
  const heroData = getHeroDataset(hero, draftDataset);

  if (!heroData) {
    return {
      score: 0,
      breakdown: {
        enemyThreat: 0,
        teamThreat: 0,
        meta: 0,
      },
    };
  }

  const ourPicks = draftState.ourPicks || [];
  const enemyPicks = draftState.enemyPicks || [];

  /*
   * 1. Meta threat
   *
   * A strong meta hero is inherently more valuable to remove.
   */
  const metaScore = calculateBanMetaScore(hero, draftDataset);

  /*
   * 2. Threat to our current picks
   *
   * If the candidate hero performs well against our
   * current picks, banning it becomes more valuable.
   */
  const counterValues = [];

  for (const ourPick of ourPicks) {
    const ourHeroData = getHeroDataset(ourPick.heroId, draftDataset);

    if (!ourHeroData) continue;

    const relation = ourHeroData.vs?.get(Number(hero.id));

    if (!relation) continue;

    const enemyWinRate = Number(relation.winRateHeroId2 || 0);

    counterValues.push(enemyWinRate);
  }

  const enemyThreat =
    counterValues.length > 0
      ? Math.max(0, Math.min(100, ((average(counterValues) - 45) / 10) * 100))
      : 0;

  /*
   * 3. Threat to our future picks
   *
   * If this hero is currently a strong option for one of
   * our configured players, banning it can be valuable.
   */
  const configuredPlayers = draftSetup?.players || [];

  let playerThreat = 0;

  for (const player of configuredPlayers) {
    const poolHero = player?.heroPool?.find(
      (poolItem) => Number(poolItem.heroId) === Number(hero.id),
    );

    if (!poolHero) continue;

    const comfort = Number(poolHero.comfort || 0);

    playerThreat = Math.max(playerThreat, comfort * 20);
  }

  /*
   * 4. Explicit team threat
   */
  const configuredThreats = draftSetup?.teamThreats || [];

  const isConfiguredThreat = configuredThreats.some(
    (threat) =>
      Number(typeof threat === "object" ? threat.heroId : threat) ===
      Number(hero.id),
  );

  const teamThreat = isConfiguredThreat ? 100 : 0;

  /*
   * Final ban score
   *
   * Contextual threat is more important than raw meta,
   * while explicit team threats receive a strong boost.
   */
  const score =
    metaScore * 0.25 +
    enemyThreat * 0.35 +
    playerThreat * 0.15 +
    teamThreat * 0.25;

  return {
    score,
    breakdown: {
      meta: metaScore,
      enemyThreat,
      playerThreat,
      teamThreat,
    },
  };
}

function sortSuggestions(items) {
  return [...items].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return String(a.hero.displayName).localeCompare(String(b.hero.displayName));
  });
}

export function getDraftSuggestions({
  heroes = [],
  draftState,
  draftSetup,
  draftDataset,
}) {
  if (!draftState || !draftDataset || !heroes.length) {
    return {
      bestPicks: [],
      comfortPicks: [],
      bestBans: [],
      teamThreats: [],
    };
  }

  function average(values) {
    if (!values.length) return 0;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  const availableHeroes = getAvailableHeroes(heroes, draftState);

  /*
   * --------------------------------------------------
   * PICK SUGGESTIONS
   * --------------------------------------------------
   */

  const primaryPlayer =
    draftSetup?.players?.find((player) => player.position === 1) ||
    draftSetup?.players?.[0] ||
    null;

  const scoredPicks = availableHeroes.map((hero) =>
    scorePick({
      hero,
      player: primaryPlayer,
      draftState,
      draftSetup,
      draftDataset,
    }),
  );

  const bestPicks = sortSuggestions(scoredPicks).slice(0, 3);

  const comfortPicks = sortSuggestions(
    scoredPicks
      .filter((item) => {
        const poolHero = primaryPlayer?.heroPool?.find(
          (poolItem) => Number(poolItem.heroId) === Number(item.hero.id),
        );

        return Boolean(poolHero);
      })
      .map((item) => {
        const poolHero = primaryPlayer.heroPool.find(
          (poolItem) => Number(poolItem.heroId) === Number(item.hero.id),
        );

        const comfort = Number(poolHero?.comfort || 0);

        const positionFit = Number(item.breakdown?.positionFit || 0);

        const draftFit =
          Number(item.breakdown?.synergy || 0) * 0.35 +
          Number(item.breakdown?.counter || 0) * 0.35 +
          Number(item.breakdown?.meta || 0) * 0.15 +
          positionFit * 0.15;

        return {
          ...item,
          score: comfort * 0.6 + draftFit * 0.4,
        };
      }),
  ).slice(0, 3);

  /*
   * --------------------------------------------------
   * BAN SUGGESTIONS
   * --------------------------------------------------
   */

  const scoredBans = availableHeroes.map((hero) => {
    const result = calculateBanScore({
      hero,
      draftState,
      draftSetup,
      draftDataset,
    });

    return {
      hero,
      score: result.score,
      breakdown: result.breakdown,
    };
  });

  const sortedBans = sortSuggestions(scoredBans);

  const bestBans = sortedBans.slice(0, 3);

  /*
   * Team Threats are explicit threats configured
   * by the user.
   */
  const threatIds = new Set(
    (draftSetup?.teamThreats || []).map((threat) =>
      Number(typeof threat === "object" ? threat.heroId : threat),
    ),
  );

  const teamThreats = sortedBans
    .filter((item) => threatIds.has(Number(item.hero.id)))
    .slice(0, 3);

  return {
    bestPicks,
    comfortPicks,
    bestBans,
    teamThreats,
  };
}
