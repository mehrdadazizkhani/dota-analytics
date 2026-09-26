import { useEffect, useState } from "react";
import { getHeroMeta } from "../lib/api/stratz";

const WILSON_Z = 1.96;

function calculateWilsonScore(winCount, matchCount) {
  const n = Number(matchCount);
  const wins = Number(winCount);

  if (!n || n <= 0) {
    return 0;
  }

  const p = Math.min(1, Math.max(0, wins / n));
  const z2 = WILSON_Z * WILSON_Z;

  const denominator = 1 + z2 / n;

  const centre = p + z2 / (2 * n);

  const margin = WILSON_Z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);

  const score = (centre - margin) / denominator;

  return Math.max(0, Math.min(1, score));
}

function calculateChangeState(delta) {
  if (delta >= 2) {
    return "strongUp";
  }

  if (delta >= 0.25) {
    return "up";
  }

  if (delta <= -2) {
    return "strongDown";
  }

  if (delta <= -0.25) {
    return "down";
  }

  return "stable";
}

function calculateDailyRating(stat) {
  return calculateWilsonScore(stat.winCount, stat.matchCount) * 100;
}

function calculateMetaStats(stats, heroes) {
  if (!stats.length || !heroes.length) {
    return [];
  }

  const heroIds = new Set(heroes.map((hero) => Number(hero.id)));

  const validStats = stats.filter((hero) => heroIds.has(Number(hero.heroId)));

  if (!validStats.length) {
    return [];
  }

  const scoredStats = validStats.map((hero) => {
    const dailyStats = [...(hero.dailyStats || [])]
      .sort((a, b) => Number(a.day) - Number(b.day))
      .map((day) => ({
        ...day,
        rating: calculateDailyRating(day),
        winRate:
          day.matchCount > 0
            ? (day.winCount / day.matchCount) * 100
            : 0,
      }));

    const splitIndex = Math.floor(dailyStats.length / 2);

    const previousStats = dailyStats.slice(0, splitIndex);
    const currentStats = dailyStats.slice(splitIndex);

    const previousWins = previousStats.reduce(
      (total, day) => total + Number(day.winCount || 0),
      0,
    );

    const previousMatches = previousStats.reduce(
      (total, day) => total + Number(day.matchCount || 0),
      0,
    );

    const currentWins = currentStats.reduce(
      (total, day) => total + Number(day.winCount || 0),
      0,
    );

    const currentMatches = currentStats.reduce(
      (total, day) => total + Number(day.matchCount || 0),
      0,
    );

    const previousRating =
      calculateWilsonScore(previousWins, previousMatches) * 100;

    const currentRating =
      calculateWilsonScore(currentWins, currentMatches) * 100;

    const ratingChange = currentRating - previousRating;

    const metaScore =
      calculateWilsonScore(hero.winCount, hero.matchCount) * 100;

    return {
      ...hero,
      heroId: Number(hero.heroId),
      metaScore,
      previousRating,
      currentRating,
      ratingChange,
      changeState: calculateChangeState(ratingChange),
      dailyStats,
    };
  });

  const sortedStats = [...scoredStats].sort((a, b) => {
    if (b.metaScore !== a.metaScore) {
      return b.metaScore - a.metaScore;
    }

    if (b.winRate !== a.winRate) {
      return b.winRate - a.winRate;
    }

    return b.matchCount - a.matchCount;
  });

  const metaHeroIds = new Set(
    sortedStats.slice(0, 20).map((hero) => Number(hero.heroId)),
  );

  return scoredStats.map((hero) => ({
    ...hero,
    isMeta: metaHeroIds.has(Number(hero.heroId)),
  }));
}

export function useHeroMeta(heroes) {
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadMeta() {
      try {
        setLoading(true);
        setError(null);

        const data = await getHeroMeta();

        const calculatedData = calculateMetaStats(data, heroes);

        if (active) {
          setMeta(calculatedData);
        }
      } catch (err) {
        if (active) {
          setError(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (heroes.length > 0) {
      loadMeta();
    } else {
      setMeta([]);
      setLoading(true);
    }

    return () => {
      active = false;
    };
  }, [heroes]);

  return {
    meta,
    loading,
    error,
  };
}
