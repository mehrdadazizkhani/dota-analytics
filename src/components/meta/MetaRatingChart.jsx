import { useEffect, useMemo, useRef, useState } from "react";
import { getHeroAsset } from "../../lib/assets/heroes";

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function MetaRatingChart({ rows }) {
  const [visibleCount, setVisibleCount] = useState(rows.length);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const chartRef = useRef(null);

  const width = 1200;
  const height = 430;

  const padding = {
    top: 34,
    right: 28,
    bottom: 46,
    left: 58,
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const chartRows = useMemo(() => {
    return [...rows]
      .map((item) => ({
        ...item,
        metaScore: Number(item.metaScore),
      }))
      .sort((a, b) => {
        if (b.metaScore !== a.metaScore) {
          return b.metaScore - a.metaScore;
        }

        if (Number(b.winRate) !== Number(a.winRate)) {
          return Number(b.winRate) - Number(a.winRate);
        }

        return Number(b.matchCount || 0) - Number(a.matchCount || 0);
      })
      .map((item, index) => ({
        ...item,
        globalIndex: index,
      }));
  }, [rows]);

  useEffect(() => {
    setVisibleCount(chartRows.length);
    setHoveredIndex(null);
  }, [chartRows.length]);

  const visibleRows = chartRows.slice(0, visibleCount);

  const isTop20 = visibleCount <= 20;
  const showPortraits = visibleCount <= 50;

  const ratingValues = chartRows
    .map((row) => Number(row.metaScore))
    .filter(Number.isFinite);

  const maxRating = Math.max(...ratingValues, 0);
  const minRating = Math.min(...ratingValues, 0);

  const ratingPadding = Math.max((maxRating - minRating) * 0.1, 0.05);

  const yMax = maxRating + ratingPadding;
  const yMin = Math.max(0, minRating - ratingPadding);

  const accent = "rgb(248 113 113)";
  const accentSoft = "rgba(248,113,113,0.16)";

  function getY(value) {
    const range = Math.max(yMax - yMin, 0.001);

    return padding.top + (1 - (value - yMin) / range) * plotHeight;
  }

  function getSlotWidth() {
    return plotWidth / Math.max(visibleRows.length, 1);
  }

  function getBarWidth() {
    const slotWidth = getSlotWidth();

    if (visibleCount <= 20) {
      return Math.min(48, slotWidth * 0.78);
    }

    if (visibleCount <= 30) {
      return Math.min(30, slotWidth * 0.62);
    }

    if (visibleCount <= 50) {
      return Math.min(18, slotWidth * 0.58);
    }

    return Math.max(2, Math.min(10, slotWidth * 0.55));
  }

  function getX(index) {
    const slotWidth = getSlotWidth();

    return padding.left + index * slotWidth + slotWidth / 2;
  }

  function zoomIn() {
    setVisibleCount((current) => {
      if (current <= 20) {
        return 20;
      }

      if (current <= 30) {
        return 20;
      }

      if (current <= 50) {
        return 30;
      }

      if (current <= 80) {
        return 50;
      }

      return Math.max(80, Math.round(current * 0.78));
    });

    setHoveredIndex(null);
  }

  function zoomOut() {
    setVisibleCount((current) => {
      if (current >= chartRows.length) {
        return chartRows.length;
      }

      if (current <= 20) {
        return Math.min(30, chartRows.length);
      }

      if (current <= 30) {
        return Math.min(50, chartRows.length);
      }

      if (current <= 50) {
        return Math.min(80, chartRows.length);
      }

      return Math.min(chartRows.length, Math.round(current * 1.28));
    });

    setHoveredIndex(null);
  }

  useEffect(() => {
    const element = chartRef.current;

    if (!element) {
      return undefined;
    }

    function handleWheel(event) {
      event.preventDefault();
      event.stopPropagation();

      if (event.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }

    element.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  });

  function resetZoom() {
    setVisibleCount(chartRows.length);
    setHoveredIndex(null);
  }

  function zoomToTop20() {
    setVisibleCount(Math.min(20, chartRows.length));
    setHoveredIndex(null);
  }

  if (!chartRows.length) {
    return null;
  }

  const tooltipRow =
    hoveredIndex !== null
      ? visibleRows.find((row) => row.globalIndex === hoveredIndex)
      : null;

  const tooltipIndex = tooltipRow
    ? visibleRows.findIndex((row) => row.globalIndex === tooltipRow.globalIndex)
    : -1;

  const tooltipX = tooltipIndex >= 0 ? getX(tooltipIndex) : 0;

  return (
    <div
      ref={chartRef}
      className="relative select-none"
      onDoubleClick={resetZoom}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: accent }}
            />

            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Rating Distribution
            </h2>
          </div>

          <p className="mt-1 text-[9px] text-white/20">
            Top {visibleCount} of {chartRows.length} heroes
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={zoomToTop20}
            className="rounded border border-white/[0.06] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30 transition-all hover:border-white/[0.12] hover:bg-white/[0.03] hover:text-white/70"
          >
            Top 20
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="rounded border border-white/[0.06] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30 transition-all hover:border-white/[0.12] hover:bg-white/[0.03] hover:text-white/70"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.055] bg-[#08090b]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Hero meta rating distribution"
        >
          <defs>
            <linearGradient id="heroBarFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.95" />

              <stop offset="100%" stopColor="white" stopOpacity="0.48" />
            </linearGradient>

            <linearGradient id="heroCardImageFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="black" stopOpacity="0" />

              <stop offset="100%" stopColor="black" stopOpacity="0.9" />
            </linearGradient>

            <filter
              id="heroBarGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid */}
          {Array.from({ length: 5 }).map((_, index) => {
            const ratio = index / 4;

            const value = yMax - ratio * (yMax - yMin);

            const y = padding.top + ratio * plotHeight;

            return (
              <g key={`grid-${index}`}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                />

                <text
                  x={padding.left - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="9"
                  fontFamily="inherit"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Bars / Cards */}
          {visibleRows.map((row, index) => {
            const rating = Number(row.metaScore);

            const x = getX(index);
            const y = getY(rating);

            const slotWidth = getSlotWidth();

            const barWidth = getBarWidth();

            const barX = x - barWidth / 2;

            const baseline = padding.top + plotHeight;

            const barHeight = baseline - y;

            const isHovered = hoveredIndex === row.globalIndex;

            const rank = row.globalIndex + 1;

            /*
             * TOP 20
             * Hero card replaces the bar.
             */
            if (isTop20) {
              const cardWidth = Math.min(50, slotWidth * 0.84);

              const cardHeight = plotHeight - 18;

              const cardX = x - cardWidth / 2;

              const cardY = padding.top + 8;

              const imageHeight = Math.min(150, cardWidth * 2.15);

              return (
                <g
                  key={row.hero.id}
                  className="cursor-pointer"
                  onPointerEnter={() => setHoveredIndex(row.globalIndex)}
                  onPointerLeave={() => setHoveredIndex(null)}
                >
                  {/* Card shadow / glow */}
                  {isHovered && (
                    <rect
                      x={cardX - 2}
                      y={cardY - 2}
                      width={cardWidth + 4}
                      height={cardHeight + 4}
                      rx="7"
                      fill="none"
                      stroke={accent}
                      strokeOpacity="0.18"
                      strokeWidth="4"
                      filter="url(#heroBarGlow)"
                    />
                  )}

                  {/* Card */}
                  <rect
                    x={cardX}
                    y={cardY}
                    width={cardWidth}
                    height={cardHeight}
                    rx="6"
                    fill={isHovered ? "#121419" : "#0d0f12"}
                    stroke={
                      isHovered
                        ? "rgba(248,113,113,0.38)"
                        : "rgba(255,255,255,0.07)"
                    }
                    strokeWidth="1"
                  />

                  {/* Rank */}
                  <text
                    x={cardX + 5}
                    y={cardY + 15}
                    fill="rgba(255,255,255,0.16)"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    #{String(rank).padStart(2, "0")}
                  </text>

                  {/* Hero image */}
                  <clipPath id={`top-card-${row.hero.id}`}>
                    <rect
                      x={cardX + 2}
                      y={cardY + 2}
                      width={cardWidth - 4}
                      height={imageHeight}
                      rx="5"
                    />
                  </clipPath>

                  <image
                    href={getHeroAsset(row.hero, "portrait")}
                    x={cardX + 2}
                    y={cardY + 2}
                    width={cardWidth - 4}
                    height={imageHeight}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#top-card-${row.hero.id})`}
                    style={{
                      transformOrigin: `${x}px ${cardY + imageHeight / 2}px`,
                      transform: isHovered ? "scale(1.025)" : "scale(1)",
                      transition: "transform 180ms ease",
                    }}
                  />

                  {/* Image fade */}
                  <rect
                    x={cardX + 2}
                    y={cardY + imageHeight * 0.42}
                    width={cardWidth - 4}
                    height={imageHeight * 0.58}
                    fill="url(#heroCardImageFade)"
                    pointerEvents="none"
                  />

                  {/* Hero name */}
                  <text
                    x={x}
                    y={cardY + imageHeight + 18}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.82)"
                    fontSize="7"
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    {(row.hero.displayName || row.hero.name || "")
                      .toUpperCase()
                      .slice(0, 15)}
                  </text>

                  {/* Rating */}
                  <text
                    x={x}
                    y={cardY + imageHeight + 38}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="800"
                    fontFamily="inherit"
                  >
                    {rating.toFixed(2)}
                  </text>

                  <text
                    x={x}
                    y={cardY + imageHeight + 48}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.2)"
                    fontSize="5.5"
                    fontWeight="600"
                    letterSpacing="1"
                    fontFamily="inherit"
                  >
                    RATING
                  </text>

                  {/* Stats */}
                  <text
                    x={cardX + 7}
                    y={cardY + cardHeight - 15}
                    fill="rgba(255,255,255,0.42)"
                    fontSize="6"
                    fontFamily="inherit"
                  >
                    WIN
                  </text>

                  <text
                    x={cardX + cardWidth - 7}
                    y={cardY + cardHeight - 15}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.75)"
                    fontSize="6.5"
                    fontWeight="600"
                    fontFamily="inherit"
                  >
                    {formatPercent(row.winRate)}
                  </text>

                  <text
                    x={cardX + 7}
                    y={cardY + cardHeight - 5}
                    fill="rgba(255,255,255,0.42)"
                    fontSize="6"
                    fontFamily="inherit"
                  >
                    PICK
                  </text>

                  <text
                    x={cardX + cardWidth - 7}
                    y={cardY + cardHeight - 5}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.75)"
                    fontSize="6.5"
                    fontWeight="600"
                    fontFamily="inherit"
                  >
                    {formatPercent(row.pickRate)}
                  </text>

                  {/* Accent line */}
                  <rect
                    x={cardX + 6}
                    y={cardY + cardHeight - 1}
                    width={cardWidth - 12}
                    height="1"
                    fill={accent}
                    opacity={isHovered ? 0.9 : 0.3}
                  />
                </g>
              );
            }

            /*
             * 21–50
             * Portrait is physically connected
             * to the top of the bar.
             */
            if (showPortraits) {
              const portraitSize = Math.min(24, Math.max(15, slotWidth * 0.72));

              const portraitY = Math.max(padding.top + 2, y - portraitSize - 3);

              return (
                <g
                  key={row.hero.id}
                  className="cursor-pointer"
                  onPointerEnter={() => setHoveredIndex(row.globalIndex)}
                  onPointerLeave={() => setHoveredIndex(null)}
                >
                  <rect
                    x={barX}
                    y={y}
                    width={barWidth}
                    height={Math.max(2, barHeight)}
                    rx={2}
                    fill="url(#heroBarFade)"
                    opacity={isHovered ? 1 : 0.72}
                    filter={isHovered ? "url(#heroBarGlow)" : undefined}
                  />

                  <clipPath id={`bar-portrait-${row.hero.id}`}>
                    <rect
                      x={x - portraitSize / 2}
                      y={portraitY}
                      width={portraitSize}
                      height={portraitSize}
                      rx={3}
                    />
                  </clipPath>

                  <image
                    href={getHeroAsset(row.hero, "portrait")}
                    x={x - portraitSize / 2}
                    y={portraitY}
                    width={portraitSize}
                    height={portraitSize}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#bar-portrait-${row.hero.id})`}
                  />

                  <rect
                    x={x - portraitSize / 2}
                    y={portraitY}
                    width={portraitSize}
                    height={portraitSize}
                    rx={3}
                    fill="none"
                    stroke={isHovered ? accent : "rgba(255,255,255,0.10)"}
                    strokeWidth="1"
                  />
                </g>
              );
            }

            /*
             * 51–127
             * Clean minimal bars.
             */
            return (
              <g
                key={row.hero.id}
                className="cursor-pointer"
                onPointerEnter={() => setHoveredIndex(row.globalIndex)}
                onPointerLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <rect
                    x={barX - 1}
                    y={y - 2}
                    width={barWidth + 2}
                    height={barHeight + 2}
                    rx={2}
                    fill={accentSoft}
                    filter="url(#heroBarGlow)"
                  />
                )}

                <rect
                  x={barX}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barHeight)}
                  rx={2}
                  fill="url(#heroBarFade)"
                  opacity={isHovered ? 1 : 0.62}
                />
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotHeight}
            y2={padding.top + plotHeight}
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
          />

          {/* Rank labels */}
          <text
            x={padding.left}
            y={height - 16}
            fill="rgba(255,255,255,0.18)"
            fontSize="9"
            fontFamily="inherit"
          >
            #1
          </text>

          <text
            x={width - padding.right}
            y={height - 16}
            textAnchor="end"
            fill="rgba(255,255,255,0.18)"
            fontSize="9"
            fontFamily="inherit"
          >
            #{visibleCount}
          </text>

          <text
            x={width / 2}
            y={height - 16}
            textAnchor="middle"
            fill="rgba(255,255,255,0.12)"
            fontSize="8"
            fontFamily="inherit"
          >
            META RANK
          </text>
        </svg>

        {/* Tooltip */}
        {tooltipRow && !isTop20 && (
          <div
            className="pointer-events-none absolute top-3 z-20 w-48 -translate-x-1/2 rounded-lg border border-white/[0.08] bg-[#101216]/96 p-3 shadow-2xl backdrop-blur"
            style={{
              left: `${Math.min(88, Math.max(12, (tooltipX / width) * 100))}%`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-white/[0.08] bg-black">
                <img
                  src={getHeroAsset(tooltipRow.hero, "portrait")}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-white/90">
                  {tooltipRow.hero.displayName || tooltipRow.hero.name}
                </div>

                <div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-white/25">
                  Rank #{tooltipRow.globalIndex + 1}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">
                  Rating
                </div>

                <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-white/90">
                  {tooltipRow.metaScore.toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">
                  Win
                </div>

                <div className="mt-0.5 text-[10px] tabular-nums text-white/60">
                  {formatPercent(tooltipRow.winRate)}
                </div>
              </div>

              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">
                  Pick
                </div>

                <div className="mt-0.5 text-[10px] tabular-nums text-white/60">
                  {formatPercent(tooltipRow.pickRate)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <span className="text-[8px] text-white/15">
          Scroll to zoom toward Top Rating
        </span>

        <span className="text-[8px] text-white/15">Double-click to reset</span>
      </div>
    </div>
  );
}

export default MetaRatingChart;
