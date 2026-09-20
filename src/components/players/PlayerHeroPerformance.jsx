function PlayerHeroPerformance({ heroes }) {
  if (!Array.isArray(heroes) || heroes.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Hero Performance
        </h2>

        <p className="mt-1 text-sm text-white/40">
          Top heroes by player performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {heroes.map((item) => {
          const hero = item.hero;

          if (!hero) {
            return null;
          }

          const winRate =
            item.matchCount > 0 ? (item.winCount / item.matchCount) * 100 : 0;

          return (
            <div
              key={hero.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <img
                src={`https://cdn.stratz.com/images/dota2/heroes/${hero.shortName}_horz.png`}
                alt={hero.displayName}
                className="h-28 w-full object-cover object-center"
              />

              <div className="p-4">
                <h3 className="truncate text-sm font-semibold text-white">
                  {hero.displayName}
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-white/40">Matches</p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {item.matchCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/40">Win Rate</p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {winRate.toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/40">KDA</p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {item.kDA.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-white/40">Wins</p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {item.winCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PlayerHeroPerformance;
