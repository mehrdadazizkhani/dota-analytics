import { useEffect, useState } from "react";
import { getHeroes } from "../lib/api/stratz";

export function useHeroes() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHeroes() {
      try {
        setLoading(true);
        setError(null);

        const data = await getHeroes();

        if (!cancelled) {
          setHeroes(data);
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

    loadHeroes();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    heroes,
    loading,
    error,
  };
}
