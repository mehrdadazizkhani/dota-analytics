import { useMemo, useState } from "react";
import { useHeroes } from "../hooks/useHeroes";
import { useHeroMeta } from "../hooks/useHeroMeta";
import Widget from "../components/ui/Widget";
import MetaRatingChart from "../components/meta/MetaRatingChart";
import { getHeroAsset } from "../lib/assets/heroes";
import { Link } from "react-router-dom";

function formatPercent(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function formatMatches(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function SortButton({ label, active, direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-end gap-1 text-[8px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        active ? "text-white/60" : "text-white/20 hover:text-white/40"
      }`}
    >
      <span>{label}</span>
      {active && (
        <span className="text-[8px] text-red-400">
          {direction === "desc" ? "↓" : "↑"}
        </span>
      )}
    </button>
  );
}

function Meta() {
  const { heroes, loading: heroesLoading, error: heroesError } = useHeroes();
  const { meta, loading: metaLoading, error: metaError } = useHeroMeta(heroes);

  const [sortKey, setSortKey] = useState("rating");
  const [sortDirection, setSortDirection] = useState("desc");

  const loading = heroesLoading || metaLoading;
  const error = heroesError || metaError;

  const heroMap = useMemo(
    () => new Map(heroes.map((hero) => [Number(hero.id), hero])),
    [heroes],
  );

  const baseRows = useMemo(
    () =>
      [...meta]
        .map((item) => ({
          ...item,
          hero: heroMap.get(Number(item.heroId)),
        }))
        .filter((item) => item.hero),
    [meta, heroMap],
  );

  const ratingRows = useMemo(
    () =>
      [...baseRows].sort((a, b) => {
        if (b.metaScore !== a.metaScore) return b.metaScore - a.metaScore;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.matchCount - a.matchCount;
      }),
    [baseRows],
  );

  const rows = useMemo(
    () =>
      [...baseRows].sort((a, b) => {
        let result = 0;

        if (sortKey === "rating") result = a.metaScore - b.metaScore;
        if (sortKey === "winRate") result = a.winRate - b.winRate;
        if (sortKey === "pickRate") result = a.pickRate - b.pickRate;
        if (sortKey === "matches") result = a.matchCount - b.matchCount;

        if (result === 0) result = b.metaScore - a.metaScore;

        return sortDirection === "desc" ? -result : result;
      }),
    [baseRows, sortKey, sortDirection],
  );

  function handleSort(nextKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("desc");
  }

  return (
    <div className="pb-24">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-red-400" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Analytics
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Meta
        </h1>

        <p className="mt-1 text-[11px] text-white/30">
          Hero performance across the current meta.
        </p>
      </div>

      <Widget>
        {loading && (
          <div className="flex min-h-40 items-center justify-center">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/25">
              <span className="h-1 w-1 animate-pulse rounded-full bg-red-400" />
              Loading meta data...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <span className="mb-3 h-1.5 w-1.5 rounded-full bg-red-400" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Unable to load meta data
            </p>
            <p className="mt-1 text-[10px] text-white/25">
              STRATZ is temporarily unavailable. Please try again.
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <MetaRatingChart rows={ratingRows} />

            <div className="my-6 h-px bg-white/[0.05]" />

            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-red-400" />
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    Hero Meta
                  </h2>
                </div>
                <p className="mt-1 text-[9px] text-white/20">
                  {rows.length} heroes ranked by Rating
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[52px_minmax(220px,1fr)_110px_110px_110px_120px] items-center border-b border-white/[0.06] px-3 py-2">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">#</span>
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">Hero</span>
                  <SortButton label="Rating" active={sortKey === "rating"} direction={sortDirection} onClick={() => handleSort("rating")} />
                  <SortButton label="Win Rate" active={sortKey === "winRate"} direction={sortDirection} onClick={() => handleSort("winRate")} />
                  <SortButton label="Pick Rate" active={sortKey === "pickRate"} direction={sortDirection} onClick={() => handleSort("pickRate")} />
                  <SortButton label="Matches" active={sortKey === "matches"} direction={sortDirection} onClick={() => handleSort("matches")} />
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {rows.map((item, index) => {
                    const hero = item.hero;
                    const rank = index + 1;

                    return (
                      <Link
                        key={hero.id}
                        to={`/heroes/${hero.id}`}
                        className="grid grid-cols-[52px_minmax(220px,1fr)_110px_110px_110px_120px] items-center px-3 py-2.5 transition-colors hover:bg-white/[0.025]"
                      >
                        <span
                          className={`text-[10px] tabular-nums ${
                            rank <= 3 ? "font-semibold text-red-400" : "text-white/25"
                          }`}
                        >
                          {String(rank).padStart(2, "0")}
                        </span>

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded border border-white/[0.08] bg-white/[0.025]">
                            <img
                              src={getHeroAsset(hero, "portrait")}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[10px] font-medium text-white/75">
                              {hero.displayName || hero.name}
                            </div>
                            <div className="mt-0.5 truncate text-[8px] uppercase tracking-[0.08em] text-white/20">
                              {hero.shortName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-semibold tabular-nums text-white/80">
                            {item.metaScore.toFixed(2)}
                          </span>
                        </div>

                        <div className="text-right text-[10px] tabular-nums text-white/55">
                          {formatPercent(item.winRate)}
                        </div>
                        <div className="text-right text-[10px] tabular-nums text-white/55">
                          {formatPercent(item.pickRate)}
                        </div>
                        <div className="text-right text-[10px] tabular-nums text-white/35">
                          {formatMatches(item.matchCount)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </Widget>
    </div>
  );
}

export default Meta;
