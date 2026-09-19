import { GraphQLClient } from "graphql-request";
import { GET_HEROES, GET_HERO, GET_HERO_META } from "./queries";

const STRATZ_API_URL = "https://api.stratz.com/graphql";

const stratzClient = new GraphQLClient(STRATZ_API_URL, {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_STRATZ_API_KEY}`,
    "User-Agent": "STRATZ_API",
  },
});

export async function getHeroes() {
  const data = await stratzClient.request(GET_HEROES);

  return data.constants.heroes;
}

export async function getHero(heroId) {
  const data = await stratzClient.request(GET_HERO, { heroId });

  return data.constants.hero;
}

export async function getHeroMeta() {
  const data = await stratzClient.request(GET_HERO_META);

  const stats = data.heroStats?.winDay || [];

  console.log("getHeroMeta raw:", stats.length);

  const heroStatsMap = new Map();

  for (const stat of stats) {
    const heroId = Number(stat.heroId);

    if (!heroId) {
      continue;
    }

    const existing = heroStatsMap.get(heroId);

    if (existing) {
      existing.winCount += Number(stat.winCount || 0);

      existing.matchCount += Number(stat.matchCount || 0);
    } else {
      heroStatsMap.set(heroId, {
        heroId,
        winCount: Number(stat.winCount || 0),
        matchCount: Number(stat.matchCount || 0),
      });
    }
  }

  const aggregatedStats = Array.from(heroStatsMap.values());

  console.log("getHeroMeta aggregated:", aggregatedStats.length);

  const totalMatches = aggregatedStats.reduce(
    (total, hero) => total + hero.matchCount,
    0,
  );

  const result = aggregatedStats.map((hero) => {
    const winRate =
      hero.matchCount > 0 ? (hero.winCount / hero.matchCount) * 100 : 0;

    const pickRate =
      totalMatches > 0 ? (hero.matchCount / totalMatches) * 100 : 0;

    return {
      heroId: hero.heroId,
      winCount: hero.winCount,
      matchCount: hero.matchCount,
      winRate,
      pickRate,
    };
  });

  console.log("getHeroMeta result:", result.length);

  return result;
}
