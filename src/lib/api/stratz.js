import {
  GET_HEROES,
  GET_HERO,
  GET_HERO_META,
  GET_PLAYER,
  GET_PLAYER_OVERVIEW,
  GET_PLAYER_MATCHES,
  GET_DRAFT_DATA,
} from "./queries";

import {
  normalizeHeroes,
  normalizePlayer,
  normalizePlayerOverview,
  normalizePlayerMatches,
} from "./normalizers";

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

  const winStats = data.heroStats?.winDay || [];
  const banStats = data.heroStats?.banDay || [];

  // -----------------------------
  // Group 8-day win data by hero
  // -----------------------------
  const heroStatsMap = new Map();

  for (const stat of winStats) {
    const heroId = Number(stat.heroId);

    if (!heroId) {
      continue;
    }

    if (!heroStatsMap.has(heroId)) {
      heroStatsMap.set(heroId, []);
    }

    heroStatsMap.get(heroId).push({
      day: Number(stat.day),
      heroId,
      winCount: Number(stat.winCount || 0),
      matchCount: Number(stat.matchCount || 0),
    });
  }

  // -----------------------------
  // Aggregate 8-day hero stats
  // -----------------------------
  const heroAggregates = [];

  for (const [heroId, heroDays] of heroStatsMap) {
    const sortedDays = [...heroDays].sort((a, b) => a.day - b.day);

    const winCount = sortedDays.reduce((total, day) => total + day.winCount, 0);

    const matchCount = sortedDays.reduce(
      (total, day) => total + day.matchCount,
      0,
    );

    const latestDay = sortedDays[sortedDays.length - 1];

    heroAggregates.push({
      heroId,
      winCount,
      matchCount,
      day: latestDay?.day || 0,
      days: sortedDays,
    });
  }

  // -----------------------------
  // Ban data
  //
  // STRATZ currently requires heroId
  // for banDay. With heroId: 1 it
  // returns the hero rows we need.
  // -----------------------------
  const banCountMap = new Map();

  for (const stat of banStats) {
    const heroId = Number(stat.heroId);

    if (!heroId) {
      continue;
    }

    banCountMap.set(heroId, Number(stat.matchCount || 0));
  }

  // -----------------------------
  // Total games
  //
  // Every Dota match contributes
  // 10 hero picks.
  // -----------------------------
  const totalPicks = heroAggregates.reduce(
    (total, hero) => total + hero.matchCount,
    0,
  );

  const totalGames = totalPicks / 10;

  // -----------------------------
  // Final meta stats
  // -----------------------------
  return heroAggregates.map((hero) => {
    const banCount = banCountMap.get(hero.heroId) || 0;

    const winRate =
      hero.matchCount > 0 ? (hero.winCount / hero.matchCount) * 100 : 0;

    const pickRate = totalGames > 0 ? (hero.matchCount / totalGames) * 100 : 0;

    const banRate = totalGames > 0 ? (banCount / totalGames) * 100 : 0;

    const metaPresence =
      totalGames > 0 ? ((hero.matchCount + banCount) / totalGames) * 100 : 0;

    const metaImpact = winRate * banRate;

    return {
      heroId: hero.heroId,

      // Core stats
      winCount: hero.winCount,
      matchCount: hero.matchCount,
      winRate,
      pickRate,

      // Ban stats
      banCount,
      banRate,

      // Dominance Map stats
      metaPresence,
      metaImpact,

      // Trend data
      day: hero.day,
      days: hero.days,
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

export async function getPlayerOverview(steamAccountId) {
  const numericSteamAccountId = Number(steamAccountId);

  if (!Number.isSafeInteger(numericSteamAccountId)) {
    throw new Error("Invalid Steam account ID.");
  }

  const data = await requestStratz(GET_PLAYER_OVERVIEW, {
    steamAccountId: numericSteamAccountId,
  });

  return normalizePlayerOverview(data.player);
}

export async function getPlayerMatches(steamAccountId, filters = {}) {
  const numericSteamAccountId = Number(steamAccountId);

  if (!Number.isSafeInteger(numericSteamAccountId)) {
    throw new Error("Invalid Steam account ID.");
  }
  const request = {
    take: 100,
    positionIds: [],
    heroIds: [],
    gameModeIds: [],
    startDateTime: null,
    isParty: null,
  };

  // Position filter
  if (filters.positionIds?.length > 0) {
    request.positionIds = filters.positionIds;
  }

  // Hero filter
  if (filters.heroIds?.length > 0) {
    request.heroIds = filters.heroIds;
  }

  // Mode filter
  if (filters.mode === "SOLO") {
    request.isParty = false;
  }

  if (filters.mode === "PARTY") {
    request.isParty = true;
  }

  // Time filter
  const now = Math.floor(Date.now() / 1000);

  const timeRanges = {
    "1_MONTH": 30,
    "3_MONTH": 90,
    "6_MONTH": 180,
    "12_MONTH": 365,
  };

  if (timeRanges[filters.time]) {
    request.startDateTime = now - timeRanges[filters.time] * 24 * 60 * 60;
  }

  // Ranked only
  if (filters.rankedOnly) {
    request.gameModeIds = [
      // Ranked game modes
      1, 2, 4, 22,
    ];
  }

  const data = await requestStratz(GET_PLAYER_MATCHES, {
    steamAccountId: numericSteamAccountId,
    request,
  });

  return normalizePlayerMatches(data.player?.matches || []);
}

export async function getDraftData(bracket) {
  const allowedBrackets = [
    "HERALD_GUARDIAN",
    "CRUSADER_ARCHON",
    "LEGEND_ANCIENT",
    "DIVINE_IMMORTAL",
    "ALL",
  ];

  if (!allowedBrackets.includes(bracket)) {
    throw new Error("Invalid draft bracket.");
  }

  const data = await requestStratz(GET_DRAFT_DATA(bracket));

  return data.heroStats;
}
