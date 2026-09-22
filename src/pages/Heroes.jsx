import { Link } from "react-router-dom";
import Widget from "../components/ui/Widget";
import HeroFilters from "../components/heroes/HeroFilters";
import { useHeroes } from "../hooks/useHeroes";
import { useHeroMeta } from "../hooks/useHeroMeta";
import { useHeroFilters } from "../hooks/useHeroFilters";
import { getHeroAsset } from "../lib/assets/heroes";
import { getAttributeAsset } from "../lib/assets/attributes";
import HeroSearchOverlay from "../components/heroes/HeroSearchOverlay";

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
  const attribute = String(hero.primaryAttribute || "").toUpperCase();

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

function HeroCard({ hero, isMatch, hasActiveFilters, isMeta, metaEnabled }) {
  const matchesMetaFilter = !metaEnabled || isMeta;
  const matchesOtherFilters = !hasActiveFilters || isMatch;

  const isDimmed = !matchesMetaFilter || !matchesOtherFilters;

  return (
    <Link
      to={`/heroes/${hero.id}`}
      className={`group block overflow-hidden rounded-md bg-[#050505] transition-all duration-150 hover:z-20 hover:scale-150 shadow-2xl/50  ${
        isDimmed
          ? "border border-white/[0.08] opacity-20 grayscale"
          : isMeta
            ? "border border-red-500/70 shadow-[0_0_14px_rgba(239,68,68,0.12)] hover:border-red-400"
            : hasActiveFilters
              ? "border border-white/[0.10] shadow-[0_0_14px_rgba(255,255,255,0.05)] hover:border-white/20"
              : "border border-white/[0.08] hover:border-white/20"
      }`}
    >
      <div className="relative aspect-[71/94] overflow-hidden bg-white/[0.025] ">
        {isMeta && (
          <div className="pointer-events-none absolute -right-px -top-px z-10 h-[15px] w-[15px] ">
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
    </Link>
  );
}

function HeroGroup({
  group,
  heroes,
  heroMatches,
  heroMeta,
  hasActiveFilters,
  metaEnabled,
}) {
  const attributeIcon = getAttributeAsset(group.value);

  return (
    <section className="min-w-0">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {attributeIcon && (
            <img
              src={attributeIcon}
              alt=""
              className="h-4 w-4 object-contain"
            />
          )}

          <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
            {group.label}
          </h2>
        </div>

        <div className="h-px flex-1 bg-white/[0.07]" />

        <span className="text-[9px] tabular-nums text-white/25">
          {heroes.length}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-10">
        {heroes.map((hero) => {
          const metaData = heroMeta.get(Number(hero.id));

          return (
            <HeroCard
              key={hero.id}
              hero={hero}
              isMatch={heroMatches.get(hero.id)}
              hasActiveFilters={hasActiveFilters}
              isMeta={Boolean(metaData?.isMeta)}
              metaEnabled={metaEnabled}
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
      {/* PAGE HEADER */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-red-400" />

          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Database
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Heroes
        </h1>

        <p className="mt-1 text-[11px] text-white/30">
          Explore Dota 2 heroes and their statistics.
        </p>
      </div>

      <HeroSearchOverlay search={filters.search} setSearch={setSearch} />

      <Widget>
        {loading && (
          <div className="flex min-h-40 items-center justify-center">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/25">
              <span className="h-1 w-1 animate-pulse rounded-full bg-red-400" />
              Loading heroes...
            </div>
          </div>
        )}

        {error && (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <span className="mb-3 h-1.5 w-1.5 rounded-full bg-red-400" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Unable to load hero data
            </p>

            <p className="mt-1 text-[10px] text-white/25">
              STRATZ is temporarily unavailable. Please try again.
            </p>

            <button
              type="button"
              onClick={retry}
              className="mt-4 cursor-pointer rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/45 transition hover:border-red-500/20 hover:bg-red-500/[0.04] hover:text-white/70"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-red-400" />

                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    All Heroes
                  </h2>
                </div>

                <p className="mt-1 text-[9px] text-white/20">
                  {heroes.length} heroes available
                </p>
              </div>

              <input
                type="search"
                value={filters.search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search heroes..."
                className="h-9 w-full rounded-md border border-white/[0.07] bg-white/[0.025] px-3 text-[10px] text-white outline-none transition placeholder:text-white/20 focus:border-red-500/25 focus:bg-white/[0.04] sm:w-56 lg:hidden"
              />
            </div>

            {metaError && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.015] px-3 py-2">
                <span className="h-1 w-1 rounded-full bg-white/20" />

                <span className="text-[9px] uppercase tracking-[0.12em] text-white/25">
                  Meta data is currently unavailable.
                </span>
              </div>
            )}

            {metaLoading && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.015] px-3 py-2">
                <span className="h-1 w-1 animate-pulse rounded-full bg-red-400/60" />

                <span className="text-[9px] uppercase tracking-[0.12em] text-white/25">
                  Loading meta data...
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                    metaEnabled={filters.meta}
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
                  metaEnabled={filters.meta}
                />
              )}
            </div>
          </>
        )}
      </Widget>

      <HeroFilters
        filters={filters}
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
