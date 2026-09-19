import Widget from "../components/ui/Widget";

function Overview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>

        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Dota 2 competitive analytics and statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Widget title="Matches">
          <div className="text-2xl font-semibold">0</div>

          <p className="mt-1 text-xs text-black/50 dark:text-white/50">
            No data available
          </p>
        </Widget>

        <Widget title="Players">
          <div className="text-2xl font-semibold">0</div>

          <p className="mt-1 text-xs text-black/50 dark:text-white/50">
            No data available
          </p>
        </Widget>

        <Widget title="Heroes">
          <div className="text-2xl font-semibold">0</div>

          <p className="mt-1 text-xs text-black/50 dark:text-white/50">
            No data available
          </p>
        </Widget>
      </div>
    </div>
  );
}

export default Overview;
