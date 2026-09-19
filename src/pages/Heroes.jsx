import Widget from "../components/ui/Widget";
import { useHeroes } from "../hooks/useHeroes";

function Heroes() {
  const { heroes, loading, error } = useHeroes();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Heroes</h1>

        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Explore Dota 2 heroes and their statistics.
        </p>
      </div>

      <Widget title="All Heroes">
        {loading && (
          <p className="text-sm text-black/50 dark:text-white/50">
            Loading heroes...
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {heroes.map((hero) => (
              <div
                key={hero.id}
                className="rounded-md border border-black/10 p-3 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="text-xs text-black/40 dark:text-white/40">
                  #{hero.id}
                </div>

                <div className="mt-1 text-sm font-medium">
                  {hero.displayName || hero.name}
                </div>

                <div className="mt-1 text-xs text-black/40 dark:text-white/40">
                  {hero.shortName || hero.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>
    </div>
  );
}

export default Heroes;
