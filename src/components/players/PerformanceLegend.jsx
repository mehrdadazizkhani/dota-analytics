const DEFAULT_ACTIVE = ["goldPerMinute", "networth", "heroDamage", "impact"];

function PerformanceLegend({ series, trends, activeSeries, setActiveSeries }) {
  function toggleSeries(key) {
    setActiveSeries((current) => {
      if (current.includes(key)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((item) => item !== key);
      }

      return [...current, key];
    });
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {series.map((item) => {
        const enabled = activeSeries.includes(item.key);

        const trend = trends?.[item.key];

        const trendIcon =
          trend?.trend === "up" ? "↑" : trend?.trend === "down" ? "↓" : "→";

        const trendColor =
          trend?.trend === "up"
            ? "text-emerald-400"
            : trend?.trend === "down"
              ? "text-red-400"
              : "text-white/30";

        return (
          <button
            key={item.key}
            onClick={() => toggleSeries(item.key)}
            className={`
                cursor-pointer
              flex items-center gap-2
              rounded-md
              border
              px-2 py-2
              text-left
              transition-all duration-200

              ${
                enabled
                  ? "border-white/[0.08] bg-white/[0.04]"
                  : "border-transparent opacity-40"
              }
            `}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span className="flex-1 text-[10px] uppercase tracking-wider text-white/60">
              {item.label}
            </span>

            <span className={`text-xs ${trendColor}`}>{trendIcon}</span>
          </button>
        );
      })}
    </div>
  );
}

export { DEFAULT_ACTIVE };

export default PerformanceLegend;
