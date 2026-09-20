import { GET_HEROES, GET_HERO, GET_HERO_META, GET_PLAYER } from "./queries";

import { normalizeHeroes, normalizePlayer } from "./normalizers";

async function requestStratz(query, variables = {}) {
  const response = await fetch("/api/stratz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "STRATZ request failed.");
  }

  if (data.errors?.length) {
    throw new Error(
      data.errors[0]?.message || "STRATZ GraphQL request failed.",
    );
  }

  return data.data;
}

export async function getHeroes() {
  const data = await requestStratz(GET_HEROES);

  return normalizeHeroes(data.constants.heroes);
}

export async function getHero(heroId) {
  const data = await requestStratz(GET_HERO, { heroId });

  return data.constants.hero;
}

export async function getHeroMeta() {
  const data = await requestStratz(GET_HERO_META);

  const stats = data.heroStats?.winDay || [];
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

  const totalMatches = aggregatedStats.reduce(
    (total, hero) => total + hero.matchCount,
    0,
  );

  return aggregatedStats.map((hero) => {
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
}

export async function getPlayer(steamAccountId) {
  const numericSteamAccountId = Number(steamAccountId);

  if (!Number.isSafeInteger(numericSteamAccountId)) {
    throw new Error("Invalid Steam account ID.");
  }

  const data = await requestStratz(GET_PLAYER, {
    steamAccountId: numericSteamAccountId,
  });

  return normalizePlayer(data.player);
}
