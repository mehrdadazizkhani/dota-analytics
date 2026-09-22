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

function FilterButton({ active, children, onClick, meta = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer whitespace-nowrap rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-all duration-150 ${
        active
          ? meta
            ? "border-red-500/50 bg-red-500/[0.08] text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.08)]"
            : "border-red-500/30 bg-red-500/[0.06] text-white"
          : "border-white/[0.07] bg-white/[0.02] text-white/35 hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/20">
        {label}
      </span>

      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-5 w-px bg-white/[0.07] xl:block" />;
}

function HeroFilters({
  filters,
  setAttackType,
  setComplexity,
  setMainRole,
  toggleRole,
  toggleMeta,
  clearFilters,
}) {
  return (
    <div
      className="
        mt-3
        sticky
        bottom-3
        z-50
        w-full
      "
    >
      <div
        className="
          relative
          flex
          w-full
          items-center
          gap-3

          rounded-lg
          border
          border-white/[0.08]

          bg-[#050505]/95
          p-2.5

          shadow-[0_18px_50px_rgba(0,0,0,0.5)]
          backdrop-blur-md

          sm:p-3
        "
      >
        {/* TOP ACCENT */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

        {/* LEFT FILTERS */}
        <div
          className="
            flex
            min-w-0
            flex-1
            flex-wrap
            items-center
            justify-start
            gap-x-3
            gap-y-2
          "
        >
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
            <FilterButton active={filters.meta} onClick={toggleMeta} meta>
              META
            </FilterButton>
          </FilterGroup>
        </div>

        {/* RIGHT CLEAR */}
        <div
          className="
            shrink-0
            border-l
            border-white/[0.07]
            pl-3
          "
        >
          <button
            type="button"
            onClick={clearFilters}
            className="
              cursor-pointer
              rounded-md
              border
              border-transparent
              px-3
              py-1.5

              text-[9px]
              font-medium
              uppercase
              tracking-[0.12em]
              text-white/25

              transition-all
              duration-150

              hover:border-red-500/15
              hover:bg-red-500/[0.04]
              hover:text-red-400
            "
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroFilters;
