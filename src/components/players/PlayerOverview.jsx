function PlayerOverview({ overview }) {
  if (!overview) {
    return null;
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Overview
        </h2>

        <p className="mt-1 text-sm text-white/40">
          Player performance summary.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-white/40">Matches</p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {overview.matchCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-white/40">Win Rate</p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {overview.winRate.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-white/40">Wins / Losses</p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {overview.winCount}
            <span className="mx-2 text-white/20">/</span>
            {overview.lossCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-white/40">First Match</p>

          <p className="mt-2 text-lg font-semibold text-white">
            {overview.firstMatchDate
              ? new Date(overview.firstMatchDate).toLocaleDateString()
              : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default PlayerOverview;
