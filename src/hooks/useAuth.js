import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [auth, setAuth] = useState({
    loading: true,
    authenticated: false,
    accountId: null,
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

      setAuth({
        loading: false,
        authenticated: Boolean(data.authenticated),
        accountId: data.accountId || null,
      });
    } catch (error) {
      console.error("Failed to load authentication state:", error);

      setAuth({
        loading: false,
        authenticated: false,
        accountId: null,
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
