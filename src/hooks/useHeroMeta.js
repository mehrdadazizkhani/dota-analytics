import { useEffect, useState } from "react";
import { getHeroMeta } from "../lib/api/stratz";

function normalizeValue(value, min, max) {
  if (max === min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
}

function calculateMetaStats(stats) {
  if (!stats.length) {
    return [];
  }

  const winRates = stats.map((hero) => hero.winRate);
  const pickRates = stats.map((hero) => hero.pickRate);

  const minWinRate = Math.min(...winRates);
  const maxWinRate = Math.max(...winRates);

  const minPickRate = Math.min(...pickRates);
  const maxPickRate = Math.max(...pickRates);

  const scoredStats = stats.map((hero) => {
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

  const sortedStats = [...scoredStats].sort(
    (a, b) => b.metaScore - a.metaScore,
  );

  const metaHeroIds = new Set(
    sortedStats.slice(0, 20).map((hero) => hero.heroId),
  );

  return scoredStats.map((hero) => ({
    ...hero,
    isMeta: metaHeroIds.has(hero.heroId),
  }));
}

export function useHeroMeta() {
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
        const calculatedData = calculateMetaStats(data);

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

    loadMeta();

    return () => {
      active = false;
    };
  }, []);

  return {
    meta,
    loading,
    error,
  };
}
