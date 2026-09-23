import { useMemo } from "react";

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 360;

const PADDING = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 30,
};

function normalizeValues(values) {
  if (!values.length) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return values.map(() => 0.5);
  }

  return values.map((value) => {
    return (value - min) / (max - min);
  });
}

function buildPoints(values) {
  const normalized = normalizeValues(values);

  const width = CHART_WIDTH - PADDING.left - PADDING.right;

  const height = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  return normalized.map((value, index) => ({
    x: PADDING.left + (index / (normalized.length - 1)) * width,

    y: PADDING.top + height - value * height,
  }));
}

function buildPath(points) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function PerformanceChart({
  series,
  data,
  activeSeries,
  hoverIndex,
  setHoverIndex,
  setMousePosition,
  containerRef,
}) {
  const chartSeries = useMemo(() => {
    return series.map((item) => {
      const values = data.map((match) => Number(match[item.key] || 0));

      const points = buildPoints(values);

      return {
        ...item,
        points,
        path: buildPath(points),
      };
    });
  }, [series, data]);

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-[280px] w-full sm:h-[320px]"
      preserveAspectRatio="none"
      onMouseMove={(event) => {
        const rect = containerRef.current.getBoundingClientRect();

        const x = event.clientX - rect.left;

        const chartX = (x / rect.width) * CHART_WIDTH;

        const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;

        const index = Math.round(
          ((chartX - PADDING.left) / innerWidth) * (data.length - 1),
        );

        if (index >= 0 && index < data.length) {
          setHoverIndex(index);

          setMousePosition({
            rawX: x,
            rawY: event.clientY - rect.top,
            containerWidth: rect.width,
            containerHeight: rect.height,
          });
        }
      }}
      onMouseLeave={() => {
        setHoverIndex(null);
        setMousePosition(null);
      }}
    >
      {/* Grid */}

      {[0, 0.25, 0.5, 0.75, 1].map((level) => (
        <line
          key={level}
          x1={PADDING.left}
          x2={CHART_WIDTH - PADDING.right}
          y1={
            PADDING.top + (CHART_HEIGHT - PADDING.top - PADDING.bottom) * level
          }
          y2={
            PADDING.top + (CHART_HEIGHT - PADDING.top - PADDING.bottom) * level
          }
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="4 8"
        />
      ))}

      {/* Crosshair */}

      {hoverIndex !== null && (
        <line
          x1={
            PADDING.left +
            (hoverIndex / (data.length - 1)) *
              (CHART_WIDTH - PADDING.left - PADDING.right)
          }
          x2={
            PADDING.left +
            (hoverIndex / (data.length - 1)) *
              (CHART_WIDTH - PADDING.left - PADDING.right)
          }
          y1={PADDING.top}
          y2={CHART_HEIGHT - PADDING.bottom}
          stroke="rgba(255,255,255,0.25)"
        />
      )}

      {/* Lines */}

      {chartSeries.map((item) => {
        const visible = activeSeries.includes(item.key);

        return (
          <g key={item.key}>
            <path
              d={item.path}
              fill="none"
              stroke={item.color}
              strokeWidth={visible ? 2 : 1}
              opacity={visible ? 1 : 0.12}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="
    transition-all
    duration-500
  "
              style={{
                filter: visible
                  ? `drop-shadow(0 0 5px ${item.color}55)`
                  : "none",
              }}
            />

            {hoverIndex !== null && item.points[hoverIndex] && (
              <g>
                {/* Main point */}
                <circle
                  cx={item.points[hoverIndex].x}
                  cy={item.points[hoverIndex].y}
                  r={visible ? 3 : 1}
                  fill={item.color}
                  opacity={visible ? 1 : 0.25}
                  className="animate-pulse"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default PerformanceChart;
