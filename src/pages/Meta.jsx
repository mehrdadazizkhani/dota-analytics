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

function TrendChart({ trend, change }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!trend?.length) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-white/[0.05] bg-black/20 text-[9px] uppercase tracking-[0.14em] text-white/20">
        No trend data
      </div>
    );
  }

  const values = trend.map((item) => Number(item.rating));

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const currentValue = values[values.length - 1];
  const startValue = values[0];

  const spread = maxValue - minValue;

  const chartPadding = Math.max(spread * 0.35, 0.12);

  const minY = Math.max(0, minValue - chartPadding);
  const maxY = maxValue + chartPadding;
  const range = Math.max(maxY - minY, 0.001);

  const width = 2000;
  const height = 300;

  const padding = {
    top: 28,
    right: 0,
    bottom: 42,
    left: 0,
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const points = trend.map((item, index) => {
    const x =
      trend.length === 1
        ? width / 2
        : padding.left + (index / (trend.length - 1)) * plotWidth;

    const y = padding.top + (1 - (item.rating - minY) / range) * plotHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const linePath = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];

      const controlX = previous.x + (point.x - previous.x) * 0.5;

      return `
        C ${controlX} ${previous.y},
          ${controlX} ${point.y},
          ${point.x} ${point.y}
      `;
    })
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${padding.top + plotHeight}
    L ${points[0].x} ${padding.top + plotHeight}
    Z
  `;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  const changePositive = Number(change) > 0;
  const changeNegative = Number(change) < 0;

  const changeClass = changePositive
    ? "text-emerald-400"
    : changeNegative
      ? "text-red-400"
      : "text-white/35";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.055] bg-[#08090b]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.045] px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-red-400" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
              8 Day Rating
            </span>
          </div>

          <div className="mt-1 text-[8px] text-white/20">
            Daily meta rating movement
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative pt-3">
        <div className="relative h-48 w-full overflow-visible rounded-lg bg-white/[0.012]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient
                id="ratingAreaGradient"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="rgb(248 113 113)"
                  stopOpacity="0.20"
                />

                <stop
                  offset="100%"
                  stopColor="rgb(248 113 113)"
                  stopOpacity="0"
                />
              </linearGradient>

              <filter
                id="ratingGlow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="5" result="blur" />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal grid */}
            {[0, 1, 2, 3].map((index) => {
              const ratio = index / 3;

              const y = padding.top + ratio * plotHeight;

              const value = maxY - ratio * (maxY - minY);

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
                </g>
              );
            })}

            {/* Vertical guides */}
            {points.map((point, index) => (
              <line
                key={`guide-${index}`}
                x1={point.x}
                x2={point.x}
                y1={padding.top}
                y2={padding.top + plotHeight}
                stroke="rgba(255,255,255,0.025)"
                strokeWidth="1"
              />
            ))}

            {/* Area */}
            <path d={areaPath} fill="url(#ratingAreaGradient)" />

            {/* Glow line */}
            <path
              d={linePath}
              fill="none"
              stroke="rgb(248 113 113)"
              strokeOpacity="0.22"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ratingGlow)"
            />

            {/* Main line */}
            <path
              d={linePath}
              fill="none"
              stroke="rgb(248 113 113)"
              strokeOpacity="0.95"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((point, index) => {
              const active = hoveredIndex === index;
              const latest = index === points.length - 1;

              return (
                <g
                  key={point.day}
                  onPointerEnter={() => setHoveredIndex(index)}
                  onPointerLeave={() => setHoveredIndex(null)}
                  className="cursor-crosshair"
                >
                  {/* Invisible hit area */}
                  <circle cx={point.x} cy={point.y} r="18" fill="transparent" />

                  {/* Latest halo */}
                  {latest && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="9"
                      fill={
                        index === points.length - 1
                          ? "rgb(248 113 113)"
                          : "#08090b"
                      }
                      stroke="rgb(248 113 113)"
                      strokeOpacity="0.20"
                      strokeWidth="4"
                    />
                  )}

                  {/* Point */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={active || latest ? 4 : 2.5}
                    fill="#08090b"
                    stroke="rgb(248 113 113)"
                    strokeWidth={active || latest ? 2 : 1.5}
                  />

                  {latest && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="1.5"
                      fill="rgb(248 113 113)"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="pointer-events-none absolute z-50 w-36 -translate-x-1/2 rounded-lg border border-white/[0.08] bg-[#111318]/95 px-3 py-2.5 shadow-2xl backdrop-blur-xl"
              style={{
                left: `${Math.min(
                  88,
                  Math.max(12, (hoveredPoint.x / width) * 100),
                )}%`,
                top: `${Math.max(4, (hoveredPoint.y / height) * 100 - 26)}%`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-[0.12em] text-white/25">
                  {formatTrendDate(hoveredPoint.day)}
                </span>

                <span className="text-[8px] text-white/20">
                  DAY {hoveredIndex + 1}
                </span>
              </div>

              <div className="mt-1.5 text-[15px] font-semibold tabular-nums text-white">
                {Number(hoveredPoint.rating).toFixed(2)}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/[0.05] pt-2">
                <div>
                  <div className="text-[6px] uppercase tracking-[0.12em] text-white/20">
                    Win Rate
                  </div>

                  <div className="mt-0.5 text-[9px] tabular-nums text-white/55">
                    {hoveredPoint.matchCount
                      ? (
                          (hoveredPoint.winCount / hoveredPoint.matchCount) *
                          100
                        ).toFixed(1)
                      : "—"}
                    %
                  </div>
                </div>

                <div>
                  <div className="text-[6px] uppercase tracking-[0.12em] text-white/20">
                    Matches
                  </div>

                  <div className="mt-0.5 text-[9px] tabular-nums text-white/55">
                    {Number(hoveredPoint.matchCount || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="mt-2 flex justify-between px-1">
          {trend.map((item, index) => (
            <span
              key={item.day}
              className={`text-[7px] tabular-nums ${
                index === trend.length - 1 ? "text-white/45" : "text-white/20"
              }`}
            >
              {formatTrendDate(item.day)}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 border-t border-white/[0.045]">
        <div className="border-r border-white/[0.045] px-4 py-3">
          <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">
            Start
          </div>

          <div className="mt-1 text-[11px] font-semibold tabular-nums text-white/60">
            {startValue.toFixed(2)}
          </div>
        </div>

        <div className="border-r border-white/[0.045] px-4 py-3">
          <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">
            Low
          </div>

          <div className="mt-1 text-[11px] font-semibold tabular-nums text-white/45">
            {minValue.toFixed(2)}
          </div>
        </div>

        <div className="border-r border-white/[0.045] px-4 py-3">
          <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">
            High
          </div>

          <div className="mt-1 text-[11px] font-semibold tabular-nums text-white/45">
            {maxValue.toFixed(2)}
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">
            Current
          </div>

          <div className="mt-1 text-[11px] font-semibold tabular-nums text-white">
            {currentValue.toFixed(2)}
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
                              rank <= 20
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
