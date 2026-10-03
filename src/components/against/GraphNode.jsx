import { getHeroAsset } from "../../lib/assets/heroes";

function getHeroName(hero) {
  return hero?.displayName || hero?.name || hero?.shortName || "Unknown Hero";
}

export default function GraphNode({
  node,
  hoveredHeroId,
  isConnected,
  onHover,
  onLeave,
  time = 0,
}) {
  const heroId = Number(node.heroId);

  const isHovered = hoveredHeroId === heroId;

  const dimmed = hoveredHeroId != null && !isHovered && !isConnected;

  const importance = Math.max(0, Math.min(1, Number(node.importance || 0)));

  /*
   * Background nodes are slightly smaller.
   * Important heroes sit visually closer to
   * the foreground.
   */
  const baseRadius = 11 + importance * 7;

  const depth = Number(node.depth || 0.85);

  /*
   * Very subtle idle movement.
   *
   * Each hero gets its own phase so they don't
   * all move together.
   */
  const phase = Number(node.heroId || 1) * 0.73;

  const floatX = Math.sin(time * 0.00075 + phase) * (1.1 + depth * 1.2);

  const floatY = Math.cos(time * 0.00062 + phase * 1.37) * (1.0 + depth * 1.1);

  const radius = isHovered ? baseRadius + 3 : baseRadius;

  const scale = isHovered ? 1.08 : 0.94 + depth * 0.06;

  const opacity = dimmed ? 0.16 : 0.72 + depth * 0.28;

  const asset = getHeroAsset(node, "icon");

  return (
    <g
      transform={`
        translate(
          ${node.x + floatX}
          ${node.y + floatY}
        )
        scale(${scale})
      `}
      className="cursor-pointer"
      onMouseEnter={() => onHover?.(heroId)}
      onMouseLeave={() => onLeave?.()}
      style={{
        opacity,
        transition: "opacity 180ms ease, transform 180ms ease",
      }}
    >
      {/* Soft outer glow */}
      <circle
        r={radius + 7}
        fill={isHovered ? "rgba(255,255,255,0.13)" : "transparent"}
        opacity={isHovered ? 1 : 0}
      />

      {/* Secondary depth halo */}
      {!isHovered && (
        <circle
          r={radius + 3}
          fill="none"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
        />
      )}

      {/* Hero icon */}
      <image
        href={asset}
        x={-radius}
        y={-radius}
        width={radius * 2}
        height={radius * 2}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Dark border */}
      <circle
        r={radius}
        fill="none"
        stroke={isHovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.16)"}
        strokeWidth={isHovered ? 2 : 1}
      />

      {/* Hover ring */}
      {isHovered && (
        <circle
          r={radius + 5}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          opacity="0.8"
        />
      )}

      {/* Tooltip */}
      {isHovered && (
        <g transform={`translate(0 ${radius + 20})`}>
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
}
