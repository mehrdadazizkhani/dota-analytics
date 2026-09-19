import { useEffect, useState } from "react";

const STORAGE_KEY = "dota-analytics-theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme) {
    return savedTheme;
  }

  return "system";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

      root.classList.toggle("dark", resolvedTheme === "dark");
      root.dataset.theme = resolvedTheme;
    };

    applyTheme();

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return {
    theme,
    setTheme: changeTheme,
  };
}
