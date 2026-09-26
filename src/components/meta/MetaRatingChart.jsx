import { useEffect, useMemo, useRef, useState } from "react";
import { getHeroAsset } from "../../lib/assets/heroes";

function formatPercent(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function MetaRatingChart({ rows }) {
  const [viewStart, setViewStart] = useState(0);
  const [viewEnd, setViewEnd] = useState(Math.max(0, rows.length - 1));
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [dragging, setDragging] = useState(false);

  const chartRef = useRef(null);
  const dragRef = useRef(null);

  const width = 1000;
  const height = 390;
  const padding = { top: 48, right: 28, bottom: 48, left: 58 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxVisibleSpan = Math.max(1, rows.length - 1);
  const minVisibleSpan = Math.min(5, maxVisibleSpan);

  useEffect(() => {
    setViewStart(0);
    setViewEnd(Math.max(0, rows.length - 1));
    setHoveredIndex(null);
  }, [rows.length]);

  const chartRows = useMemo(
    () => rows.map((item, index) => ({ ...item, globalIndex: index })),
    [rows],
  );

  const visibleStart = Math.max(0, Math.floor(viewStart));
  const visibleEnd = Math.min(rows.length - 1, Math.ceil(viewEnd));
  const visibleRows = chartRows.slice(visibleStart, visibleEnd + 1);

  const ratingValues = rows
    .map((row) => Number(row.metaScore))
    .filter(Number.isFinite);

  const maxRating = Math.max(...ratingValues, 0);
  const minRating = Math.min(...ratingValues, 0);
  const ratingPadding = Math.max((maxRating - minRating) * 0.12, 0.05);
  const yMax = maxRating + ratingPadding;
  const yMin = Math.max(0, minRating - ratingPadding);

  function getX(index) {
    const span = Math.max(viewEnd - viewStart, 1);
    return padding.left + ((index - viewStart) / span) * plotWidth;
  }

  function getY(value) {
    const range = Math.max(yMax - yMin, 0.001);
    return padding.top + (1 - (value - yMin) / range) * plotHeight;
  }

  function clampWindow(start, end) {
    const span = end - start;

    if (span >= maxVisibleSpan) return [0, maxVisibleSpan];

    let nextStart = start;
    let nextEnd = end;

    if (nextStart < 0) {
      nextEnd -= nextStart;
      nextStart = 0;
    }

    if (nextEnd > maxVisibleSpan) {
      const overflow = nextEnd - maxVisibleSpan;
      nextStart -= overflow;
      nextEnd = maxVisibleSpan;
    }

    return [
      Math.max(0, nextStart),
      Math.min(maxVisibleSpan, nextEnd),
    ];
  }

  function handleWheel(event) {
    if (rows.length <= 1) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = ((event.clientX - rect.left) / rect.width) * width;
    const plotX = Math.max(
      padding.left,
      Math.min(width - padding.right, mouseX),
    );
    const ratio = (plotX - padding.left) / plotWidth;
    const anchor = viewStart + ratio * (viewEnd - viewStart);

    const zoomFactor = event.deltaY < 0 ? 0.78 : 1.28;
    const currentSpan = viewEnd - viewStart;
    const nextSpan = Math.max(
      minVisibleSpan,
      Math.min(maxVisibleSpan, currentSpan * zoomFactor),
    );

    const nextStart = anchor - ratio * nextSpan;
    const nextEnd = anchor + (1 - ratio) * nextSpan;
    const [clampedStart, clampedEnd] = clampWindow(nextStart, nextEnd);

    setViewStart(clampedStart);
    setViewEnd(clampedEnd);
    setHoveredIndex(null);
  }

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [viewStart, viewEnd, rows.length]);

  function handlePointerDown(event) {
    if (rows.length <= 1) return;

    dragRef.current = {
      x: event.clientX,
      start: viewStart,
      end: viewEnd,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    setHoveredIndex(null);
  }

  function handlePointerMove(event) {
    if (!dragRef.current) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const deltaPixels = event.clientX - dragRef.current.x;
    const deltaIndex =
      (deltaPixels / rect.width) *
      (dragRef.current.end - dragRef.current.start);

    const nextStart = dragRef.current.start - deltaIndex;
    const nextEnd = dragRef.current.end - deltaIndex;
    const [clampedStart, clampedEnd] = clampWindow(nextStart, nextEnd);

    setViewStart(clampedStart);
    setViewEnd(clampedEnd);
  }

  function handlePointerUp(event) {
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function resetZoom() {
    setViewStart(0);
    setViewEnd(Math.max(0, rows.length - 1));
    setHoveredIndex(null);
  }

  function zoomToTop20() {
    if (rows.length <= 20) {
      resetZoom();
      return;
    }

    setViewStart(0);
    setViewEnd(19);
    setHoveredIndex(null);
  }

  const points = visibleRows.map((item) => ({
    ...item,
    x: getX(item.globalIndex),
    y: getY(Number(item.metaScore)),
  }));

  const tooltipPoint =
    hoveredIndex !== null
      ? points.find((point) => point.globalIndex === hoveredIndex)
      : null;

  const shownStart = Math.max(1, Math.floor(viewStart) + 1);
  const shownEnd = Math.min(rows.length, Math.ceil(viewEnd) + 1);

  if (!rows.length) return null;

  return (
    <div ref={chartRef} className="relative select-none">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-red-400" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Rating Landscape
            </h2>
          </div>
          <p className="mt-1 text-[9px] text-white/20">
            Hero rating across the meta · {shownStart}–{shownEnd} of {rows.length}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={zoomToTop20}
            className="rounded border border-white/[0.06] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30 transition-colors hover:border-white/[0.12] hover:text-white/60"
          >
            Top 20
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="rounded border border-white/[0.06] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30 transition-colors hover:border-white/[0.12] hover:text-white/60"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-lg border border-white/[0.05] bg-black/10 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onDoubleClick={resetZoom}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Hero meta rating landscape"
        >
          <defs>
            <linearGradient id="ratingLandscapeGlow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(248 113 113)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="rgb(248 113 113)" stopOpacity="0" />
            </linearGradient>
            <filter id="ratingPointGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {points.map((point) => (
              <clipPath key={`clip-${point.hero.id}`} id={`heroClip-${point.hero.id}`}>
                <circle cx={point.x} cy={point.y} r={point.globalIndex < 20 ? 12 : 9} />
              </clipPath>
            ))}
          </defs>

          {Array.from({ length: 5 }).map((_, index) => {
            const ratio = index / 4;
            const value = yMax - ratio * (yMax - yMin);
            const y = padding.top + ratio * plotHeight;

            return (
              <g key={`y-${index}`}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.045)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.20)"
                  fontSize="9"
                  fontFamily="inherit"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          <text
            x="16"
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            fill="rgba(255,255,255,0.12)"
            fontSize="8"
            fontFamily="inherit"
            transform={`rotate(-90 16 ${padding.top + plotHeight / 2})`}
          >
            RATING
          </text>

          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotHeight}
            y2={padding.top + plotHeight}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {points.length > 1 && (
            <path
              d={points
                .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
                .join(" ")}
              fill="none"
              stroke="rgba(248,113,113,0.18)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {points.map((point) => {
            const isHovered = hoveredIndex === point.globalIndex;
            const isTop20 = point.globalIndex < 20;
            const radius = isTop20 ? 12 : 9;

            return (
              <g
                key={point.hero.id}
                onPointerEnter={() => {
                  if (!dragging) setHoveredIndex(point.globalIndex);
                }}
                onPointerLeave={() => {
                  if (!dragging) setHoveredIndex(null);
                }}
              >
                {isHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius + 7}
                    fill="rgba(248,113,113,0.13)"
                    filter="url(#ratingPointGlow)"
                  />
                )}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius + 1}
                  fill="rgba(10,10,10,0.95)"
                  stroke={
                    isHovered
                      ? "rgba(248,113,113,0.95)"
                      : isTop20
                        ? "rgba(248,113,113,0.48)"
                        : "rgba(255,255,255,0.10)"
                  }
                  strokeWidth={isHovered ? 2 : 1}
                />

                <image
                  href={getHeroAsset(point.hero, "portrait")}
                  x={point.x - radius}
                  y={point.y - radius}
                  width={radius * 2}
                  height={radius * 2}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#heroClip-${point.hero.id})`}
                  opacity={isHovered ? 1 : isTop20 ? 0.98 : 0.72}
                />

                {isTop20 && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius + 1}
                    fill="none"
                    stroke="rgba(248,113,113,0.32)"
                    strokeWidth="1"
                  />
                )}

                <rect
                  x={point.x - 12}
                  y={padding.top - 8}
                  width="24"
                  height={plotHeight + 16}
                  fill="transparent"
                />
              </g>
            );
          })}

          <text
            x={padding.left}
            y={height - 16}
            fill="rgba(255,255,255,0.18)"
            fontSize="9"
            fontFamily="inherit"
          >
            #{shownStart}
          </text>

          <text
            x={width - padding.right}
            y={height - 16}
            textAnchor="end"
            fill="rgba(255,255,255,0.18)"
            fontSize="9"
            fontFamily="inherit"
          >
            #{shownEnd}
          </text>

          <text
            x={width / 2}
            y={height - 16}
            textAnchor="middle"
            fill="rgba(255,255,255,0.13)"
            fontSize="8"
            fontFamily="inherit"
          >
            META RANK
          </text>
        </svg>

        {tooltipPoint && (
          <div
            className="pointer-events-none absolute top-3 z-10 w-52 -translate-x-1/2 rounded-lg border border-white/[0.08] bg-[#111111]/95 p-3 shadow-2xl backdrop-blur"
            style={{
              left: `${Math.min(
                86,
                Math.max(14, (tooltipPoint.x / width) * 100),
              )}%`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-white/[0.08] bg-white/[0.03]">
                <img
                  src={getHeroAsset(tooltipPoint.hero, "portrait")}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[10px] font-semibold text-white/90">
                  {tooltipPoint.hero.displayName || tooltipPoint.hero.name}
                </div>
                <div className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-white/25">
                  Meta Rank #{tooltipPoint.globalIndex + 1}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-2.5">
              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">Rating</div>
                <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-red-300">
                  {tooltipPoint.metaScore.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">Win</div>
                <div className="mt-0.5 text-[10px] tabular-nums text-white/60">
                  {formatPercent(tooltipPoint.winRate)}
                </div>
              </div>
              <div>
                <div className="text-[7px] uppercase tracking-[0.12em] text-white/20">Pick</div>
                <div className="mt-0.5 text-[10px] tabular-nums text-white/60">
                  {formatPercent(tooltipPoint.pickRate)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <span className="text-[8px] text-white/15">
          Scroll to zoom · Drag to pan
        </span>
        <span className="text-[8px] text-white/15">
          Double-click to reset
        </span>
      </div>
    </div>
  );
}

export default MetaRatingChart;
