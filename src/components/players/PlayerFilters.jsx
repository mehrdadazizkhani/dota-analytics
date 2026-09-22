import Select from "../ui/Select";
import Toggle from "../ui/Toggle";
import MultiSelect from "../ui/MultiSelect";

import {
  OfflaneIcon,
  SafelaneIcon,
  MidlaneIcon,
  SoftSupportIcon,
  HardSupportIcon,
} from "../icons/PositionIcons";

const DEFAULT_FILTERS = {
  limit: "25",

  positionIds: [],
  heroIds: [],

  time: "ALL",

  mode: "ALL",

  rankedOnly: true,
};

function PlayerFilters({ filters, setFilters, heroes = [] }) {
  function updateFilter(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      ...DEFAULT_FILTERS,
    });
  }

  const heroOptions = heroes.map((hero) => ({
    value: hero.id,
    label: hero.displayName,
    aliases: hero.aliases || [],

    icon: (
      <img
        src={`https://cdn.stratz.com/images/dota2/heroes/${hero.shortName}_icon.png`}
        className="h-5 w-5 rounded-sm object-cover"
        alt={hero.displayName}
      />
    ),
  }));

  return (
    <section className="relative  rounded-lg border border-white/[0.07] bg-[#050505]">
      {/* Top accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-red-400 shadow-[0_0_7px_rgba(248,113,113,0.6)]" />

          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Match Filters
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 p-3">
        {/* Match Count */}
        <Select
          value={filters.limit}
          onChange={(value) => updateFilter("limit", value)}
          options={[
            {
              value: "10",
              label: "10 Matches",
            },
            {
              value: "25",
              label: "25 Matches",
            },
            {
              value: "50",
              label: "50 Matches",
            },
            {
              value: "100",
              label: "100 Matches",
            },
          ]}
        />

        {/* Position */}
        <MultiSelect
          value={filters.positionIds}
          onChange={(value) => updateFilter("positionIds", value)}
          placeholder="All Positions"
          options={[
            {
              value: "POSITION_1",
              label: "Safe Lane",
              icon: <SafelaneIcon />,
            },
            {
              value: "POSITION_2",
              label: "Mid Lane",
              icon: <MidlaneIcon />,
            },
            {
              value: "POSITION_3",
              label: "Off Lane",
              icon: <OfflaneIcon />,
            },
            {
              value: "POSITION_4",
              label: "Soft Support",
              icon: <SoftSupportIcon />,
            },
            {
              value: "POSITION_5",
              label: "Hard Support",
              icon: <HardSupportIcon />,
            },
          ]}
        />

        {/* Mode */}
        <Select
          value={filters.mode}
          onChange={(value) => updateFilter("mode", value)}
          options={[
            {
              value: "ALL",
              label: "All Games",
            },
            {
              value: "SOLO",
              label: "Solo",
            },
            {
              value: "PARTY",
              label: "Party",
            },
          ]}
        />

        {/* Time */}
        <Select
          value={filters.time}
          onChange={(value) => updateFilter("time", value)}
          options={[
            {
              value: "ALL",
              label: "All Time",
            },
            {
              value: "1_MONTH",
              label: "1 Month",
            },
            {
              value: "3_MONTH",
              label: "3 Months",
            },
            {
              value: "6_MONTH",
              label: "6 Months",
            },
            {
              value: "12_MONTH",
              label: "12 Months",
            },
          ]}
        />

        {/* Hero */}
        <MultiSelect
          searchable
          initialLimit={8}
          searchFields={["aliases"]}
          value={filters.heroIds}
          onChange={(value) => updateFilter("heroIds", value)}
          placeholder="All Heroes"
          options={heroOptions}
        />

        {/* Ranked */}
        <Toggle
          label="Ranked Only"
          checked={filters.rankedOnly}
          onChange={(value) => updateFilter("rankedOnly", value)}
        />

        {/* Reset */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={resetFilters}
            className="group flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 transition duration-150 hover:border-red-500/20 hover:bg-red-500/[0.05] hover:text-red-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-45"
            >
              <path
                d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

export default PlayerFilters;
