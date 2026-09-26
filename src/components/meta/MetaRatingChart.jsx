import { useMemo, useState } from "react";

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(1);
}

function getHeroIcon(hero) {
  if (!hero?.shortName) {
    return "";
  }

  return `https://cdn.stratz.com/images/dota2/heroes/${hero.shortName}_icon.png`;
}

function MetaRatingChart({ rows }) {
  const [hoveredHeroId, setHoveredHeroId] = useState(null);

  const chartRows = useMemo(() => {
    return rows
      .map((row) => ({
        ...row,
        metaPresence: Number(row.metaPresence || 0),
        metaImpact: Number(row.metaImpact || 0),
        winRate: Number(row.winRate || 0),
        pickRate: Number(row.pickRate || 0),
        banRate: Number(row.banRate || 0),
        matchCount: Number(row.matchCount || 0),
        banCount: Number(row.banCount || 0),
      }))
      .filter(
        (row) =>
          Number.isFinite(row.metaPresence) && Number.isFinite(row.metaImpact),
      );
  }, [rows]);

  const bounds = useMemo(() => {
    if (!chartRows.length) {
      return {
        xMax: 100,
        yMax: 100,
      };
    }

    const maxPresence = Math.max(
      ...chartRows.map((row) => row.metaPresence),
      0,
    );

    const maxImpact = Math.max(...chartRows.map((row) => row.metaImpact), 0);

    return {
      xMax: Math.max(20, Math.ceil(maxPresence / 10) * 10),
      yMax: Math.max(100, Math.ceil(maxImpact / 100) * 100),
    };
  }, [chartRows]);

  if (!chartRows.length) {
    return null;
  }

  /*
   * We intentionally use a large SVG coordinate system.
   * CSS scales it responsively while keeping the map readable.
   */
  const width = 1200;
  const height = 650;

  const padding = {
    top: 58,
    right: 48,
    bottom: 64,
    left: 72,
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  function getX(value) {
    return padding.left + (value / bounds.xMax) * plotWidth;
  }

  function getY(value) {
    return padding.top + plotHeight - (value / bounds.yMax) * plotHeight;
  }

  /*
   * Median-ish split gives the map useful quadrants
   * even when the current meta distribution is clustered.
   */
  const xValues = chartRows
    .map((row) => row.metaPresence)
    .sort((a, b) => a - b);

  const yValues = chartRows.map((row) => row.metaImpact).sort((a, b) => a - b);

  const median = (values) => {
    if (!values.length) {
      return 0;
    }

    const middle = Math.floor(values.length / 2);

    if (values.length % 2) {
      return values[middle];
    }

    return (values[middle - 1] + values[middle]) / 2;
  };

  const xSplit = median(xValues);
  const ySplit = median(yValues);

  const splitX = getX(xSplit);
  const splitY = getY(ySplit);

  const displayPositions = useMemo(() => {
    const positions = chartRows.map((row) => ({
      heroId: row.heroId,
      x: getX(row.metaPresence),
      y: getY(row.metaImpact),
      originalX: getX(row.metaPresence),
      originalY: getY(row.metaImpact),
    }));

    const minDistance = 42;

    // A few iterations are enough to spread crowded clusters.
    for (let iteration = 0; iteration < 8; iteration += 1) {
      for (let i = 0; i < positions.length; i += 1) {
        for (let j = i + 1; j < positions.length; j += 1) {
          const a = positions[i];
          const b = positions[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance >= minDistance) {
            continue;
          }

          const safeDistance = Math.max(distance, 0.001);

          const push = (minDistance - safeDistance) * 0.32;

          const nx = dx / safeDistance;
          const ny = dy / safeDistance;

          a.x -= nx * push;
          a.y -= ny * push;

          b.x += nx * push;
          b.y += ny * push;
        }
      }

      // Keep everything inside the actual plot.
      for (const position of positions) {
        position.x = Math.max(
          padding.left + 18,
          Math.min(padding.left + plotWidth - 18, position.x),
        );

        position.y = Math.max(
          padding.top + 18,
          Math.min(padding.top + plotHeight - 18, position.y),
        );
      }
    }

    return positions;
  }, [chartRows, bounds.xMax, bounds.yMax]);

  const hoveredRow =
    hoveredHeroId !== null
      ? chartRows.find((row) => row.heroId === hoveredHeroId)
      : null;

  function getQuadrant(row) {
    if (row.metaPresence >= xSplit && row.metaImpact >= ySplit) {
      return "tyrant";
    }

    if (row.metaPresence >= xSplit && row.metaImpact < ySplit) {
      return "staple";
    }

    if (row.metaPresence < xSplit && row.metaImpact >= ySplit) {
      return "specialist";
    }

    return "niche";
  }

  return (
    <div className="relative select-none">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
              Meta Dominance Map
            </h2>
          </div>

          <p className="mt-1 text-[9px] text-white/25">
            Presence vs. impact across the current 8-day meta
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[8px] uppercase tracking-[0.1em] text-white/25">
          <span>X&nbsp; Meta Presence</span>

          <span>Y&nbsp; Meta Impact</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07080a] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/[0.025] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/[0.02] blur-3xl" />
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="relative block h-auto w-full"
          role="img"
          aria-label="Dota 2 Meta Dominance Map"
        >
          <defs>
            <filter
              id="metaGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter
              id="metaGlowStrong"
              x="-150%"
              y="-150%"
              width="400%"
              height="400%"
            >
              <feGaussianBlur stdDeviation="7" result="blur" />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="tyrantGradient" cx="100%" cy="0%" r="100%">
              <stop offset="0%" stopColor="rgba(248,113,113,0.08)" />

              <stop offset="100%" stopColor="rgba(248,113,113,0)" />
            </radialGradient>

            <radialGradient id="specialistGradient" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.06)" />

              <stop offset="100%" stopColor="rgba(168,85,247,0)" />
            </radialGradient>
          </defs>

          {/* Plot background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            rx="8"
            fill="rgba(255,255,255,0.008)"
          />

          {/* Quadrant ambient fields */}
          <rect
            x={splitX}
            y={padding.top}
            width={width - padding.right - splitX}
            height={splitY - padding.top}
            fill="url(#tyrantGradient)"
          />

          <rect
            x={padding.left}
            y={padding.top}
            width={splitX - padding.left}
            height={splitY - padding.top}
            fill="url(#specialistGradient)"
          />

          {/* Grid */}
          {Array.from({ length: 6 }).map((_, index) => {
            const ratio = index / 5;

            const x = padding.left + ratio * plotWidth;

            const y = padding.top + ratio * plotHeight;

            const xValue = ratio * bounds.xMax;

            const yValue = bounds.yMax - ratio * bounds.yMax;

            return (
              <g key={`grid-${index}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={padding.top}
                  y2={padding.top + plotHeight}
                  stroke="rgba(255,255,255,0.035)"
                  strokeWidth="1"
                />

                <line
                  x1={padding.left}
                  x2={padding.left + plotWidth}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.035)"
                  strokeWidth="1"
                />

                <text
                  x={x}
                  y={height - 34}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="8"
                  fontFamily="inherit"
                >
                  {xValue.toFixed(0)}%
                </text>

                <text
                  x={padding.left - 12}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="8"
                  fontFamily="inherit"
                >
                  {yValue.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Median split */}
          <line
            x1={splitX}
            x2={splitX}
            y1={padding.top}
            y2={padding.top + plotHeight}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />

          <line
            x1={padding.left}
            x2={padding.left + plotWidth}
            y1={splitY}
            y2={splitY}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />

          {/* Quadrant labels */}
          <g pointerEvents="none">
            <text
              x={width - padding.right - 14}
              y={padding.top + 18}
              textAnchor="end"
              fill="rgba(248,113,113,0.34)"
              fontSize="8"
              fontWeight="700"
              letterSpacing="1.6"
              fontFamily="inherit"
            >
              META TYRANTS
            </text>

            <text
              x={width - padding.right - 14}
              y={padding.top + 31}
              textAnchor="end"
              fill="rgba(255,255,255,0.13)"
              fontSize="6"
              letterSpacing="1"
              fontFamily="inherit"
            >
              HIGH PRESENCE · HIGH IMPACT
            </text>

            <text
              x={width - padding.right - 14}
              y={splitY + 23}
              textAnchor="end"
              fill="rgba(255,255,255,0.20)"
              fontSize="8"
              fontWeight="700"
              letterSpacing="1.6"
              fontFamily="inherit"
            >
              CONTENTIOUS STAPLES
            </text>

            <text
              x={width - padding.right - 14}
              y={splitY + 36}
              textAnchor="end"
              fill="rgba(255,255,255,0.11)"
              fontSize="6"
              letterSpacing="1"
              fontFamily="inherit"
            >
              HIGH PRESENCE · LOWER IMPACT
            </text>

            <text
              x={padding.left + 14}
              y={padding.top + 18}
              fill="rgba(168,85,247,0.34)"
              fontSize="8"
              fontWeight="700"
              letterSpacing="1.6"
              fontFamily="inherit"
            >
              LETHAL SPECIALISTS
            </text>

            <text
              x={padding.left + 14}
              y={padding.top + 31}
              fill="rgba(255,255,255,0.13)"
              fontSize="6"
              letterSpacing="1"
              fontFamily="inherit"
            >
              LOWER PRESENCE · HIGH IMPACT
            </text>

            <text
              x={padding.left + 14}
              y={splitY + 23}
              fill="rgba(255,255,255,0.16)"
              fontSize="8"
              fontWeight="700"
              letterSpacing="1.6"
              fontFamily="inherit"
            >
              OFF-META / NICHE
            </text>

            <text
              x={padding.left + 14}
              y={splitY + 36}
              fill="rgba(255,255,255,0.10)"
              fontSize="6"
              letterSpacing="1"
              fontFamily="inherit"
            >
              LOWER PRESENCE · LOWER IMPACT
            </text>
          </g>

          {/* Hero points */}
          {chartRows.map((row) => {
            const displayPosition = displayPositions.find(
              (position) => position.heroId === row.heroId,
            );

            const x = displayPosition?.x ?? getX(row.metaPresence);

            const y = displayPosition?.y ?? getY(row.metaImpact);

            const isHovered = hoveredHeroId === row.heroId;

            const quadrant = getQuadrant(row);

            const accent =
              quadrant === "tyrant"
                ? "248,113,113"
                : quadrant === "specialist"
                  ? "168,85,247"
                  : quadrant === "staple"
                    ? "251,191,36"
                    : "148,163,184";

            const iconSize = isHovered ? 48 : 31;

            return (
              <g
                key={row.heroId}
                onPointerEnter={() => setHoveredHeroId(row.heroId)}
                onPointerLeave={() => setHoveredHeroId(null)}
                className="cursor-pointer"
              >
                {/* Hover glow */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={iconSize * 0.72}
                    fill={`rgba(${accent},0.14)`}
                    filter="url(#metaGlowStrong)"
                  />
                )}

                {/* Point halo */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 25 : 18}
                  fill={`rgba(${accent},${isHovered ? 0.1 : 0.035})`}
                  stroke={`rgba(${accent},${isHovered ? 0.45 : 0.16})`}
                  strokeWidth={isHovered ? 1.5 : 1}
                />

                {/* Hero icon */}
                <image
                  href={getHeroIcon(row.hero)}
                  x={x - iconSize / 2}
                  y={y - iconSize / 2}
                  width={iconSize}
                  height={iconSize}
                  preserveAspectRatio="xMidYMid slice"
                  style={{
                    transition:
                      "x 160ms ease, y 160ms ease, width 160ms ease, height 160ms ease",
                    transformOrigin: `${x}px ${y}px`,
                  }}
                  opacity={isHovered ? 1 : 0.88}
                />

                {/* Icon border */}
                <circle
                  cx={x}
                  cy={y}
                  r={iconSize / 2}
                  fill="none"
                  stroke={
                    isHovered ? `rgba(${accent},0.8)` : "rgba(255,255,255,0.16)"
                  }
                  strokeWidth={isHovered ? 2 : 1}
                />

                {/* Hover name */}
                {isHovered && (
                  <g pointerEvents="none">
                    <rect
                      x={x - 54}
                      y={y + 29}
                      width="108"
                      height="19"
                      rx="5"
                      fill="rgba(7,8,10,0.92)"
                      stroke={`rgba(${accent},0.25)`}
                    />

                    <text
                      x={x}
                      y={y + 42}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.88)"
                      fontSize="7"
                      fontWeight="700"
                      letterSpacing="0.7"
                      fontFamily="inherit"
                    >
                      {(row.hero?.displayName || row.hero?.name || "Unknown")
                        .toUpperCase()
                        .slice(0, 18)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Axis */}
          <line
            x1={padding.left}
            x2={padding.left + plotWidth}
            y1={padding.top + plotHeight}
            y2={padding.top + plotHeight}
            stroke="rgba(255,255,255,0.12)"
          />

          <line
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={padding.top + plotHeight}
            stroke="rgba(255,255,255,0.12)"
          />

          {/* Axis labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.25)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.5"
            fontFamily="inherit"
          >
            META PRESENCE · PICK + BAN RATE
          </text>

          <text
            x="18"
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${height / 2})`}
            fill="rgba(255,255,255,0.25)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.5"
            fontFamily="inherit"
          >
            META IMPACT · WIN RATE × BAN RATE
          </text>
        </svg>

        {/* HTML tooltip */}
        {hoveredRow && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-30 w-[250px] -translate-x-1/2 rounded-xl border border-white/[0.09] bg-[#0d0f13]/95 p-3 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-4 sm:translate-x-0">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black">
                <img
                  src={getHeroIcon(hoveredRow.hero)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[11px] font-bold text-white/90">
                  {hoveredRow.hero?.displayName || hoveredRow.hero?.name}
                </div>

                <div className="mt-0.5 text-[7px] uppercase tracking-[0.14em] text-white/25">
                  Meta Dominance
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/25">
                  Presence
                </div>

                <div className="mt-0.5 text-[11px] font-semibold tabular-nums text-white/90">
                  {formatPercent(hoveredRow.metaPresence)}
                </div>
              </div>

              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/25">
                  Impact
                </div>

                <div className="mt-0.5 text-[11px] font-semibold tabular-nums text-red-300">
                  {formatNumber(hoveredRow.metaImpact)}
                </div>
              </div>

              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/25">
                  Win Rate
                </div>

                <div className="mt-0.5 text-[10px] tabular-nums text-white/65">
                  {formatPercent(hoveredRow.winRate)}
                </div>
              </div>

              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/25">
                  Pick Rate
                </div>

                <div className="mt-0.5 text-[10px] tabular-nums text-white/65">
                  {formatPercent(hoveredRow.pickRate)}
                </div>
              </div>

              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/25">
                  Ban Rate
                </div>

                <div className="mt-0.5 text-[10px] tabular-nums text-white/65">
                  {formatPercent(hoveredRow.banRate)}
                </div>
              </div>

              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/25">
                  Matches
                </div>

                <div className="mt-0.5 text-[10px] tabular-nums text-white/65">
                  {hoveredRow.matchCount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-white/[0.06] pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[7px] uppercase tracking-[0.12em] text-white/20">
                  Position
                </span>

                <span className="text-[7px] font-semibold uppercase tracking-[0.1em] text-white/45">
                  {getQuadrant(hoveredRow)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />

          <span className="text-[7px] uppercase tracking-[0.1em] text-white/25">
            Meta Tyrants
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />

          <span className="text-[7px] uppercase tracking-[0.1em] text-white/25">
            Contentious Staples
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400/70" />

          <span className="text-[7px] uppercase tracking-[0.1em] text-white/25">
            Lethal Specialists
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400/60" />

          <span className="text-[7px] uppercase tracking-[0.1em] text-white/25">
            Off-Meta / Niche
          </span>
        </div>
      </div>
    </div>
  );
}

export default MetaRatingChart;
