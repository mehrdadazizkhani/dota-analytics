import { useEffect, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getPointOnLine(from, to, t) {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
  };
}

function getPerpendicular(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  if (!length) {
    return { x: 0, y: 1 };
  }

  return {
    x: -dy / length,
    y: dx / length,
  };
}

function createElasticPath(from, to, particleT, amplitude, spread) {
  const segments = 32;
  const perpendicular = getPerpendicular(from, to);

  let path = "";

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;

    const point = getPointOnLine(from, to, t);

    const distance = t - particleT;

    const deformation =
      amplitude * Math.exp(-(distance * distance) / (2 * spread * spread));

    /*
     * Make the deformation slightly
     * asymmetrical so it feels organic
     * instead of perfectly mechanical.
     */
    const frontBias = distance > 0 ? 0.82 : 1.0;

    const offset = deformation * frontBias;

    const x = point.x + perpendicular.x * offset;

    const y = point.y + perpendicular.y * offset;

    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  return path;
}

function createElasticOutline(
  from,
  to,
  particleT,
  baseWidth,
  maxWidth,
  spread,
) {
  const segments = 32;
  const perpendicular = getPerpendicular(from, to);

  const top = [];
  const bottom = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;

    const point = getPointOnLine(from, to, t);

    const distance = t - particleT;

    const influence = Math.exp(-(distance * distance) / (2 * spread * spread));

    const width = baseWidth + (maxWidth - baseWidth) * influence;

    top.push({
      x: point.x + perpendicular.x * width,
      y: point.y + perpendicular.y * width,
    });

    bottom.push({
      x: point.x - perpendicular.x * width,
      y: point.y - perpendicular.y * width,
    });
  }

  let path = "";

  top.forEach((point, index) => {
    path +=
      index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`;
  });

  for (let i = bottom.length - 1; i >= 0; i -= 1) {
    const point = bottom[i];

    path += ` L ${point.x} ${point.y}`;
  }

  path += " Z";

  return path;
}

export default function GraphEdge({
  edge,
  from,
  to,
  hoveredHeroId,
  hoveredEdgeId,
  mode,
  onHover,
}) {
  const [time, setTime] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  if (!from || !to) {
    return null;
  }

  const touchesHovered =
    hoveredHeroId != null &&
    (edge.from === hoveredHeroId || edge.to === hoveredHeroId);

  const isEdgeHovered = hoveredEdgeId === edge.id;

  const isActive = touchesHovered || isEdgeHovered;

  const isWith = mode === "WITH";

  /*
   * WITH is visually bidirectional.
   * AGAINST follows the semantic edge direction.
   */
  let animationFrom = from;
  let animationTo = to;

  if (isWith && from.x > to.x) {
    animationFrom = to;
    animationTo = from;
  }

  /*
   * Animation only runs while active.
   */
  useEffect(() => {
    if (!isActive) {
      setTime(0);
      startRef.current = null;
      return undefined;
    }

    const duration = isWith ? 3600 : 3200;

    const animate = (timestamp) => {
      if (!startRef.current) {
        startRef.current = timestamp;
      }

      const elapsed = timestamp - startRef.current;

      const raw = (elapsed % duration) / duration;

      setTime(raw);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = null;
      startRef.current = null;
    };
  }, [isActive, isWith]);

  const dx = animationTo.x - animationFrom.x;

  const dy = animationTo.y - animationFrom.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  if (!length) {
    return null;
  }

  /*
   * Continuous ping-pong for WITH.
   *
   * The direction changes smoothly at
   * both ends instead of teleporting.
   */
  let particleT;

  if (isWith) {
    const pingPong = time < 0.5 ? time * 2 : 2 - time * 2;

    particleT = easeInOutSine(pingPong);
  } else {
    /*
     * AGAINST is one-way.
     *
     * It starts softly, travels through
     * the wire, then fades near the end.
     */
    particleT = easeInOutSine(time);
  }

  /*
   * Elastic deformation.
   *
   * The deformation is strongest around
   * the glass particle and fades smoothly
   * on both sides.
   */
  const amplitude = Math.min(12, Math.max(5, length * 0.025));

  const spread = 0.085;

  const elasticPath = createElasticPath(
    animationFrom,
    animationTo,
    particleT,
    amplitude,
    spread,
  );

  /*
   * The actual glowing body around the
   * particle.
   */
  const outlinePath = createElasticOutline(
    animationFrom,
    animationTo,
    particleT,
    0.45,
    3.2,
    0.075,
  );

  const particle = getPointOnLine(animationFrom, animationTo, particleT);

  const color = isWith
    ? "#22d3ee"
    : edge.from === hoveredHeroId
      ? "#22c55e"
      : "#ef4444";

  const safeId = String(edge.id).replace(/[^a-zA-Z0-9_-]/g, "-");

  const glowId = `wire-glow-${safeId}`;

  return (
    <g
      onMouseEnter={() => onHover?.(edge)}
      onMouseLeave={() => onHover?.(null)}
      className="cursor-pointer"
    >
      {/* Interaction area */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth="14"
        strokeLinecap="round"
      />

      <defs>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />

            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Always-thin base wire */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={
          isActive
            ? color
            : hoveredHeroId != null
              ? "rgba(148,163,184,0.035)"
              : "rgba(148,163,184,0.13)"
        }
        strokeWidth="0.7"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {isActive && (
        <>
          {/* Soft elastic body */}
          <path
            d={elasticPath}
            fill="none"
            stroke={color}
            strokeWidth="2.8"
            strokeLinecap="round"
            opacity="0.2"
            filter={`url(#${glowId})`}
            vectorEffect="non-scaling-stroke"
          />

          {/* Stronger elastic body */}
          <path
            d={elasticPath}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.8"
            vectorEffect="non-scaling-stroke"
          />

          {/* Variable-thickness elastic envelope */}
          <path
            d={outlinePath}
            fill={color}
            opacity="0.14"
            filter={`url(#${glowId})`}
          />

          {/* Glass particle glow */}
          <circle
            cx={particle.x}
            cy={particle.y}
            r="6"
            fill={color}
            opacity="0.22"
            filter={`url(#${glowId})`}
          />

          {/* Glass particle */}
          <circle
            cx={particle.x}
            cy={particle.y}
            r="2.8"
            fill="#ecfeff"
            opacity="0.95"
          />

          {/* Tiny bright core */}
          <circle
            cx={particle.x - 0.8}
            cy={particle.y - 0.8}
            r="0.9"
            fill="white"
            opacity="1"
          />
        </>
      )}
    </g>
  );
}
