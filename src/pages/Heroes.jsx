import { Link } from "react-router-dom";
import Widget from "../components/ui/Widget";
import { useHeroes } from "../hooks/useHeroes";
import { getHeroAsset } from "../lib/assets/heroes";

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
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
            {heroes.map((hero) => (
              <Link
                key={hero.id}
                to={`/heroes/${hero.id}`}
                className="group block overflow-hidden rounded-lg border border-black/10 bg-black/[0.02] transition hover:border-black/20 hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
              >
                <div className="overflow-hidden bg-black/5 dark:bg-white/5">
                  <img
                    src={getHeroAsset(hero, "portrait")}
                    alt={hero.displayName || hero.name}
                    className="block h-auto w-full transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>

                <div className="p-2.5">
                  <h2 className="truncate text-sm font-semibold">
                    {hero.displayName || hero.name}
                  </h2>

                  <p className="mt-1 truncate text-xs text-black/40 dark:text-white/40">
                    {hero.shortName || hero.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Widget>
    </div>
  );
}

export default Heroes;
