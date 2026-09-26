function DraftSuggestions({ heroes = [], draftState, suggestions }) {
  const usedHeroIds = new Set(
    [
      ...draftState.ourPicks,
      ...draftState.ourBans,
      ...draftState.enemyPicks,
      ...draftState.enemyBans,
    ].map((item) => Number(item.heroId)),
  );

  const availableHeroes = heroes.filter(
    (hero) => !usedHeroIds.has(Number(hero.id)),
  );

  const { bestPicks, comfortPicks, bestBans, teamThreats } = suggestions;

  const reasonLabels = {
    meta: "META",
    synergy: "SYNERGY",
    counter: "COUNTER",
    threat: "TEAM FIT",
    teamComposition: "COMPOSITION",
    enemyRoleNeed: "ENEMY ROLE",
    enemySynergy: "ENEMY SYNERGY",
    threatToOurTeam: "VS OUR TEAM",
    enemyComposition: "ENEMY COMPOSITION",
    teamThreat: "TEAM THREAT",
  };

  function HeroCard({ item }) {
    const hero = item?.hero;
    if (!hero) {
      return null;
    }
    const score = Number(item?.score);
    const scoreParts = Object.entries(item?.breakdown || {})
      .map(([key, value]) => ({
        key,
        label:
          reasonLabels[key] || key.replace(/([A-Z])/g, " $1").toUpperCase(),
        value: Number(value),
      }))
      .filter((part) => Number.isFinite(part.value));
    const primaryReason = [...scoreParts].sort((a, b) => b.value - a.value)[0];
    return (
      <div className="group cursor-pointer relative h-[104px] overflow-hidden rounded-lg border border-white/[0.07] bg-[#0b0d10] transition-all duration-200 hover:border-white/[0.15]">
        {" "}
        {/* top accent */}{" "}
        <div className="absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-60 transition-opacity duration-200 group-hover:opacity-100" />{" "}
        {/* HERO IMAGE */}{" "}
        <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
          {" "}
          {hero.shortName ? (
            <img
              src={`https://cdn.stratz.com/images/dota2/heroes/${hero.shortName}_vert.png`}
              alt={hero.displayName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[8px] text-white/20">
              {" "}
              NO IMAGE{" "}
            </div>
          )}{" "}
          {/* normal image fade */}{" "}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0b0d10] to-transparent" />{" "}
        </div>{" "}
        {/* NORMAL INFO */}{" "}
        <div className="absolute inset-y-0 left-1/2 right-0 z-10 flex flex-col justify-between px-2.5 py-2 transition-opacity duration-150 group-hover:opacity-0">
          {" "}
          <div>
            {" "}
            <div className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-white/80">
              {" "}
              {hero.displayName || "Unknown Hero"}{" "}
            </div>{" "}
            {primaryReason && primaryReason.value > 0 && (
              <div className="mt-1 flex items-center gap-1.5">
                {" "}
                <span className="h-1 w-1 rounded-full bg-emerald-400/70" />{" "}
                <span className="truncate text-[8px] font-semibold uppercase tracking-[0.1em] text-emerald-400/55">
                  {" "}
                  {primaryReason.label}{" "}
                </span>{" "}
              </div>
            )}{" "}
          </div>{" "}
          {Number.isFinite(score) && (
            <div>
              {" "}
              <div className="flex items-end justify-between">
                {" "}
                <span className="text-[7px] uppercase tracking-[0.1em] text-white/25">
                  {" "}
                  Score{" "}
                </span>{" "}
                <span className="text-[13px] font-semibold tabular-nums text-white/75">
                  {" "}
                  {score.toFixed(1)}{" "}
                </span>{" "}
              </div>{" "}
              <div className="mt-1 h-[2px] overflow-hidden rounded-full bg-white/[0.06]">
                {" "}
                <div
                  className="h-full rounded-full bg-emerald-400/50"
                  style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                />{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
        {/* EXPANDED HOVER PANEL */}
        <div className="absolute inset-y-0 right-0 z-20 w-[70%] translate-x-3 opacity-0 transition-all duration-250 group-hover:translate-x-0 group-hover:opacity-100">
          {" "}
          <div className="absolute inset-0 bg-gradient-to-l from-[#0b0d10] via-[#0b0d10]/95 to-[#0b0d10]/10" />
          <div className="relative flex h-full flex-col justify-center pl-5 pr-2.5">
            {" "}
            {/* hero name */}{" "}
            <div className="truncate text-[10px] font-semibold uppercase tracking-[0.04em] text-white/85">
              {" "}
              {hero.displayName || "Unknown Hero"}{" "}
            </div>{" "}
            {/* score */}{" "}
            {Number.isFinite(score) && (
              <div className="mt-1 flex items-center justify-between">
                {" "}
                <span className="text-[6px] uppercase tracking-[0.12em] text-white/25">
                  {" "}
                  Draft Score{" "}
                </span>{" "}
                <span className="text-[12px] font-semibold tabular-nums text-emerald-300/70">
                  {" "}
                  {score.toFixed(1)}{" "}
                </span>{" "}
              </div>
            )}{" "}
            {/* divider */} <div className="my-1.5 h-px bg-white/[0.06]" />{" "}
            {/* breakdown */}{" "}
            <div className="space-y-1">
              {" "}
              {scoreParts.slice(0, 4).map((part) => (
                <div
                  key={part.key}
                  className="flex items-center justify-between gap-2"
                >
                  {" "}
                  <span className="truncate text-[6px] font-medium uppercase tracking-[0.08em] text-white/30">
                    {" "}
                    {part.label}{" "}
                  </span>{" "}
                  <span className="shrink-0 text-[8px] font-medium tabular-nums text-white/55">
                    {" "}
                    {part.value.toFixed(0)}{" "}
                  </span>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }

  function Section({ title, items }) {
    return (
      <div>
        <div className="mb-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">
          {title}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => (
              <HeroCard key={item.hero.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed border-white/[0.06] bg-white/[0.01] text-[8px] uppercase tracking-[0.1em] text-white/15">
            No suggestions
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="relative border-b border-white/[0.06] px-4 py-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="mb-4 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-red-400" />

        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
          Draft Suggestions
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* PICK SUGGESTIONS */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-400/60">
            Pick Suggestions
          </div>

          <div className="space-y-4">
            <Section title="Best Picks" items={bestPicks} />
            <Section title="Comfort / Team Picks" items={comfortPicks} />
          </div>
        </div>

        {/* BAN SUGGESTIONS */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-3">
          <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-red-400/60">
            Ban Suggestions
          </div>

          <div className="space-y-4">
            <Section title="Best Bans" items={bestBans} />
            <Section title="Team Threats" items={teamThreats} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default DraftSuggestions;
