import { useEffect, useState } from "react";
import { getPlayerOverview } from "../lib/api/stratz";

export function usePlayerOverview(accountId) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      if (!accountId) {
        setOverview(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getPlayerOverview(accountId);

        if (cancelled) {
          return;
        }

        setOverview(data);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setOverview(null);
        setError(requestError?.message || "Failed to load player overview.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  return {
    overview,
    loading,
    error,
  };
}
