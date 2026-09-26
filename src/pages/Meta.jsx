import { useMemo, useState } from "react";
import { useHeroes } from "../hooks/useHeroes";
import { useHeroMeta } from "../hooks/useHeroMeta";
import Widget from "../components/ui/Widget";
import MetaRatingChart from "../components/meta/MetaRatingChart";
import { getHeroAsset } from "../lib/assets/heroes";

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function formatMatches(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function formatChange(value) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.01) {
    return "0.00";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
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

function ChangeIndicator({ state, value }) {
  const config = {
    strongUp: {
      symbol: "↑↑",
      className: "text-emerald-400",
    },
    up: {
      symbol: "↑",
      className: "text-emerald-400/80",
    },
    stable: {
      symbol: "→",
      className: "text-white/25",
    },
    down: {
      symbol: "↓",
      className: "text-red-400/80",
    },
    strongDown: {
      symbol: "↓↓",
      className: "text-red-400",
    },
  };

  const current = config[state] || config.stable;

  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className={`text-[10px] font-semibold ${current.className}`}>
        {current.symbol}
      </span>

      <span className={`text-[9px] tabular-nums ${current.className}`}>
        {formatChange(value)}
      </span>
    </div>
  );
}

function RatingBar({ value }) {
  const width = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-red-400/70"
          style={{ width: `${width}%` }}
        />
      </div>

      <span className="w-10 text-right text-[10px] font-semibold tabular-nums text-white/80">
        {Number(value || 0).toFixed(2)}
      </span>
    </div>
  );
}

function formatTrendDate(timestamp) {
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function TrendChart({ trend }) {
  if (!trend?.length) {
    return (
      <div className="flex h-28 items-center justify-center text-[9px] uppercase tracking-[0.14em] text-white/20">
        No trend data
      </div>
    );
  }

  const values = trend.map((item) => item.rating);

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const padding = Math.max(0.5, (maxValue - minValue) * 0.25);

  const minY = minValue - padding;
  const maxY = maxValue + padding;
  const range = maxY - minY || 1;

  const points = trend.map((item, index) => {
    const x = trend.length === 1 ? 50 : (index / (trend.length - 1)) * 100;

    const y = 100 - ((item.rating - minY) / range) * 100;

    return {
      ...item,
      x,
      y,
    };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  const areaPoints = [
    `0,100`,
    ...points.map((point) => `${point.x},${point.y}`),
    `100,100`,
  ].join(" ");

  return (
    <div className="mt-4">
      <div className="relative h-32">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <polygon points={areaPoints} fill="rgba(248,113,113,0.06)" />

          <polyline
            points={linePoints}
            fill="none"
            stroke="rgba(248,113,113,0.9)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((point) => (
            <circle
              key={point.day}
              cx={point.x}
              cy={point.y}
              r="1.8"
              fill="rgb(248,113,113)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="absolute inset-x-0 bottom-0 flex justify-between pt-2">
          {trend.map((item) => (
            <span key={item.day} className="text-[8px] text-white/20">
              {formatTrendDate(item.day)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[8px] uppercase tracking-[0.14em] text-white/20">
          8-day Rating
        </span>

        <span className="text-[9px] tabular-nums text-white/30">
          {minValue.toFixed(2)} — {maxValue.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function Meta() {
  const { heroes, loading: heroesLoading, error: heroesError } = useHeroes();

  const { meta, loading: metaLoading, error: metaError } = useHeroMeta(heroes);

  const [sortKey, setSortKey] = useState("rating");
  const [sortDirection, setSortDirection] = useState("desc");

  const [expandedHeroId, setExpandedHeroId] = useState(null);

  const loading = heroesLoading || metaLoading;
  const error = heroesError || metaError;

  const heroMap = useMemo(
    () => new Map(heroes.map((hero) => [Number(hero.id), hero])),
    [heroes],
  );

  const rows = useMemo(() => {
    const baseRows = [...meta]
      .map((item) => ({
        ...item,
        hero: heroMap.get(Number(item.heroId)),
      }))
      .filter((item) => item.hero);

    return baseRows.sort((a, b) => {
      let result = 0;

      if (sortKey === "rating") {
        result = a.metaScore - b.metaScore;
      }

      if (sortKey === "change") {
        result = a.change - b.change;
      }

      if (sortKey === "winRate") {
        result = a.winRate - b.winRate;
      }

      if (sortKey === "pickRate") {
        result = a.pickRate - b.pickRate;
      }

      if (sortKey === "matches") {
        result = a.matchCount - b.matchCount;
      }

      if (result === 0) {
        result = b.metaScore - a.metaScore;
      }

      return sortDirection === "desc" ? -result : result;
    });
  }, [meta, heroMap, sortKey, sortDirection]);

  function handleSort(nextKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("desc");
  }

  function toggleExpanded(heroId) {
    setExpandedHeroId((current) => (current === heroId ? null : heroId));
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
            <MetaRatingChart rows={rows} />

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
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[40px_52px_minmax(210px,1fr)_110px_120px_110px_110px_120px] items-center border-b border-white/[0.06] px-3 py-2">
                  <span className="text-[8px] text-white/20">+</span>

                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">
                    #
                  </span>

                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">
                    Hero
                  </span>

                  <SortButton
                    label="Change"
                    active={sortKey === "change"}
                    direction={sortDirection}
                    onClick={() => handleSort("change")}
                  />

                  <SortButton
                    label="Rating"
                    active={sortKey === "rating"}
                    direction={sortDirection}
                    onClick={() => handleSort("rating")}
                  />

                  <SortButton
                    label="Win Rate"
                    active={sortKey === "winRate"}
                    direction={sortDirection}
                    onClick={() => handleSort("winRate")}
                  />

                  <SortButton
                    label="Pick Rate"
                    active={sortKey === "pickRate"}
                    direction={sortDirection}
                    onClick={() => handleSort("pickRate")}
                  />

                  <SortButton
                    label="Matches"
                    active={sortKey === "matches"}
                    direction={sortDirection}
                    onClick={() => handleSort("matches")}
                  />
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {rows.map((item, index) => {
                    const hero = item.hero;
                    const rank = index + 1;
                    const expanded = expandedHeroId === Number(hero.id);

                    return (
                      <div
                        key={hero.id}
                        onClick={() => toggleExpanded(Number(hero.id))}
                        className="cursor-pointer"
                      >
                        <div className="grid grid-cols-[40px_52px_minmax(210px,1fr)_110px_120px_110px_110px_120px] items-center px-3 py-2.5 transition-colors hover:bg-white/[0.025]">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(Number(hero.id))}
                            className="flex h-6 w-6 items-center justify-start text-[13px] text-white/30 transition-colors hover:text-white/70"
                          >
                            {expanded ? "−" : "+"}
                          </button>

                          <div
                            className={`text-[10px] tabular-nums ${
                              rank <= 3
                                ? "font-semibold text-red-400"
                                : "text-white/25"
                            }`}
                          >
                            {String(rank).padStart(2, "0")}
                          </div>

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

                          <ChangeIndicator
                            state={item.changeState}
                            value={item.change}
                          />

                          <RatingBar value={item.metaScore} />

                          <div className="text-right text-[10px] tabular-nums text-white/55">
                            {formatPercent(item.winRate)}
                          </div>

                          <div className="text-right text-[10px] tabular-nums text-white/55">
                            {formatPercent(item.pickRate)}
                          </div>

                          <div className="text-right text-[10px] tabular-nums text-white/35">
                            {formatMatches(item.matchCount)}
                          </div>
                        </div>

                        {expanded && (
                          <div className="border-t border-white/[0.04] bg-white/[0.012] px-6 py-4">
                            <div className="mb-2 flex items-center justify-between">
                              <div>
                                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                                  Rating Trend
                                </div>

                                <div className="mt-1 text-[8px] text-white/20">
                                  {hero.displayName || hero.name}
                                  {" · "}8 days
                                </div>
                              </div>

                              <div className="text-right">
                                <div
                                  className={`text-[11px] font-semibold ${
                                    item.change > 0
                                      ? "text-emerald-400"
                                      : item.change < 0
                                        ? "text-red-400"
                                        : "text-white/30"
                                  }`}
                                >
                                  {formatChange(item.change)}
                                </div>

                                <div className="text-[8px] uppercase tracking-[0.12em] text-white/20">
                                  change
                                </div>
                              </div>
                            </div>

                            <TrendChart trend={item.trend} />
                          </div>
                        )}
                      </div>
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
