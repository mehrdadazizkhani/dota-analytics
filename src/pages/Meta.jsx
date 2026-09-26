import { useMemo, useState } from "react";
import { useHeroes } from "../hooks/useHeroes";
import { useHeroMeta } from "../hooks/useHeroMeta";
import Widget from "../components/ui/Widget";
import MetaRatingChart from "../components/meta/MetaRatingChart";
import { getHeroAsset } from "../lib/assets/heroes";
import { Link } from "react-router-dom";

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function formatMatches(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function formatDay(day) {
  if (!Number.isFinite(day)) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(day * 1000));
}

const CHANGE_CONFIG = {
  strongUp: { icon: "↑↑", className: "text-emerald-400" },
  up: { icon: "↑", className: "text-emerald-300/70" },
  stable: { icon: "→", className: "text-white/25" },
  down: { icon: "↓", className: "text-red-300/70" },
  strongDown: { icon: "↓↓", className: "text-red-400" },
};

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

function RatingBar({ value }) {
  const width = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="w-11 shrink-0 text-right text-[10px] font-semibold tabular-nums text-white/80">
        {Number(value).toFixed(2)}
      </span>

      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-white/[0.045]">
        <div
          className="h-full rounded-sm bg-white/30 transition-all duration-300 group-hover:bg-white/50"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function RatingTrend({ item }) {
  const points = item.dailyStats || [];

  if (!points.length) {
    return null;
  }

  const width = 760;
  const height = 150;
  const padding = { top: 14, right: 18, bottom: 30, left: 44 };

  const values = points.map((point) => Number(point.rating));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 0.8);
  const chartMin = Math.max(0, minValue - range * 0.22);
  const chartMax = Math.min(100, maxValue + range * 0.22);
  const chartRange = Math.max(chartMax - chartMin, 0.001);

  const getX = (index) =>
    padding.left +
    (index / Math.max(points.length - 1, 1)) *
      (width - padding.left - padding.right);

  const getY = (value) =>
    padding.top +
    (1 - (value - chartMin) / chartRange) *
      (height - padding.top - padding.bottom);

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(
          Number(point.rating),
        )}`,
    )
    .join(" ");

  const areaPath = `${linePath} L ${getX(points.length - 1)} ${
    height - padding.bottom
  } L ${getX(0)} ${height - padding.bottom} Z`;

  const change =
    CHANGE_CONFIG[item.changeState] || CHANGE_CONFIG.stable;

  return (
    <div className="mt-4 rounded-lg border border-white/[0.05] bg-black/10 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Rating — Last 8 Days
          </div>
          <div className="mt-1 text-[8px] text-white/15">
            Daily Wilson rating · {points.length} days
          </div>
        </div>

        <div className="text-right">
          <div className="text-[8px] uppercase tracking-[0.12em] text-white/15">
            Movement
          </div>
          <div className={`mt-0.5 text-[10px] font-semibold tabular-nums ${change.className}`}>
            {change.icon} {item.ratingChange >= 0 ? "+" : ""}
            {item.ratingChange.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-white/[0.04] bg-black/20">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Hero rating over the last 8 days"
        >
          <defs>
            <linearGradient
              id={`metaTrendFill-${item.heroId}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="rgb(248 113 113)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="rgb(248 113 113)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2].map((index) => {
            const y =
              padding.top +
              (index / 2) * (height - padding.top - padding.bottom);
            const value =
              chartMax - (index / 2) * (chartMax - chartMin);

            return (
              <g key={index}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.045)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="8"
                  fontFamily="inherit"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={`url(#metaTrendFill-${item.heroId})`} />

          <path
            d={linePath}
            fill="none"
            stroke="rgba(248,113,113,0.72)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((point, index) => {
            const x = getX(index);
            const y = getY(Number(point.rating));
            const isLast = index === points.length - 1;

            return (
              <g key={`${point.day}-${point.heroId}`}>
                {isLast && (
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="rgba(248,113,113,0.12)"
                  />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={isLast ? 3.5 : 2.2}
                  fill={
                    isLast
                      ? "rgb(248 113 113)"
                      : "rgba(248,113,113,0.65)"
                  }
                />

                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="8"
                  fontFamily="inherit"
                >
                  {formatDay(point.day)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded border border-white/[0.04] bg-white/[0.015] px-2.5 py-2">
          <div className="text-[7px] uppercase tracking-[0.12em] text-white/15">
            Win Rate
          </div>
          <div className="mt-0.5 text-[10px] tabular-nums text-white/60">
            {formatPercent(item.winRate)}
          </div>
        </div>

        <div className="rounded border border-white/[0.04] bg-white/[0.015] px-2.5 py-2">
          <div className="text-[7px] uppercase tracking-[0.12em] text-white/15">
            Matches
          </div>
          <div className="mt-0.5 text-[10px] tabular-nums text-white/60">
            {formatMatches(item.matchCount)}
          </div>
        </div>

        <div className="rounded border border-white/[0.04] bg-white/[0.015] px-2.5 py-2">
          <div className="text-[7px] uppercase tracking-[0.12em] text-white/15">
            Current Rating
          </div>
          <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-white/80">
            {item.metaScore.toFixed(2)}
          </div>
        </div>
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
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[34px_52px_minmax(220px,1fr)_110px_190px_110px_110px_120px] items-center border-b border-white/[0.06] px-3 py-2">
                  <span />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">
                    #
                  </span>

                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">
                    Hero
                  </span>

                  <span className="text-right text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">
                    Change
                  </span>

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
                    const change =
                      CHANGE_CONFIG[item.changeState] || CHANGE_CONFIG.stable;
                    const isExpanded = expandedHeroId === hero.id;

                    return (
                      <div key={hero.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleExpanded(hero.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleExpanded(hero.id);
                            }
                          }}
                          className="group grid cursor-pointer grid-cols-[34px_52px_minmax(220px,1fr)_110px_190px_110px_110px_120px] items-center px-3 py-2.5 transition-colors hover:bg-white/[0.025]"
                        >
                          <div className="flex items-center">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                                isExpanded
                                  ? "border-white/[0.12] bg-white/[0.05] text-white/70"
                                  : "border-white/[0.06] text-white/25 group-hover:border-white/[0.12] group-hover:text-white/50"
                              }`}
                            >
                              <span className="text-[11px] leading-none">
                                {isExpanded ? "−" : "+"}
                              </span>
                            </span>
                          </div>

                          <span
                            className={`text-[10px] tabular-nums ${
                              rank <= 3
                                ? "font-semibold text-red-400"
                                : "text-white/25"
                            }`}
                          >
                            {String(rank).padStart(2, "0")}
                          </span>

                          <div className="flex min-w-0 items-center gap-3">
                            <Link
                              to={`/heroes/${hero.id}`}
                              onClick={(event) => event.stopPropagation()}
                              className="h-8 w-8 shrink-0 overflow-hidden rounded border border-white/[0.08] bg-white/[0.025]"
                            >
                              <img
                                src={getHeroAsset(hero, "portrait")}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </Link>

                            <div className="min-w-0">
                              <Link
                                to={`/heroes/${hero.id}`}
                                onClick={(event) => event.stopPropagation()}
                                className="block truncate text-[10px] font-medium text-white/75 hover:text-white"
                              >
                                {hero.displayName || hero.name}
                              </Link>

                              <div className="mt-0.5 truncate text-[8px] uppercase tracking-[0.08em] text-white/20">
                                {hero.shortName}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className={`text-[12px] font-semibold leading-none ${change.className}`}
                            >
                              {change.icon}
                            </span>
                            <span
                              className={`text-[9px] tabular-nums ${change.className}`}
                            >
                              {item.ratingChange >= 0 ? "+" : ""}
                              {item.ratingChange.toFixed(2)}
                            </span>
                          </div>

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

                        {isExpanded && (
                          <div className="border-t border-white/[0.04] bg-black/10 px-3 pb-4 pl-[86px] pr-3">
                            <RatingTrend item={item} />
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
