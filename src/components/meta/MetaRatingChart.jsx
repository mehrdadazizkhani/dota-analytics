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

function getMedian(values) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2) {
    return sorted[middle];
  }

  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function getRelativePosition(value, min, max) {
  if (max === min) {
    return 50;
  }

  return ((value - min) / (max - min)) * 100;
}

function MetaRatingChart({ rows }) {
  const [hoveredHeroId, setHoveredHeroId] = useState(null);
  const [heroLimit, setHeroLimit] = useState(50);

  const chartRows = useMemo(() => {
    return rows
      .map((row) => ({
        ...row,
        heroId: Number(row.heroId),
        metaScore: Number(row.metaScore || 0),
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
          Number.isFinite(row.heroId) &&
          Number.isFinite(row.metaPresence) &&
          Number.isFinite(row.metaImpact),
      );
  }, [rows]);

  const totalHeroes = chartRows.length;

  const maxHeroLimit = Math.max(20, totalHeroes);

  const sortedRows = useMemo(() => {
    return [...chartRows].sort((a, b) => {
      if (b.metaScore !== a.metaScore) {
        return b.metaScore - a.metaScore;
      }

      return b.metaPresence - a.metaPresence;
    });
  }, [chartRows]);

  const visibleRows = useMemo(() => {
    return sortedRows.slice(0, Math.min(heroLimit, sortedRows.length));
  }, [sortedRows, heroLimit]);

  const bounds = useMemo(() => {
    if (!visibleRows.length) {
      return {
        minPresence: 0,
        maxPresence: 100,
        minImpact: 0,
        maxImpact: 100,
      };
    }

    const presenceValues = visibleRows.map((row) => row.metaPresence);

    const impactValues = visibleRows.map((row) => row.metaImpact);

    return {
      minPresence: Math.min(...presenceValues),
      maxPresence: Math.max(...presenceValues),
      minImpact: Math.min(...impactValues),
      maxImpact: Math.max(...impactValues),
    };
  }, [visibleRows]);

  const splits = useMemo(() => {
    const presenceValues = visibleRows.map((row) => row.metaPresence);

    const impactValues = visibleRows.map((row) => row.metaImpact);

    return {
      presence: getMedian(presenceValues),
      impact: getMedian(impactValues),
    };
  }, [visibleRows]);

  const displayRows = useMemo(() => {
    if (!visibleRows.length) {
      return [];
    }

    return visibleRows.map((row) => {
      const relativePresence = getRelativePosition(
        row.metaPresence,
        bounds.minPresence,
        bounds.maxPresence,
      );

      const relativeImpact = getRelativePosition(
        row.metaImpact,
        bounds.minImpact,
        bounds.maxImpact,
      );

      return {
        ...row,
        relativePresence,
        relativeImpact,
      };
    });
  }, [visibleRows, bounds]);

  if (!chartRows.length) {
    return null;
  }

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

  function getX(relativeValue) {
    return padding.left + (relativeValue / 100) * plotWidth;
  }

  function getY(relativeValue) {
    return padding.top + plotHeight - (relativeValue / 100) * plotHeight;
  }

  const splitPresence = getRelativePosition(
    splits.presence,
    bounds.minPresence,
    bounds.maxPresence,
  );

  const splitImpact = getRelativePosition(
    splits.impact,
    bounds.minImpact,
    bounds.maxImpact,
  );

  const splitX = getX(splitPresence);
  const splitY = getY(splitImpact);

  const hoveredRow =
    hoveredHeroId !== null
      ? displayRows.find((row) => row.heroId === hoveredHeroId)
      : null;

  const statsHero = hoveredRow || visibleRows[0];

  function getQuadrant(row) {
    if (
      row.metaPresence >= splits.presence &&
      row.metaImpact >= splits.impact
    ) {
      return "tyrant";
    }

    if (row.metaPresence >= splits.presence && row.metaImpact < splits.impact) {
      return "staple";
    }

    if (row.metaPresence < splits.presence && row.metaImpact >= splits.impact) {
      return "specialist";
    }

    return "niche";
  }

  return (
    <div className="relative select-none">
      <style>
        {`
          @keyframes metaStatsFade {
            from {
              opacity: 0;
              transform: translateY(2px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
              Meta Dominance Map
            </h2>
          </div>

          <p className="mt-1 text-[9px] text-white/25">
            Relative distribution across the current 8-day meta
          </p>
        </div>

        {/* Hero count control */}
        <div className="w-full sm:w-[250px]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/30">
              Map Heroes
            </span>

            <span className="text-[9px] font-semibold tabular-nums text-white/65">
              {Math.min(heroLimit, totalHeroes)}{" "}
              <span className="text-white/20">/ {totalHeroes}</span>
            </span>
          </div>

          <input
            type="range"
            min="20"
            max={maxHeroLimit}
            step="1"
            value={Math.min(heroLimit, maxHeroLimit)}
            onChange={(event) => setHeroLimit(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-red-400"
            aria-label="Number of heroes shown on the map"
          />

          <div className="mt-1 flex justify-between text-[7px] tabular-nums text-white/15">
            <span>20</span>
            <span>TOP META</span>
            <span>{totalHeroes}</span>
          </div>
        </div>
      </div>

      {/* Hero Stats Bar */}
      <div className="mb-2 flex min-h-[44px] items-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#07080a] px-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        {statsHero && (
          <div
            key={statsHero.heroId}
            className="flex w-full items-center gap-3"
            style={{
              animation: "metaStatsFade 160ms ease-out",
            }}
          >
            {/* State */}
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`h-1 w-1 rounded-full ${
                  hoveredRow ? "bg-white/50" : "bg-red-400"
                }`}
              />

              <span className="text-[7px] font-semibold uppercase tracking-[0.16em] text-white/25">
                {hoveredRow ? "Hovered" : "Best Hero"}
              </span>
            </div>

            {/* Hero icon */}
            <div className="h-7 w-10 shrink-0 overflow-hidden rounded-md bg-white/[0.025] shadow-[0_0_14px_rgba(0,0,0,0.7)]">
              <img
                src={getHeroIcon(statsHero.hero)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            {/* Hero name */}
            <div className="min-w-0 shrink-0">
              <div className="max-w-[150px] truncate text-[10px] font-semibold text-white/80">
                {statsHero.hero?.displayName || statsHero.hero?.name}
              </div>
            </div>

            {/* Stats */}
            <div className="ml-auto flex items-center gap-5">
              <div>
                <div className="text-[6px] uppercase tracking-[0.12em] text-white/20">
                  Win Rate
                </div>

                <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-white/65">
                  {formatPercent(statsHero.winRate)}
                </div>
              </div>

              <div>
                <div className="text-[6px] uppercase tracking-[0.12em] text-white/20">
                  Pick Rate
                </div>

                <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-white/65">
                  {formatPercent(statsHero.pickRate)}
                </div>
              </div>

              <div>
                <div className="text-[6px] uppercase tracking-[0.12em] text-white/20">
                  Ban Rate
                </div>

                <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-white/65">
                  {formatPercent(statsHero.banRate)}
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="text-[6px] uppercase tracking-[0.12em] text-white/20">
                  Matches
                </div>

                <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-white/45">
                  {statsHero.matchCount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
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

          {/* Quadrant fields */}
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

            const percentage = ratio * 100;
            const invertedPercentage = 100 - percentage;

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
                  {percentage.toFixed(0)}
                </text>

                <text
                  x={padding.left - 12}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="8"
                  fontFamily="inherit"
                >
                  {invertedPercentage.toFixed(0)}
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
          {displayRows.map((row) => {
            const x = getX(row.relativePresence);
            const y = getY(row.relativeImpact);

            const isHovered = hoveredHeroId === row.heroId;

            return (
              <g
                key={row.heroId}
                onPointerEnter={() => setHoveredHeroId(row.heroId)}
                onPointerLeave={() => setHoveredHeroId(null)}
                className="cursor-pointer"
              >
                {/* Black hover glow only */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r="21"
                    fill="rgba(0,0,0,0.28)"
                    filter="url(#metaGlowStrong)"
                  />
                )}

                {/* Hero icon only */}
                <image
                  href={getHeroIcon(row.hero)}
                  x={x - 16}
                  y={y - 16}
                  width="32"
                  height="32"
                  preserveAspectRatio="xMidYMid slice"
                  opacity={isHovered ? 1 : 0.88}
                  style={{
                    filter: isHovered
                      ? "drop-shadow(0 0 7px rgba(0,0,0,0.95))"
                      : "none",
                    transition: "filter 160ms ease, opacity 160ms ease",
                  }}
                />
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
            META PRESENCE · RELATIVE
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
            META IMPACT · RELATIVE
          </text>
        </svg>
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
