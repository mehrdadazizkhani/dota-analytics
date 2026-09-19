import { Link } from "react-router-dom";
import Widget from "../components/ui/Widget";
import HeroFilters from "../components/heroes/HeroFilters";
import { useHeroes } from "../hooks/useHeroes";
import { useHeroFilters } from "../hooks/useHeroFilters";
import { getHeroAsset } from "../lib/assets/heroes";

const ATTRIBUTE_GROUPS = [
  {
    label: "Strength",
    values: ["STRENGTH"],
  },
  {
    label: "Agility",
    values: ["AGILITY"],
  },
  {
    label: "Intelligence",
    values: ["INTELLIGENCE"],
  },
  {
    label: "Universal",
    values: ["UNIVERSAL"],
  },
];

function getHeroAttribute(hero) {
  const attribute = String(
    hero.stats?.primaryAttributeEnum || hero.stats?.primaryAttribute || "",
  ).toUpperCase();

  if (attribute.includes("STRENGTH") || attribute === "STR") {
    return "STRENGTH";
  }

  if (attribute.includes("AGILITY") || attribute === "AGI") {
    return "AGILITY";
  }

  if (attribute.includes("INTELLIGENCE") || attribute === "INT") {
    return "INTELLIGENCE";
  }

  if (attribute.includes("UNIVERSAL") || attribute === "ALL") {
    return "UNIVERSAL";
  }

  return "UNKNOWN";
}

function HeroCard({ hero, isMatch, hasActiveFilters }) {
  return (
    <Link
      to={`/heroes/${hero.id}`}
      className={`group block overflow-hidden rounded-md border border-black/10 bg-black/[0.02] transition dark:border-white/10 dark:bg-white/[0.02] ${
        hasActiveFilters && !isMatch
          ? "opacity-20 grayscale"
          : "hover:border-black/20 hover:bg-black/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
      }`}
    >
      <div className="aspect-[71/94] overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={getHeroAsset(hero, "portrait")}
          alt={hero.displayName || hero.name}
          className="block h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="px-1 py-1">
        <h3 className="truncate text-[8px] font-semibold leading-tight sm:text-[9px]">
          {hero.displayName || hero.name}
        </h3>
      </div>
    </Link>
  );
}

function HeroGroup({ label, heroes, heroMatches, hasActiveFilters }) {
  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </h2>

        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />

        <span className="text-[9px] text-black/30 dark:text-white/30">
          {heroes.length}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
        {heroes.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            isMatch={heroMatches.get(hero.id)}
            hasActiveFilters={hasActiveFilters}
          />
        ))}
      </div>
    </section>
  );
}

function Heroes() {
  const { heroes, loading, error } = useHeroes();

  const {
    filters,
    heroMatches,
    hasActiveFilters,
    setSearch,
    setAttackType,
    setComplexity,
    setMainRole,
    toggleRole,
    clearFilters,
  } = useHeroFilters(heroes);

  return (
    <div className="pb-24">
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {ATTRIBUTE_GROUPS.map((group) => {
              const groupHeroes = heroes.filter((hero) =>
                group.values.includes(getHeroAttribute(hero)),
              );

              return (
                <HeroGroup
                  key={group.label}
                  label={group.label}
                  heroes={groupHeroes}
                  heroMatches={heroMatches}
                  hasActiveFilters={hasActiveFilters}
                />
              );
            })}

            {heroes.some((hero) => getHeroAttribute(hero) === "UNKNOWN") && (
              <HeroGroup
                label="Unknown"
                heroes={heroes.filter(
                  (hero) => getHeroAttribute(hero) === "UNKNOWN",
                )}
                heroMatches={heroMatches}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </div>
        )}
      </Widget>

      <HeroFilters
        filters={filters}
        setSearch={setSearch}
        setAttackType={setAttackType}
        setComplexity={setComplexity}
        setMainRole={setMainRole}
        toggleRole={toggleRole}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}

export default Heroes;
