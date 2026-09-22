import { useCallback, useEffect, useState } from "react";
import { getPlayer } from "../lib/api/stratz";

export function useAuth() {
  const [auth, setAuth] = useState({
    loading: true,
    authenticated: false,
    accountId: null,
    profile: null,
  });

  const loadAuth = useCallback(async () => {
    try {
      setAuth((current) => ({
        ...current,
        loading: true,
      }));

      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        throw new Error("Authentication check failed.");
      }

      const data = await response.json();

      if (!data.authenticated || !data.accountId) {
        setAuth({
          loading: false,
          authenticated: false,
          accountId: null,
          profile: null,
        });

        return;
      }

      const accountId = data.accountId;
      const profile = await getPlayer(accountId);

      setAuth({
        loading: false,
        authenticated: true,
        accountId,
        profile,
      });
    } catch (error) {
      console.error("Failed to load authentication state:", error);

      setAuth({
        loading: false,
        authenticated: false,
        accountId: null,
        profile: null,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setAuth({
        loading: false,
        authenticated: false,
        accountId: null,
        profile: null,
      });
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return {
    ...auth,
    refresh: loadAuth,
    logout,
  };
}
