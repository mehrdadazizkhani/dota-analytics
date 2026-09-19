import Widget from "../components/ui/Widget";
import WidgetGrid from "../components/ui/WidgetGrid";
import { useHeroes } from "../hooks/useHeroes";

function Overview() {
  const { heroes, loading, error } = useHeroes();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>

        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Dota 2 competitive analytics and statistics.
        </p>
      </div>

      <WidgetGrid>
        <Widget title="Heroes">
          {loading && (
            <p className="text-sm text-black/50 dark:text-white/50">
              Loading...
            </p>
          )}

          {error && (
            <div className="text-sm text-red-500">
              <p>Failed to load heroes.</p>

              <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                {error.message}
              </pre>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="text-2xl font-semibold">{heroes.length}</div>

              <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                Heroes available from STRATZ
              </p>
            </>
          )}
        </Widget>

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
      </WidgetGrid>
    </div>
  );
}

export default Overview;
