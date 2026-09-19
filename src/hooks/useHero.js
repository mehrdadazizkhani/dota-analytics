import { useEffect, useState } from "react";
import { getHero } from "../lib/api/stratz";

export function useHero(heroId) {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHero() {
      try {
        setLoading(true);
        setError(null);

        const data = await getHero(Number(heroId));

        if (!cancelled) {
          setHero(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (heroId) {
      loadHero();
    }

    return () => {
      cancelled = true;
    };
  }, [heroId]);

  return {
    hero,
    loading,
    error,
  };
}
