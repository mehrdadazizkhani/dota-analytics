import { useEffect, useRef, useState } from "react";

const FADE_DELAY = 1000;
const FADE_DURATION = 500;
const CLEAR_AFTER_FADE = 500;

function HeroSearchOverlay({ search, setSearch }) {
  const [displayText, setDisplayText] = useState(search);
  const [isFading, setIsFading] = useState(false);
  const [isSearchSessionActive, setIsSearchSessionActive] = useState(true);

  const fadeTimerRef = useRef(null);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
    }

    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
    }

    if (!search) {
      setDisplayText("");
      setIsFading(false);
      setIsSearchSessionActive(true);
      return;
    }

    setDisplayText(search);
    setIsFading(false);
    setIsSearchSessionActive(true);

    fadeTimerRef.current = window.setTimeout(() => {
      setIsFading(true);

      clearTimerRef.current = window.setTimeout(() => {
        setDisplayText("");
        setIsSearchSessionActive(false);
      }, FADE_DURATION + CLEAR_AFTER_FADE);
    }, FADE_DELAY);

    return () => {
      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
      }

      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!window.matchMedia("(min-width: 768px)").matches) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "Escape") {
        if (search) {
          event.preventDefault();
          setSearch("");
        }

        return;
      }

      if (event.key === "Backspace") {
        if (search && isSearchSessionActive) {
          event.preventDefault();
          setSearch(search.slice(0, -1));
        }

        return;
      }

      if (event.key.length === 1) {
        event.preventDefault();

        if (isSearchSessionActive) {
          setSearch(`${search}${event.key}`);
        } else {
          setSearch(event.key);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [search, setSearch, isSearchSessionActive]);

  if (!displayText) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center md:flex">
      <div
        className={`select-none text-[12vw] font-bold tracking-[-0.06em] text-white/[0.6] transition-[opacity,filter] ease-out ${
          isFading ? "opacity-0 blur-[4px]" : "opacity-100 blur-0"
        }`}
        style={{
          transitionDuration: `${FADE_DURATION}ms`,
        }}
        aria-hidden="true"
      >
        {displayText}
      </div>
    </div>
  );
}

export default HeroSearchOverlay;
