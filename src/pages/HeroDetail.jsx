import { useParams } from "react-router-dom";
import { useHero } from "../hooks/useHero";
import { getHeroAsset } from "../lib/assets/heroes";

function HeroDetail() {
  const { heroId } = useParams();
  const { hero, loading, error } = useHero(heroId);

  if (loading) {
    return (
      <div>
        <p className="text-sm text-black/50 dark:text-white/50">
          Loading hero...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        <p>Failed to load hero.</p>

        <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
          {error.message}
        </pre>
      </div>
    );
  }

  if (!hero) {
    return (
      <div>
        <p className="text-sm text-black/50 dark:text-white/50">
          Hero not found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-black/40 dark:text-white/40">
          Hero
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {hero.displayName || hero.name}
        </h1>

        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          {hero.shortName || hero.name}
        </p>
      </div>

      {/* Hero showcase */}
      <div className="overflow-hidden rounded-lg border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-[1fr_1.4fr]">
          {/* Hero model */}
          <div className="flex items-center justify-center overflow-hidden bg-black/5 p-6 dark:bg-white/5">
            <img
              src={getHeroAsset(hero, "model")}
              alt={hero.displayName || hero.name}
              className="h-auto w-full max-w-[520px] object-contain"
            />
          </div>

          {/* Hero information */}
          <div className="flex flex-col justify-center p-6 lg:p-10">
            <p className="text-xs font-medium uppercase tracking-widest text-black/40 dark:text-white/40">
              Hero Information
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {hero.displayName || hero.name}
            </h2>

            {hero.aliases?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-black/40 dark:text-white/40">
                  Aliases
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {hero.aliases.map((alias) => (
                    <span
                      key={alias}
                      className="rounded-md border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics placeholder */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-xs text-black/40 dark:text-white/40">Win Rate</p>

          <p className="mt-2 text-2xl font-semibold">—</p>
        </div>

        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-xs text-black/40 dark:text-white/40">Pick Rate</p>

          <p className="mt-2 text-2xl font-semibold">—</p>
        </div>

        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-xs text-black/40 dark:text-white/40">Matches</p>

          <p className="mt-2 text-2xl font-semibold">—</p>
        </div>
      </div>
    </div>
  );
}

export default HeroDetail;
