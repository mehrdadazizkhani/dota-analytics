import { useEffect, useMemo, useState } from "react";
import { getHeroAsset } from "../../lib/assets/heroes";
import { getAttributeAsset } from "../../lib/assets/attributes";
import HeroSearchOverlay from "../heroes/HeroSearchOverlay";

const ATTRIBUTE_GROUPS = [
  {
    label: "Strength",
    shortLabel: "STR",
    value: "STRENGTH",
  },
  {
    label: "Agility",
    shortLabel: "AGI",
    value: "AGILITY",
  },
  {
    label: "Intelligence",
    shortLabel: "INT",
    value: "INTELLIGENCE",
  },
  {
    label: "Universal",
    shortLabel: "UNI",
    value: "UNIVERSAL",
  },
];

function getHeroAttribute(hero) {
  const attribute = String(hero?.primaryAttribute || "").toUpperCase();

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

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function heroMatchesSearch(hero, search) {
  const query = normalizeSearchValue(search);

  if (!query) {
    return true;
  }

  const values = [
    hero?.displayName,
    hero?.name,
    hero?.shortName,
    ...(Array.isArray(hero?.aliases) ? hero.aliases : []),
  ];

  return values.some((value) => normalizeSearchValue(value).includes(query));
}

function HeroOption({ hero, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!selected) {
          onSelect(hero);
        }
      }}
      disabled={selected}
      title={hero.displayName || hero.name}
      className={`group relative aspect-[71/94] min-w-0 overflow-hidden rounded-md border bg-[#050505] transition-all duration-150 ${
        selected
          ? " border-white/[0.05] opacity-45 grayscale-[0.2]"
          : "border-white/[0.08] hover:border-white/30 cursor-pointer"
      }`}
    >
      <img
        src={getHeroAsset(hero, "portrait")}
        alt={hero.displayName || hero.name}
        className={`block h-full w-full object-cover transition duration-200 ${
          selected ? "brightness-50" : "group-hover:scale-[1.05]"
        }`}
        loading="lazy"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />

      {!selected && (
        <div className="pointer-events-none absolute inset-0 bg-white/[0.05] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-1.5 pb-1.5">
        <div
          className={`truncate text-[9px] font-semibold leading-tight ${
            selected ? "text-white/30" : "text-white/90"
          }`}
        >
          {hero.displayName || hero.name}
        </div>
      </div>
    </button>
  );
}

function AttributeGroup({ group, heroes, selectedHeroIds, onSelect }) {
  const attributeIcon = getAttributeAsset(group.value);

  if (!heroes.length) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-md border border-white/[0.055] bg-white/[0.012] p-3">
      {/* GROUP HEADER */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex shrink-0 items-center gap-2">
          {attributeIcon && (
            <img
              src={attributeIcon}
              alt=""
              className="h-4 w-4 object-contain"
            />
          )}

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
              {group.label}
            </div>

            <div className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.18em] text-white/20">
              {group.shortLabel}
            </div>
          </div>
        </div>

        <div className="h-px flex-1 bg-white/[0.07]" />

        <span className="rounded border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 text-[8px] tabular-nums text-white/30">
          {heroes.length}
        </span>
      </div>

      {/* HERO GRID */}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 2xl:grid-cols-10">
        {heroes.map((hero) => (
          <HeroOption
            key={hero.id}
            hero={hero}
            selected={selectedHeroIds.has(Number(hero.id))}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function DraftHeroPicker({
  open,
  heroes = [],
  selectedHeroIds = [],
  title = "Select Hero",
  onSelect,
  onClose,
}) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    setSearch("");
  }, [open]);

  const selectedIds = useMemo(
    () => new Set(selectedHeroIds.map((id) => Number(id))),
    [selectedHeroIds],
  );

  const groupedHeroes = useMemo(() => {
    const result = {};

    for (const group of ATTRIBUTE_GROUPS) {
      result[group.value] = [];
    }

    for (const hero of heroes) {
      if (!heroMatchesSearch(hero, search)) {
        continue;
      }

      const attribute = getHeroAttribute(hero);

      if (result[attribute]) {
        result[attribute].push(hero);
      }
    }

    return result;
  }, [heroes, search]);

  if (!open) {
    return null;
  }

  function handleSelect(hero) {
    onSelect?.(hero);
    onClose?.();
  }

  const hasResults = Object.values(groupedHeroes).some(
    (groupHeroes) => groupHeroes.length > 0,
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-8 backdrop-blur-md sm:p-10 lg:p-12"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      {/* SEARCH OVERLAY */}
      <HeroSearchOverlay search={search} setSearch={setSearch} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[110] flex h-[min(86vh,880px)] w-full max-w-[1400px] flex-col overflow-hidden rounded-lg border border-white/[0.09] bg-[#080808] shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center gap-4 border-b border-white/[0.07] bg-white/[0.015] px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.45)]" />

              <h2 className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                {title}
              </h2>
            </div>

            <div className="mt-1 text-[8px] uppercase tracking-[0.12em] text-white/20">
              Select from hero pool
            </div>
          </div>

          {/* CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.02] text-[14px] text-white/35 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white/75"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] sm:px-5 sm:py-5 [&::-webkit-scrollbar]:hidden">
          {hasResults ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {ATTRIBUTE_GROUPS.map((group) => (
                <AttributeGroup
                  key={group.value}
                  group={group}
                  heroes={groupedHeroes[group.value] || []}
                  selectedHeroIds={selectedIds}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.02] text-lg text-white/20">
                  ?
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  No heroes found
                </div>

                <div className="mt-1 text-[9px] text-white/15">
                  Try a different search.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] bg-white/[0.01] px-5 py-2.5">
          <span className="text-[8px] uppercase tracking-[0.12em] text-white/15">
            {heroes.length} heroes
          </span>

          <span className="text-[8px] uppercase tracking-[0.12em] text-white/15">
            {selectedIds.size} selected
          </span>
        </div>
      </div>
    </div>
  );
}

export default DraftHeroPicker;
