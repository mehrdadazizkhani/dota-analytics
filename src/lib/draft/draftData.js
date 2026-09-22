export function buildDraftDataset(data, heroMeta = []) {
  const heroes = new Map();

  for (const stat of data?.stats || []) {
    const heroId = Number(stat.heroId);

    if (!heroId) {
      continue;
    }

    heroes.set(heroId, {
      heroId,

      stats: {
        winCount: Number(stat.winCount || 0),
        disableCount: Number(stat.disableCount || 0),
        stunCount: Number(stat.stunCount || 0),
        kDAAverage: Number(stat.kDAAverage || 0),
        killContributionAverage: Number(stat.killContributionAverage || 0),
      },

      meta: {
        winRate: 0,
        pickRate: 0,
        matchCount: 0,
      },

      with: new Map(),
      vs: new Map(),

      matchCountWith: 0,
      matchCountVs: 0,
    });
  }

  for (const meta of heroMeta) {
    const heroId = Number(meta.heroId);

    if (!heroId || !heroes.has(heroId)) {
      continue;
    }

    const hero = heroes.get(heroId);

    hero.meta = {
      winRate: Number(meta.winRate || 0),
      pickRate: Number(meta.pickRate || 0),
      matchCount: Number(meta.matchCount || 0),
    };
  }

  for (const matchup of data?.matchUp || []) {
    const heroId = Number(matchup?.heroId);

    if (!heroId || !heroes.has(heroId)) {
      continue;
    }

    const hero = heroes.get(heroId);

    hero.matchCountWith = Number(matchup.matchCountWith || 0);
    hero.matchCountVs = Number(matchup.matchCountVs || 0);

    for (const relation of matchup.with || []) {
      const otherHeroId = Number(relation?.heroId2);

      if (!otherHeroId) {
        continue;
      }

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

      if (!otherHeroId) {
        continue;
      }

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

  return { heroes };
}
