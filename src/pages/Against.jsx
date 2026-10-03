import { useEffect, useMemo, useState } from "react";
import { getDraftData, getHeroes } from "../lib/api/stratz";
import { buildDraftDataset } from "../lib/draft/draftData";
import { buildWeightedGraph } from "../lib/draft/draftGraph";
import { getHeroAsset } from "../lib/assets/heroes";

const GRAPH_WIDTH = 1400;
const GRAPH_HEIGHT = 820;

const NODE_RADIUS = 22;

function buildNodes(heroes) {
  const list = [...heroes.values()];

  const centerX = GRAPH_WIDTH / 2;
  const centerY = GRAPH_HEIGHT / 2;

  const radius = Math.min(GRAPH_WIDTH, GRAPH_HEIGHT) * 0.37;

  return list.map((hero, index) => {
    const angle = (index / list.length) * Math.PI * 2;

    return {
      ...hero,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });
}

function getHeroName(hero) {
  return hero?.displayName || hero?.name || hero?.shortName || "Unknown Hero";
}

function getEdgeColor(edge, hoveredHeroId, mode) {
  if (!hoveredHeroId) {
    return "rgba(148, 163, 184, 0.16)";
  }

  const touchesHovered =
    edge.from === hoveredHeroId || edge.to === hoveredHeroId;

  if (!touchesHovered) {
    return "rgba(148, 163, 184, 0.06)";
  }

  if (mode === "WITH") {
    return edge.value >= 0 ? "#22c55e" : "#ef4444";
  }

  if (edge.from === hoveredHeroId) {
    return "#22c55e";
  }

  if (edge.to === hoveredHeroId) {
    return "#ef4444";
  }

  return "rgba(148, 163, 184, 0.16)";
}

function getEdgeWidth(edge, hoveredHeroId) {
  const base = 0.7 + edge.normalizedStrength * 3.5;

  if (!hoveredHeroId) {
    return base;
  }

  const touchesHovered =
    edge.from === hoveredHeroId || edge.to === hoveredHeroId;

  return touchesHovered ? base + 1.5 : 0.5;
}

export default function Against() {
  const [mode, setMode] = useState("AGAINST");

  const [heroes, setHeroes] = useState([]);
  const [dataset, setDataset] = useState(null);

  const [hoveredHeroId, setHoveredHeroId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [heroData, draftData] = await Promise.all([
          getHeroes(),
          getDraftData("DIVINE_IMMORTAL"),
        ]);

        if (cancelled) {
          return;
        }

        const normalizedDataset = buildDraftDataset(draftData);

        const heroMap = new Map(
          heroData.map((hero) => [Number(hero.id), hero]),
        );

        const graphHeroes = [];

        for (const hero of normalizedDataset.heroes.values()) {
          const metadata = heroMap.get(hero.heroId);

          if (!metadata) {
            continue;
          }

          graphHeroes.push({
            ...hero,
            ...metadata,
            heroId: Number(hero.heroId),
          });
        }

        setHeroes(graphHeroes);
        setDataset({
          ...normalizedDataset,
          heroes: new Map(graphHeroes.map((hero) => [hero.heroId, hero])),
        });
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(err?.message || "Failed to load hero matchup data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const nodes = useMemo(() => {
    if (!dataset) {
      return [];
    }

    return buildNodes(dataset.heroes);
  }, [dataset]);

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((node) => [Number(node.heroId), node]));
  }, [nodes]);

  const edges = useMemo(() => {
    if (!dataset) {
      return [];
    }

    return buildWeightedGraph(dataset, mode);
  }, [dataset, mode]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading hero relationships...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#08090b]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">
            Hero Relationships
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            Explore hero synergy and matchup relationships.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.025] p-1">
          {["WITH", "AGAINST"].map((option) => {
            const active = mode === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={[
                  "rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition",
                  active
                    ? "bg-white/[0.1] text-white"
                    : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Graph */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <svg
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredHeroId(null)}
        >
          {/* Edges */}
          <g>
            {edges.map((edge) => {
              const from = nodeMap.get(edge.from);

              const to = nodeMap.get(edge.to);

              if (!from || !to) {
                return null;
              }

              const color = getEdgeColor(edge, hoveredHeroId, mode);

              const width = getEdgeWidth(edge, hoveredHeroId);

              return (
                <line
                  key={edge.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={color}
                  strokeWidth={width}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="transition-all duration-150"
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((node) => {
              const heroId = Number(node.heroId);

              const isHovered = hoveredHeroId === heroId;

              const isConnected =
                hoveredHeroId != null &&
                edges.some(
                  (edge) =>
                    (edge.from === hoveredHeroId && edge.to === heroId) ||
                    (edge.to === hoveredHeroId && edge.from === heroId),
                );

              const dimmed =
                hoveredHeroId != null && !isHovered && !isConnected;

              const asset = getHeroAsset(node, "icon");

              return (
                <g
                  key={heroId}
                  transform={`translate(${node.x} ${node.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHeroId(heroId)}
                >
                  {/* Glow */}
                  <circle
                    r={isHovered ? NODE_RADIUS + 8 : NODE_RADIUS + 4}
                    fill={isHovered ? "rgba(255,255,255,0.12)" : "transparent"}
                    className="transition-all duration-150"
                  />

                  {/* Hero image */}
                  <image
                    href={asset}
                    x={-NODE_RADIUS}
                    y={-NODE_RADIUS}
                    width={NODE_RADIUS * 2}
                    height={NODE_RADIUS * 2}
                    preserveAspectRatio="xMidYMid slice"
                    opacity={dimmed ? 0.18 : 1}
                    className="transition-opacity duration-150"
                  />

                  {/* Border */}
                  <circle
                    r={NODE_RADIUS}
                    fill="none"
                    stroke={
                      isHovered
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.12)"
                    }
                    strokeWidth={isHovered ? 2 : 1}
                  />

                  {/* Tooltip */}
                  {isHovered && (
                    <g transform={`translate(0 ${NODE_RADIUS + 18})`}>
                      <rect
                        x="-70"
                        y="-12"
                        width="140"
                        height="24"
                        rx="5"
                        fill="#111318"
                        stroke="rgba(255,255,255,0.1)"
                      />

                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {getHeroName(node)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-5 left-5 rounded-lg border border-white/[0.07] bg-[#0d0f12]/90 px-3 py-2 backdrop-blur">
          {mode === "AGAINST" ? (
            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Counters
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Countered by
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Positive synergy
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Negative synergy
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="absolute bottom-5 right-5 rounded-lg border border-white/[0.07] bg-[#0d0f12]/90 px-3 py-2 text-[10px] text-zinc-500 backdrop-blur">
          {nodes.length} heroes · {edges.length} relationships
        </div>
      </div>
    </div>
  );
}
