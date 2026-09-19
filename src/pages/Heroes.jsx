import { Link } from "react-router-dom";
import Widget from "../components/ui/Widget";
import HeroFilters from "../components/heroes/HeroFilters";
import { useHeroes } from "../hooks/useHeroes";
import { useHeroMeta } from "../hooks/useHeroMeta";
import { useHeroFilters } from "../hooks/useHeroFilters";
import { getHeroAsset } from "../lib/assets/heroes";
import { getAttributeAsset } from "../lib/assets/attributes";

const ATTRIBUTE_GROUPS = [
  {
    label: "Strength",
    value: "STRENGTH",
  },
  {
    label: "Agility",
    value: "AGILITY",
  },
  {
    label: "Intelligence",
    value: "INTELLIGENCE",
  },
  {
    label: "Universal",
    value: "UNIVERSAL",
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

function HeroCard({ hero, isMatch, hasActiveFilters, isMeta }) {
  return (
    <Link
      to={`/heroes/${hero.id}`}
      className={`group block overflow-hidden rounded-md bg-white/[0.02] transition ${
        hasActiveFilters && !isMatch
          ? "border-2 border-white/10 opacity-20 grayscale"
          : isMeta
            ? "border-2 border-[#ef4444] hover:border-[#ef4444]"
            : "border-2 border-white/10 hover:border-white/20"
      }`}
    >
      <div className="relative aspect-[71/94] overflow-hidden bg-white/[0.03]">
        {isMeta && (
          <div className="pointer-events-none absolute -right-[2px] -top-[2px] z-10 h-[18px] w-[18px]">
            <svg
              viewBox="0 0 14 14"
              className="h-full w-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,2C0,0.895 0.895,0 2,0L12,0C13.105,0 14,0.895 14,2L14,12C14,13.105 13.105,14 12,14L12,14C10.643,13.996 9.293,13.773 8.012,13.321C6.325,12.727 4.779,11.75 3.515,10.485C2.25,9.221 1.273,7.675 0.679,5.988C0.236,4.732 0.013,3.409 0,2.078L0,2Z"
                fill="#ef4444"
              />

              <path
                d="M6.594,4.249L7.571,2.267C7.747,1.909 8.254,1.913 8.429,2.267L9.405,4.249L11.59,4.568C11.982,4.625 12.139,5.108 11.855,5.385L10.274,6.927L10.648,9.106C10.716,9.5 10.301,9.793 9.954,9.61L8,8.582L6.046,9.61C5.699,9.795 5.285,9.5 5.351,9.106L5.726,6.928L4.145,5.386C3.861,5.109 4.018,4.625 4.41,4.568L6.594,4.249Z"
                fill="#000000"
              />
            </svg>
          </div>
        )}

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

function HeroGroup({ group, heroes, heroMatches, heroMeta, hasActiveFilters }) {
  const attributeIcon = getAttributeAsset(group.value);

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {attributeIcon && (
            <img
              src={attributeIcon}
              alt=""
              className="h-4 w-4 object-contain"
            />
          )}

          <h2 className="text-[10px] font-semibold uppercase tracking-widest">
            {group.label}
          </h2>
        </div>

        <div className="h-px flex-1 bg-white/10" />

        <span className="text-[9px] text-white/30">{heroes.length}</span>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
        {heroes.map((hero) => {
          const metaData = heroMeta.get(Number(hero.id));

          return (
            <HeroCard
              key={hero.id}
              hero={hero}
              isMatch={heroMatches.get(hero.id)}
              hasActiveFilters={hasActiveFilters}
              isMeta={Boolean(metaData?.isMeta)}
            />
          );
        })}
      </div>
    </section>
  );
}

function Heroes() {
  const { heroes, loading, error, retry } = useHeroes();

  const { meta, loading: metaLoading, error: metaError } = useHeroMeta(heroes);

  console.log("Heroes:", heroes.length);
  console.log("Meta:", meta.length);
  console.log("Meta heroes:", meta.filter((hero) => hero.isMeta).length);
  console.log("Meta data:", meta);

  const {
    filters,
    heroMatches,
    heroMeta,
    hasActiveFilters,
    setSearch,
    setAttackType,
    setComplexity,
    setMainRole,
    toggleRole,
    toggleMeta,
    clearFilters,
  } = useHeroFilters(heroes, meta);

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Heroes</h1>

        <p className="mt-1 text-sm text-white/50">
          Explore Dota 2 heroes and their statistics.
        </p>
      </div>

      <Widget title="All Heroes">
        {loading && <p className="text-sm text-white/50">Loading heroes...</p>}

        {error && (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-white/80">
              Unable to load hero data.
            </p>

            <p className="mt-1 text-xs text-white/40">
              STRATZ is temporarily unavailable. Please try again.
            </p>

            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {metaError && (
              <div className="mb-4 text-[10px] text-white/30">
                Meta data is currently unavailable.
              </div>
            )}

            {metaLoading && (
              <div className="mb-4 text-[10px] text-white/30">
                Loading meta data...
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {ATTRIBUTE_GROUPS.map((group) => {
                const groupHeroes = heroes.filter(
                  (hero) => getHeroAttribute(hero) === group.value,
                );

                return (
                  <HeroGroup
                    key={group.value}
                    group={group}
                    heroes={groupHeroes}
                    heroMatches={heroMatches}
                    heroMeta={heroMeta}
                    hasActiveFilters={hasActiveFilters}
                  />
                );
              })}

              {heroes.some((hero) => getHeroAttribute(hero) === "UNKNOWN") && (
                <HeroGroup
                  group={{
                    label: "Unknown",
                    value: "UNKNOWN",
                  }}
                  heroes={heroes.filter(
                    (hero) => getHeroAttribute(hero) === "UNKNOWN",
                  )}
                  heroMatches={heroMatches}
                  heroMeta={heroMeta}
                  hasActiveFilters={hasActiveFilters}
                />
              )}
            </div>
          </>
        )}
      </Widget>

      <HeroFilters
        filters={filters}
        setSearch={setSearch}
        setAttackType={setAttackType}
        setComplexity={setComplexity}
        setMainRole={setMainRole}
        toggleRole={toggleRole}
        toggleMeta={toggleMeta}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}

export default Heroes;
