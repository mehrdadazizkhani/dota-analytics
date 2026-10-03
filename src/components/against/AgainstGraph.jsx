import { useEffect, useMemo, useRef, useState } from "react";
import { buildWeightedGraph } from "../../lib/draft/draftGraph";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";

import { createGraphLayout, getNodeRadius } from "../../lib/draft/graphLayout";

const WIDTH = 1400;
const HEIGHT = 820;

function calculateImportance(node, edges) {
  const heroId = Number(node.heroId);

  const connectedEdges = edges.filter(
    (edge) => edge.from === heroId || edge.to === heroId,
  );

  if (!connectedEdges.length) {
    return 0;
  }

  const totalStrength = connectedEdges.reduce(
    (sum, edge) => sum + Number(edge.normalizedStrength || 0),
    0,
  );

  const averageStrength = totalStrength / connectedEdges.length;

  /*
   * Combination of:
   *
   * - number of meaningful relationships
   * - average relationship strength
   *
   * This prevents a hero with many weak
   * relationships from becoming huge.
   */
  const connectionScore = Math.min(1, connectedEdges.length / 7);

  return Math.min(1, connectionScore * 0.45 + averageStrength * 0.55);
}

function prepareNodes(nodes, edges) {
  return nodes.map((node) => {
    const importance = calculateImportance(node, edges);

    return {
      ...node,

      importance,

      radius: getNodeRadius(
        {
          ...node,
          importance,
        },
        11,
        18,
      ),
    };
  });
}

export default function AgainstGraph({ nodes = [], dataset, mode }) {
  const [layoutNodes, setLayoutNodes] = useState([]);

  const [hoveredHeroId, setHoveredHeroId] = useState(null);

  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  const [time, setTime] = useState(0);

  const animationFrame = useRef(null);

  const edges = useMemo(() => {
    if (!dataset) {
      return [];
    }

    return buildWeightedGraph(dataset, mode);
  }, [dataset, mode]);

  /*
   * Build the initial force-directed layout.
   *
   * Re-run when the relationship mode changes
   * because WITH and AGAINST have different edges.
   */
  useEffect(() => {
    if (!nodes.length) {
      setLayoutNodes([]);
      return;
    }

    const preparedNodes = prepareNodes(nodes, edges);

    const result = createGraphLayout({
      nodes: preparedNodes,
      edges,
      width: WIDTH,
      height: HEIGHT,
      config: {
        padding: 45,

        repulsion: 10000,

        collisionPadding: 10,

        linkDistance: 125,

        linkStrength: 0.038,

        boundaryStrength: 0.2,

        centerStrength: 0.0028,

        velocityDecay: 0.82,

        maxVelocity: 8,

        iterations: 300,
      },
    });

    setLayoutNodes(result);
  }, [nodes, edges, mode]);

  /*
   * Tiny continuous animation.
   *
   * This only updates the clock.
   * GraphNode handles the actual micro movement.
   */
  useEffect(() => {
    let mounted = true;

    const tick = (timestamp) => {
      if (!mounted) {
        return;
      }

      setTime(timestamp);

      animationFrame.current = requestAnimationFrame(tick);
    };

    animationFrame.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const nodeMap = useMemo(() => {
    return new Map(layoutNodes.map((node) => [Number(node.heroId), node]));
  }, [layoutNodes]);

  const connectedHeroIds = useMemo(() => {
    if (hoveredHeroId == null) {
      return new Set();
    }

    const connected = new Set();

    for (const edge of edges) {
      if (edge.from === hoveredHeroId) {
        connected.add(edge.to);
      }

      if (edge.to === hoveredHeroId) {
        connected.add(edge.from);
      }
    }

    return connected;
  }, [hoveredHeroId, edges]);

  const visibleEdges = useMemo(() => {
    return edges.filter(
      (edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to),
    );
  }, [edges, nodeMap]);

  if (!layoutNodes.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-600">
        No graph data available.
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onMouseLeave={() => {
        setHoveredHeroId(null);
        setHoveredEdgeId(null);
      }}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Edge glow */}
          <filter
            id="graph-edge-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Node glow */}
          <filter
            id="graph-node-glow"
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
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#08090b" />

        {/* Edges */}
        <g>
          {visibleEdges.map((edge) => {
            const from = nodeMap.get(edge.from);

            const to = nodeMap.get(edge.to);

            if (!from || !to) {
              return null;
            }

            return (
              <GraphEdge
                key={edge.id}
                edge={edge}
                from={nodeMap.get(edge.from)}
                to={nodeMap.get(edge.to)}
                hoveredHeroId={hoveredHeroId}
                hoveredEdgeId={hoveredEdgeId}
                mode={mode}
                onHover={setHoveredEdgeId}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {layoutNodes.map((node) => {
            const heroId = Number(node.heroId);

            const isConnected = connectedHeroIds.has(heroId);

            return (
              <GraphNode
                key={heroId}
                node={node}
                hoveredHeroId={hoveredHeroId}
                isConnected={isConnected}
                time={time}
                onHover={setHoveredHeroId}
                onLeave={() => setHoveredHeroId(null)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
