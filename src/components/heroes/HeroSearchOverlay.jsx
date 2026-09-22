import { useEffect, useRef, useState } from "react";
const FADE_DELAY = 900;
const FADE_DURATION = 350;
const CLEAR_AFTER_FADE = 0;
function HeroSearchOverlay({ search, setSearch }) {
  const [displayText, setDisplayText] = useState(search);
  const [isFading, setIsFading] = useState(false);
  const [isSearchSessionActive, setIsSearchSessionActive] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);
  const fadeTimerRef = useRef(null);
  const clearTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);
  useEffect(() => {
    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
    }
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
    }
    if (pulseTimerRef.current) {
      window.clearTimeout(pulseTimerRef.current);
    }
    if (!search) {
      setDisplayText("");
      setIsFading(false);
      setIsSearchSessionActive(true);
      setIsPulsing(false);
      return;
    }
    setDisplayText(search);
    setIsFading(false);
    setIsSearchSessionActive(true);
    setIsPulsing(true);
    pulseTimerRef.current = window.setTimeout(() => {
      setIsPulsing(false);
    }, 180);
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
      if (pulseTimerRef.current) {
        window.clearTimeout(pulseTimerRef.current);
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
      {" "}
      <div
        className={`relative select-none transition-all ease-out ${isFading ? "scale-[1.04] opacity-0 blur-[10px]" : isPulsing ? "scale-[1.015] opacity-100 blur-0" : "scale-100 opacity-100 blur-0"}`}
        style={{ transitionDuration: `${FADE_DURATION}ms` }}
        aria-hidden="true"
      >
        {" "}
        <div className="absolute inset-0 -z-10 scale-[0.8] bg-red-500/[0.035] blur-[70px]" />{" "}
        <div
          className="text-[11vw] font-bold leading-none tracking-[-0.07em] text-white/[0.2]"
          style={{
            textShadow:
              "0 0 35px rgba(239,68,68,0.08), 0 0 80px rgba(239,68,68,0.04)",
          }}
        >
          {" "}
          {displayText}{" "}
        </div>{" "}
        <div className="absolute -bottom-3 left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />{" "}
      </div>{" "}
    </div>
  );
}
export default HeroSearchOverlay;
