import { useEffect, useState } from "react";
import { getPlayer } from "../lib/api/stratz";

export function usePlayer(accountId) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlayer() {
      if (!accountId) {
        setPlayer(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getPlayer(accountId);

        if (cancelled) {
          return;
        }

        setPlayer(data);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setPlayer(null);
        setError(requestError?.message || "Failed to load player data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlayer();

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  return {
    player,
    loading,
    error,
  };
}
