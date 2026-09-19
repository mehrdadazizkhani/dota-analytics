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

  const totalMatches = stats.reduce(
    (total, hero) => total + Number(hero.matchCount || 0),
    0,
  );

  return stats.map((hero) => {
    const matchCount = Number(hero.matchCount || 0);

    const winCount = Number(hero.winCount || 0);

    const winRate = matchCount > 0 ? (winCount / matchCount) * 100 : 0;

    const pickRate = totalMatches > 0 ? (matchCount / totalMatches) * 100 : 0;

    return {
      heroId: hero.heroId,
      winCount,
      matchCount,
      winRate,
      pickRate,
    };
  });
}
