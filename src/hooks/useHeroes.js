import { useCallback, useEffect, useState } from "react";
import { getHeroes } from "../lib/api/stratz";

export function useHeroes() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHeroes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getHeroes();

      setHeroes(data);
    } catch (err) {
      console.error("Failed to load heroes:", err);

      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHeroes();
  }, [loadHeroes]);

  return {
    heroes,
    loading,
    error,
    retry: loadHeroes,
  };
}
