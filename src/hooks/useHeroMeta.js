import { useEffect, useState } from "react";
import { getHeroMeta } from "../lib/api/stratz";

function normalizeValue(value, min, max) {
  if (max === min) {
    return 100;
  }

  return ((value - min) / (max - min)) * 100;
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

  const winRates = validStats.map((hero) => hero.winRate);

  const pickRates = validStats.map((hero) => hero.pickRate);

  const minWinRate = Math.min(...winRates);
  const maxWinRate = Math.max(...winRates);

  const minPickRate = Math.min(...pickRates);
  const maxPickRate = Math.max(...pickRates);

  const scoredStats = validStats.map((hero) => {
    const normalizedWinRate = normalizeValue(
      hero.winRate,
      minWinRate,
      maxWinRate,
    );

    const normalizedPickRate = normalizeValue(
      hero.pickRate,
      minPickRate,
      maxPickRate,
    );

    const metaScore = normalizedWinRate * 0.6 + normalizedPickRate * 0.4;

    return {
      ...hero,
      metaScore,
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
    heroId: Number(hero.heroId),
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
