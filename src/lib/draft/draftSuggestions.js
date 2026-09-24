import { calculateHeroScore } from "./draftEngine";

function average(values) {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

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

/*
 * --------------------------------------------------
 * ENEMY DRAFT INTENT
 * --------------------------------------------------
 *
 * We are not trying to predict the exact hero.
 *
 * We are estimating:
 *
 * "Which remaining heroes would improve the enemy
 * draft the most if they were allowed to pick them?"
 *
 * Enemy picks tell us what the team already has.
 * Enemy bans give us additional role / archetype signals.
 * Our picks tell us which enemy additions are dangerous
 * against our current composition.
 */

function calculateEnemyRoleNeed(hero, draftState, heroes) {
  const enemyPicks = draftState.enemyPicks || [];
  const enemyBans = draftState.enemyBans || [];

  const enemyPickHeroes = enemyPicks
    .map((pick) =>
      heroes.find((candidate) => Number(candidate.id) === Number(pick.heroId)),
    )
    .filter(Boolean);

  const enemyBanHeroes = enemyBans
    .map((ban) =>
      heroes.find((candidate) => Number(candidate.id) === Number(ban.heroId)),
    )
    .filter(Boolean);

  const enemySupports = enemyPickHeroes.filter(isSupportHero).length;

  const enemyCores = enemyPickHeroes.filter(isCoreHero).length;

  const candidateSupport = isSupportHero(hero);
  const candidateCore = isCoreHero(hero);

  /*
   * Target composition:
   *
   * 3 cores
   * 2 supports
   */

  const supportNeed = Math.max(0, 2 - enemySupports) / 2;

  const coreNeed = Math.max(0, 3 - enemyCores) / 3;

  let score = 0;

  if (candidateSupport) {
    score += supportNeed * 100;
  }

  if (candidateCore) {
    score += coreNeed * 100;
  }

  /*
   * Enemy bans are used as an additional signal.
   *
   * If the enemy has already banned several heroes
   * belonging to the same role as our candidate, that
   * role becomes more relevant to their draft intent.
   *
   * Example:
   *
   * Enemy Pick = Core
   * Enemy Bans = Support + Support
   *
   * Remaining strong Supports receive a threat boost.
   */

  if (enemyBanHeroes.length) {
    const bannedSupports = enemyBanHeroes.filter(isSupportHero).length;

    const bannedCores = enemyBanHeroes.filter(isCoreHero).length;

    if (candidateSupport && bannedSupports > 0) {
      const signal = Math.min(1, bannedSupports / enemyBanHeroes.length);

      score += signal * 35;
    }

    if (candidateCore && bannedCores > 0) {
      const signal = Math.min(1, bannedCores / enemyBanHeroes.length);

      score += signal * 35;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function calculateEnemySynergyThreat(hero, draftState, draftDataset) {
  const heroData = getHeroDataset(hero, draftDataset);

  if (!heroData?.with || !draftState?.enemyPicks?.length) {
    return 0;
  }

  const synergyValues = [];

  for (const enemyPick of draftState.enemyPicks) {
    const relation = heroData.with.get(Number(enemyPick.heroId));

    if (!relation) continue;

    synergyValues.push(Number(relation.synergy || 0));
  }

  if (!synergyValues.length) {
    return 0;
  }

  return Math.max(0, Math.min(100, average(synergyValues) * 10));
}

function calculateThreatAgainstOurTeam(hero, draftState, draftDataset) {
  const heroData = getHeroDataset(hero, draftDataset);

  if (!heroData?.vs || !draftState?.ourPicks?.length) {
    return 0;
  }

  const threatValues = [];

  for (const ourPick of draftState.ourPicks) {
    const relation = heroData.vs.get(Number(ourPick.heroId));

    if (!relation) continue;

    /*
     * heroId1 = candidate hero
     * heroId2 = our hero
     *
     * Therefore this is the candidate's win rate
     * against our current pick.
     */

    threatValues.push(Number(relation.winRateHeroId1 || 0));
  }

  if (!threatValues.length) {
    return 0;
  }

  return Math.max(0, Math.min(100, ((average(threatValues) - 45) / 10) * 100));
}

function calculateEnemyCompositionThreat(hero, draftState, draftDataset) {
  const heroData = getHeroDataset(hero, draftDataset);

  if (!heroData) {
    return 0;
  }

  const stun = Number(heroData.stats?.stunCount || 0);

  const disable = Number(heroData.stats?.disableCount || 0);

  const heroDamage = Number(heroData.stats?.heroDamage || 0);

  const towerDamage = Number(heroData.stats?.towerDamage || 0);

  const stunScore = Math.min(100, stun * 15);

  const disableScore = Math.min(100, disable * 15);

  /*
   * These are intentionally relative rather than
   * absolute values. The actual normalization can
   * be improved later with a larger dataset.
   */

  const heroDamageScore = heroDamage > 0 ? 60 : 0;

  const towerDamageScore = towerDamage > 0 ? 60 : 0;

  return (
    stunScore * 0.3 +
    disableScore * 0.3 +
    heroDamageScore * 0.2 +
    towerDamageScore * 0.2
  );
}

function calculateEnemyPlayerThreat(hero, draftSetup) {
  /*
   * We currently only know OUR configured player pools.
   *
   * Therefore this is intentionally kept separate from
   * enemy intent. It can later be replaced with actual
   * enemy player-pool data if available.
   */

  const configuredThreats = draftSetup?.teamThreats || [];

  const isConfiguredThreat = configuredThreats.some(
    (threat) =>
      Number(typeof threat === "object" ? threat.heroId : threat) ===
      Number(hero.id),
  );

  return isConfiguredThreat ? 100 : 0;
}

function calculateBanScore({
  hero,
  draftState,
  draftSetup,
  draftDataset,
  heroes,
}) {
  const heroData = getHeroDataset(hero, draftDataset);

  if (!heroData) {
    return {
      score: 0,
      breakdown: {
        meta: 0,
        enemyRoleNeed: 0,
        enemySynergy: 0,
        threatToOurTeam: 0,
        enemyComposition: 0,
        teamThreat: 0,
      },
    };
  }

  /*
   * 1. Meta
   */
  const metaScore = calculateBanMetaScore(hero, draftDataset);

  /*
   * 2. What role / function does the enemy
   * currently need?
   */
  const enemyRoleNeed = calculateEnemyRoleNeed(hero, draftState, heroes);

  /*
   * 3. How much better does this hero make
   * the enemy's existing picks?
   */
  const enemySynergy = calculateEnemySynergyThreat(
    hero,
    draftState,
    draftDataset,
  );

  /*
   * 4. How dangerous is this hero against
   * our current picks?
   */
  const threatToOurTeam = calculateThreatAgainstOurTeam(
    hero,
    draftState,
    draftDataset,
  );

  /*
   * 5. Does the hero add important tools
   * to the enemy composition?
   */
  const enemyComposition = calculateEnemyCompositionThreat(
    hero,
    draftState,
    draftDataset,
  );

  /*
   * 6. Explicit configured team threat.
   */
  const teamThreat = calculateEnemyPlayerThreat(hero, draftSetup);

  /*
   * Final BAN priority.
   *
   * Enemy intent is deliberately the largest component.
   *
   * The question is:
   *
   * "If we leave this hero available,
   * how much stronger could the enemy draft become?"
   */
  const score =
    metaScore * 0.15 +
    enemyRoleNeed * 0.25 +
    enemySynergy * 0.2 +
    threatToOurTeam * 0.15 +
    enemyComposition * 0.1 +
    teamThreat * 0.15;

  return {
    score,
    breakdown: {
      meta: metaScore,
      enemyRoleNeed,
      enemySynergy,
      threatToOurTeam,
      enemyComposition,
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
      heroes,
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
   * Explicit team threats remain a separate
   * category for now.
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
