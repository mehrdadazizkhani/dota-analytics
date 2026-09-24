export function buildDraftDataset(data) {
  const heroes = new Map();

  const stats = data?.stats || [];
  const matchUps = data?.matchUp || [];

  const totalMatches = stats.reduce(
    (sum, stat) => sum + Number(stat.matchCount || 0),
    0,
  );

  for (const stat of stats) {
    const heroId = Number(stat.heroId);
    if (!heroId) continue;

    const matchCount = Number(stat.matchCount || 0);
    const winCount = Number(stat.winCount || 0);

    heroes.set(heroId, {
      heroId,

      stats: {
        matchCount,
        winCount,

        winRate: matchCount > 0 ? (winCount / matchCount) * 100 : 0,

        pickRate: totalMatches > 0 ? (matchCount / totalMatches) * 100 : 0,

        topCore: Number(stat.topCore || 0),
        topSupport: Number(stat.topSupport || 0),

        disableCount: Number(stat.disableCount || 0),
        slowCount: Number(stat.slowCount || 0),
        stunCount: Number(stat.stunCount || 0),

        kills: Number(stat.kills || 0),
        deaths: Number(stat.deaths || 0),
        assists: Number(stat.assists || 0),

        networth: Number(stat.networth || 0),
        heroDamage: Number(stat.heroDamage || 0),
        towerDamage: Number(stat.towerDamage || 0),

        campsStacked: Number(stat.campsStacked || 0),
        supportGold: Number(stat.supportGold || 0),
      },

      meta: {
        winRate: matchCount > 0 ? (winCount / matchCount) * 100 : 0,

        pickRate: totalMatches > 0 ? (matchCount / totalMatches) * 100 : 0,

        matchCount,
      },

      with: new Map(),
      vs: new Map(),

      matchCountWith: 0,
      matchCountVs: 0,
    });
  }

  for (const matchup of matchUps) {
    const heroId = Number(matchup?.heroId);
    if (!heroId || !heroes.has(heroId)) continue;

    const hero = heroes.get(heroId);

    hero.matchCountWith = Number(matchup.matchCountWith || 0);
    hero.matchCountVs = Number(matchup.matchCountVs || 0);

    for (const relation of matchup.with || []) {
      const otherHeroId = Number(relation?.heroId2);
      if (!otherHeroId) continue;

      hero.with.set(otherHeroId, {
        heroId1: Number(relation.heroId1),
        heroId2: otherHeroId,
        winRateHeroId1: Number(relation.winRateHeroId1 || 0),
        winRateHeroId2: Number(relation.winRateHeroId2 || 0),
        matchCount: Number(relation.matchCount || 0),
        winCount: Number(relation.winCount || 0),
        winsAverage: Number(relation.winsAverage || 0),
        synergy: Number(relation.synergy || 0),
      });
    }

    for (const relation of matchup.vs || []) {
      const otherHeroId = Number(relation?.heroId2);
      if (!otherHeroId) continue;

      hero.vs.set(otherHeroId, {
        heroId1: Number(relation.heroId1),
        heroId2: otherHeroId,
        winRateHeroId1: Number(relation.winRateHeroId1 || 0),
        winRateHeroId2: Number(relation.winRateHeroId2 || 0),
        matchCount: Number(relation.matchCount || 0),
        winCount: Number(relation.winCount || 0),
        winsAverage: Number(relation.winsAverage || 0),
        synergy: Number(relation.synergy || 0),
      });
    }
  }

  return {
    heroes,
    totalMatches,
  };
}
