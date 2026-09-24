function Metric({ label, value }) {
  const normalized = Math.max(-100, Math.min(100, Number(value || 0)));
  const positive = normalized >= 0;

  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="mb-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/25">
        {label}
      </div>

      <div
        className={`text-[11px] font-semibold ${
          positive ? "text-emerald-400/70" : "text-red-400/70"
        }`}
      >
        {positive ? "+" : ""}
        {normalized.toFixed(1)}
      </div>
    </div>
  );
}

function DraftAnalysis({ analysis }) {
  if (!analysis) return null;

  const advantage = Number(analysis.advantage || 0);

  const normalizedAdvantage = Math.max(-100, Math.min(100, advantage));

  const advantageLabel = analysis.label || "NEUTRAL";

  const advantageColor =
    advantageLabel === "ADVANTAGE"
      ? "text-emerald-400"
      : advantageLabel === "DISADVANTAGE"
        ? "text-red-400"
        : "text-white/40";

  return (
    <section className="relative border-b border-white/[0.06] px-4 py-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      <div className="mb-4 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-amber-400" />

        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
          Draft Analysis
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-4">
          <div className="mb-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">
            Estimated Draft Advantage
          </div>

          <div
            className={`text-2xl font-semibold tracking-tight ${advantageColor}`}
          >
            {normalizedAdvantage > 0 ? "+" : ""}
            {normalizedAdvantage.toFixed(1)}
          </div>

          <div
            className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${advantageColor}`}
          >
            {advantageLabel}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Meta" value={analysis.metrics?.meta} />

          <Metric label="Synergy" value={analysis.metrics?.synergy} />

          <Metric label="Counter" value={analysis.metrics?.counter} />
          <Metric label="Ban Impact" value={analysis.metrics?.banImpact} />
        </div>
      </div>
    </section>
  );
}

export default DraftAnalysis;
