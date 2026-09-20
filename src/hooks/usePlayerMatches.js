import { useEffect, useState } from "react";
import { getPlayerMatches } from "../lib/api/stratz";

export function usePlayerMatches(accountId) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      if (!accountId) {
        setMatches([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getPlayerMatches(accountId);

        if (cancelled) {
          return;
        }

        setMatches(data);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setMatches([]);
        setError(requestError?.message || "Failed to load player matches.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  return {
    matches,
    loading,
    error,
  };
}
