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

function PlayerFilters({ filters, setFilters }) {
  function updateFilter(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Match Count - LOCAL ONLY */}
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

        {/* Position - SERVER */}
        <MultiSelect
          value={filters.positionIds}
          onChange={(value) => updateFilter("positionIds", value)}
          placeholder="All Positions"
          options={[
            {
              value: 1,
              label: "Safe Lane",
              icon: <SafelaneIcon />,
            },
            {
              value: 2,
              label: "Mid Lane",
              icon: <MidlaneIcon />,
            },
            {
              value: 3,
              label: "Off Lane",
              icon: <OfflaneIcon />,
            },
            {
              value: 4,
              label: "Soft Support",
              icon: <SoftSupportIcon />,
            },
            {
              value: 5,
              label: "Hard Support",
              icon: <HardSupportIcon />,
            },
          ]}
        />

        {/* Mode - SERVER */}
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

        {/* Time - SERVER */}
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

        {/* Hero - SERVER */}
        <MultiSelect
          searchable
          value={filters.heroIds}
          onChange={(value) => updateFilter("heroIds", value)}
          placeholder="All Heroes"
          options={[]}
        />

        {/* Ranked Only - SERVER */}
        <Toggle
          label="Ranked Matches Only"
          checked={filters.rankedOnly}
          onChange={(value) => updateFilter("rankedOnly", value)}
        />
      </div>
    </section>
  );
}

export default PlayerFilters;
