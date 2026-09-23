const POSITION_WEIGHTS = {
  1: {
    kill: 1.5,
    assist: 0.75,
    death: 1.5,
  },

  2: {
    kill: 1.5,
    assist: 0.75,
    death: 1.5,
  },

  3: {
    kill: 1.25,
    assist: 1,
    death: 1.5,
  },

  4: {
    kill: 0.75,
    assist: 1.25,
    death: 1,
  },

  5: {
    kill: 0.75,
    assist: 1.5,
    death: 1,
  },
};

const DEFAULT_WEIGHTS = {
  kill: 1,
  assist: 1,
  death: 1,
};

function calculateImpact(player) {
  const kills = player.kills || 0;
  const deaths = player.deaths || 0;
  const assists = player.assists || 0;

  const damage = player.heroDamage || 0;
  const healing = player.heroHealing || 0;
  const gpm = player.goldPerMinute || 0;

  const position = player.position;

  const isSupport = position === "POSITION_4" || position === "POSITION_5";

  let impact;

  if (isSupport) {
    impact =
      kills * 1 + assists * 1.8 + healing / 1500 + damage / 5000 - deaths * 1;
  } else {
    impact =
      kills * 2 + assists * 0.7 + damage / 3000 + gpm / 200 - deaths * 1.8;
  }

  return Number(impact.toFixed(1));
}

function calculatePerformanceScore(player) {
  const kills = player.kills || 0;
  const deaths = player.deaths || 0;
  const assists = player.assists || 0;

  const combat =
    kills * 2 + assists + (player.heroDamage || 0) / 3000 - deaths * 2;

  const economy =
    (player.goldPerMinute || 0) / 10 +
    (player.networth || 0) / 1000 +
    (player.numLastHits || 0) / 20;

  const objective = (player.towerDamage || 0) / 500;

  let roleContribution = 0;

  const position = player.position;

  // Core
  if (
    position === "POSITION_1" ||
    position === "POSITION_2" ||
    position === "POSITION_3"
  ) {
    roleContribution = kills * 2 + (player.heroDamage || 0) / 3000;
  }

  // Support
  else {
    roleContribution = assists * 1.5 + (player.heroHealing || 0) / 1000;
  }

  const winBonus = player.isVictory ? 10 : 0;

  const raw =
    combat * 0.35 +
    economy * 0.25 +
    objective * 0.15 +
    roleContribution * 0.15 +
    winBonus * 0.1;

  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function getPlayerPerformanceData(matches) {
  if (!Array.isArray(matches)) {
    return [];
  }

  return [...matches]
    .reverse()
    .map((match) => {
      const player = match?.player;

      if (!player) {
        return null;
      }

      return {
        matchId: match.id,

        startDateTime: match.startDateTime,

        hero: player.hero,

        numLastHits: Number(player.numLastHits || 0),

        numDenies: Number(player.numDenies || 0),

        goldPerMinute: Number(player.goldPerMinute || 0),

        networth: Number(player.networth || 0),

        experiencePerMinute: Number(player.experiencePerMinute || 0),

        heroDamage: Number(player.heroDamage || 0),

        towerDamage: Number(player.towerDamage || 0),

        heroHealing: Number(player.heroHealing || 0),

        impact: calculateImpact(player),

        performanceScore: calculatePerformanceScore(player),
      };
    })
    .filter(Boolean);
}

export function getPerformanceSeries(matches) {
  const data = getPlayerPerformanceData(matches);

  return {
    lastHits: data.map((match) => match.numLastHits),
    denies: data.map((match) => match.numDenies),
    gpm: data.map((match) => match.goldPerMinute),
    networth: data.map((match) => match.networth),
    xpm: data.map((match) => match.experiencePerMinute),
    heroDamage: data.map((match) => match.heroDamage),
    towerDamage: data.map((match) => match.towerDamage),
    heroHealing: data.map((match) => match.heroHealing),
    impact: data.map((match) => match.impact),
  };
}

export function getPerformanceTrends(matches) {
  const data = getPlayerPerformanceData(matches);

  if (data.length < 2) {
    return {};
  }

  const midpoint = Math.floor(data.length / 2);

  const previousMatches = data.slice(0, midpoint);
  const recentMatches = data.slice(midpoint);

  const metrics = [
    {
      key: "numLastHits",
      higherIsBetter: true,
    },
    {
      key: "numDenies",
      higherIsBetter: true,
    },
    {
      key: "goldPerMinute",
      higherIsBetter: true,
    },
    {
      key: "networth",
      higherIsBetter: true,
    },
    {
      key: "experiencePerMinute",
      higherIsBetter: true,
    },
    {
      key: "heroDamage",
      higherIsBetter: true,
    },
    {
      key: "towerDamage",
      higherIsBetter: true,
    },
    {
      key: "heroHealing",
      higherIsBetter: true,
    },
    {
      key: "impact",
      higherIsBetter: true,
    },
  ];

  const getAverage = (items, key) => {
    if (!items.length) {
      return 0;
    }

    const total = items.reduce((sum, item) => {
      return sum + Number(item[key] || 0);
    }, 0);

    return total / items.length;
  };

  return metrics.reduce((result, metric) => {
    const previousAverage = getAverage(previousMatches, metric.key);

    const recentAverage = getAverage(recentMatches, metric.key);

    let changePercent = 0;

    if (previousAverage !== 0) {
      changePercent =
        ((recentAverage - previousAverage) / Math.abs(previousAverage)) * 100;
    }

    const effectiveChange = metric.higherIsBetter
      ? changePercent
      : -changePercent;

    let trend = "stable";

    if (effectiveChange > 3) {
      trend = "up";
    } else if (effectiveChange < -3) {
      trend = "down";
    }

    result[metric.key] = {
      previousAverage,
      recentAverage,
      changePercent,
      trend,
    };

    return result;
  }, {});
}
