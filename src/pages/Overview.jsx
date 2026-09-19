import Widget from "../components/ui/Widget";
import WidgetGrid from "../components/ui/WidgetGrid";

function Overview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>

        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Dota 2 competitive analytics and statistics.
        </p>
      </div>

      <WidgetGrid>
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
      </WidgetGrid>
    </div>
  );
}

export default Overview;
