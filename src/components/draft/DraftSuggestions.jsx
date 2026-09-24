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

  function HeroCard({ item }) {
    const hero = item?.hero;

    if (!hero) {
      return null;
    }

    return (
      <div className="group relative overflow-hidden rounded-md border border-white/[0.07] bg-white/[0.02]">
        <div className="aspect-[71/94] w-full">
          {hero.shortName ? (
            <img
              src={`https://cdn.stratz.com/images/dota2/heroes/${hero.shortName}_vert.png`}
              alt={hero.displayName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[8px] text-white/20">
              NO IMAGE
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-2 pb-1.5 pt-5">
          <div className="truncate text-[8px] font-medium text-white/70">
            {hero.displayName || "Unknown Hero"}
          </div>
        </div>
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
