const ATTACK_TYPES = [
  { label: "Melee", value: "MELEE" },
  { label: "Ranged", value: "RANGED" },
];

const COMPLEXITIES = [
  { label: "Low", value: 1 },
  { label: "Medium", value: 2 },
  { label: "High", value: 3 },
];

const MAIN_ROLES = [
  { label: "Carry", value: "CARRY" },
  { label: "Support", value: "SUPPORT" },
];

const ROLES = [
  { label: "Disabler", value: "DISABLER" },
  { label: "Durable", value: "DURABLE" },
  { label: "Escape", value: "ESCAPE" },
  { label: "Initiator", value: "INITIATOR" },
  { label: "Nuker", value: "NUKER" },
  { label: "Pusher", value: "PUSHER" },
];

function FilterButton({ active, children, onClick, accent = "red" }) {
  const activeClass =
    accent === "meta"
      ? "border-red-500/60 bg-red-500/15 text-red-400"
      : "border-red-500/50 bg-red-500/10 text-red-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition ${
        active
          ? activeClass
          : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-widest text-white/35">
        {label}
      </span>

      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-5 w-px bg-white/10 lg:block" />;
}

function HeroFilters({
  filters,
  setSearch,
  setAttackType,
  setComplexity,
  setMainRole,
  toggleRole,
  toggleMeta,
  clearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1rem)] -translate-x-1/2 sm:bottom-4 sm:w-[calc(100%-2rem)] md:left-[calc(50%+7.5rem)] md:w-[calc(100%-16rem)]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 rounded-xl border border-white/10 bg-[#090909]/95 p-2.5 shadow-2xl backdrop-blur-md sm:p-3 lg:flex-row lg:items-center lg:gap-3">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search heroes..."
          className="h-8 min-w-0 w-full rounded-md border border-white/10 bg-white/[0.03] px-2.5 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-red-500/40 focus:bg-white/[0.05] sm:h-9 lg:w-40 lg:shrink-0"
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-start">
          <FilterGroup label="Attack">
            {ATTACK_TYPES.map((item) => (
              <FilterButton
                key={item.value}
                active={filters.attackType === item.value}
                onClick={() =>
                  setAttackType(
                    filters.attackType === item.value ? null : item.value,
                  )
                }
              >
                {item.label}
              </FilterButton>
            ))}
          </FilterGroup>

          <Divider />

          <FilterGroup label="Complexity">
            {COMPLEXITIES.map((item) => (
              <FilterButton
                key={item.value}
                active={filters.complexity === item.value}
                onClick={() =>
                  setComplexity(
                    filters.complexity === item.value ? null : item.value,
                  )
                }
              >
                {item.label}
              </FilterButton>
            ))}
          </FilterGroup>

          <Divider />

          <FilterGroup label="Role">
            {MAIN_ROLES.map((item) => (
              <FilterButton
                key={item.value}
                active={filters.mainRole === item.value}
                onClick={() =>
                  setMainRole(
                    filters.mainRole === item.value ? null : item.value,
                  )
                }
              >
                {item.label}
              </FilterButton>
            ))}
          </FilterGroup>

          <Divider />

          <FilterGroup label="Secondary">
            {ROLES.map((item) => (
              <FilterButton
                key={item.value}
                active={filters.roles.includes(item.value)}
                onClick={() => toggleRole(item.value)}
              >
                {item.label}
              </FilterButton>
            ))}
          </FilterGroup>

          <Divider />

          <FilterGroup label="Meta">
            <FilterButton
              active={filters.meta}
              onClick={toggleMeta}
              accent="meta"
            >
              META
            </FilterButton>
          </FilterGroup>
        </div>

        {hasActiveFilters && (
          <div className="flex shrink-0 justify-end border-t border-white/10 pt-2 lg:border-t-0 lg:border-l lg:pl-3 lg:pt-0">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-white/40 transition hover:bg-white/[0.05] hover:text-red-400"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroFilters;
