import { useMemo, useRef, useState } from "react";

import {
  getPlayerPerformanceData,
  getPerformanceTrends,
} from "../../lib/analytics/playerPerformanceAnalytics";

import PerformanceChart from "./PerformanceChart";

import PerformanceLegend, { DEFAULT_ACTIVE } from "./PerformanceLegend";

const SERIES = [
  {
    key: "goldPerMinute",
    label: "GPM",
    color: "#facc15",
  },
  {
    key: "networth",
    label: "Networth",
    color: "#22c55e",
  },
  {
    key: "heroDamage",
    label: "Hero Damage",
    color: "#ef4444",
  },
  {
    key: "impact",
    label: "Impact",
    color: "#f472b6",
  },
  {
    key: "numLastHits",
    label: "Last Hits",
    color: "#f59e0b",
  },
  {
    key: "numDenies",
    label: "Denies",
    color: "#a78bfa",
  },
  {
    key: "experiencePerMinute",
    label: "XPM",
    color: "#38bdf8",
  },
  {
    key: "towerDamage",
    label: "Tower Damage",
    color: "#fb7185",
  },
  {
    key: "heroHealing",
    label: "Healing",
    color: "#4ade80",
  },
  {
    key: "performanceScore",
    label: "Performance",
    color: "#ffffff",
  },
];

function getHeroImage(shortName) {
  if (!shortName) {
    return "";
  }

  return `https://cdn.stratz.com/images/dota2/heroes/${shortName}_vert.png`;
}

function PlayerPerformanceAnalytics({ matches }) {
  const TOOLTIP_WIDTH = 280;
  const TOOLTIP_HEIGHT = 240;
  const TOOLTIP_OFFSET = 20;
  const containerRef = useRef(null);

  const [hoverIndex, setHoverIndex] = useState(null);

  const [mousePosition, setMousePosition] = useState(null);

  const [activeSeries, setActiveSeries] = useState(DEFAULT_ACTIVE);

  const data = useMemo(() => {
    return getPlayerPerformanceData(matches);
  }, [matches]);

  const trends = useMemo(() => {
    return getPerformanceTrends(matches);
  }, [matches]);

  const hoveredMatch = hoverIndex !== null ? data[hoverIndex] : null;

  if (!data.length) {
    return null;
  }

  const tooltipPosition = mousePosition
    ? {
        x:
          mousePosition.rawX + TOOLTIP_WIDTH + TOOLTIP_OFFSET >
          mousePosition.containerWidth
            ? mousePosition.rawX - TOOLTIP_WIDTH - TOOLTIP_OFFSET
            : mousePosition.rawX + TOOLTIP_OFFSET,

        y:
          mousePosition.rawY + TOOLTIP_HEIGHT + TOOLTIP_OFFSET >
          mousePosition.containerHeight
            ? mousePosition.rawY - TOOLTIP_HEIGHT - TOOLTIP_OFFSET
            : mousePosition.rawY + TOOLTIP_OFFSET,
      }
    : null;

  return (
    <section
      ref={containerRef}
      className="
        relative
        overflow-visible
        rounded-lg
        border
        border-white/[0.07]
        bg-[#050505]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-red-500/30
          to-transparent
        "
      />

      <div className="relative p-4 sm:p-5">
        {/* Header */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2
              className="
                text-sm
                font-semibold
                uppercase
                tracking-widest
                text-white
              "
            >
              Performance Analytics
            </h2>

            <p
              className="
                mt-1
                text-[10px]
                uppercase
                tracking-wider
                text-white/25
              "
            >
              Player progression / selected matches
            </p>
          </div>

          <div className="text-right">
            <div
              className="
                text-[9px]
                uppercase
                tracking-widest
                text-white/25
              "
            >
              Matches
            </div>

            <div
              className="
                text-lg
                font-semibold
                text-white
              "
            >
              {data.length}
            </div>
          </div>
        </div>

        {/* Chart */}

        <div className="w-full overflow-hidden">
          <PerformanceChart
            series={SERIES}
            data={data}
            activeSeries={activeSeries}
            hoverIndex={hoverIndex}
            setHoverIndex={setHoverIndex}
            setMousePosition={setMousePosition}
            containerRef={containerRef}
          />
        </div>

        {/* Legend */}

        <PerformanceLegend
          series={SERIES}
          trends={trends}
          activeSeries={activeSeries}
          setActiveSeries={setActiveSeries}
        />

        {/* Tooltip */}

        {hoveredMatch && mousePosition && (
          <div
            className="
              pointer-events-none
              absolute
              z-[100]
              max-w-[280px]
              rounded-lg
              border
              border-white/[0.08]
              bg-[#080808]/95
              p-4
              shadow-2xl
            "
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            <div
              className="
                mb-3
                flex
                items-center
                gap-3
              "
            >
              {hoveredMatch.hero?.shortName && (
                <img
                  src={getHeroImage(hoveredMatch.hero.shortName)}
                  alt={hoveredMatch.hero.displayName}
                  className="
                    h-10
                    w-8
                    rounded
                    object-cover
                  "
                />
              )}

              <div>
                <div
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Match #{hoverIndex + 1}
                </div>

                <div
                  className="
                    text-[10px]
                    uppercase
                    text-white/40
                  "
                >
                  {hoveredMatch.hero?.displayName}
                </div>
              </div>
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-x-6
                gap-y-2
                text-[11px]
                text-white/50
              "
            >
              <span>
                Last Hits
                <b className="ml-2 text-white">{hoveredMatch.numLastHits}</b>
              </span>

              <span>
                Denies
                <b className="ml-2 text-white">{hoveredMatch.numDenies}</b>
              </span>

              <span>
                GPM
                <b className="ml-2 text-white">{hoveredMatch.goldPerMinute}</b>
              </span>

              <span>
                Networth
                <b className="ml-2 text-white">{hoveredMatch.networth}</b>
              </span>

              <span>
                XPM
                <b className="ml-2 text-white">
                  {hoveredMatch.experiencePerMinute}
                </b>
              </span>

              <span>
                Impact
                <b className="ml-2 text-white">
                  {hoveredMatch.impact?.toFixed(1)}
                </b>
              </span>

              <span>
                Hero DMG
                <b className="ml-2 text-white">{hoveredMatch.heroDamage}</b>
              </span>

              <span>
                Tower DMG
                <b className="ml-2 text-white">{hoveredMatch.towerDamage}</b>
              </span>

              <span>
                Healing
                <b className="ml-2 text-white">{hoveredMatch.heroHealing}</b>
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PlayerPerformanceAnalytics;
