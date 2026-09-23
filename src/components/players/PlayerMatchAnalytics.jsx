import {
  OfflaneIcon,
  SafelaneIcon,
  MidlaneIcon,
  SoftSupportIcon,
  HardSupportIcon,
} from "../icons/PositionIcons";

const POSITION_CONFIG = {
  1: { label: "Safe Lane", icon: SafelaneIcon },
  2: { label: "Mid Lane", icon: MidlaneIcon },
  3: { label: "Offlane", icon: OfflaneIcon },
  4: { label: "Soft Support", icon: SoftSupportIcon },
  5: { label: "Hard Support", icon: HardSupportIcon },
};

function getMatchPlayer(match) {
  return match?.player || {};
}

function getPositionId(position) {
  if (typeof position === "number") return position;

  if (typeof position === "string") {
    const match = position.match(/([1-5])/);
    if (match) return Number(match[1]);
  }

  return null;
}

function getHeroImage(shortName) {
  if (!shortName) return null;
  return `https://cdn.stratz.com/images/dota2/heroes/${shortName}_icon.png`;
}

function formatImp(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${Math.round(number)}`;

  return `${Math.round(number)}`;
}

function formatDate(timestamp) {
  if (!timestamp) return "";

  return new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function PlayerMatchAnalytics({ matches = [] }) {
  const heroStatsMap = new Map();

  const positionStats = {
    1: { games: 0, wins: 0, losses: 0 },
    2: { games: 0, wins: 0, losses: 0 },
    3: { games: 0, wins: 0, losses: 0 },
    4: { games: 0, wins: 0, losses: 0 },
    5: { games: 0, wins: 0, losses: 0 },
  };

  const impMatches = [];

  let soloMatches = 0;
  let partyMatches = 0;
  let rankedMatches = 0;
  let wins = 0;
  let losses = 0;

  for (const match of matches) {
    const player = getMatchPlayer(match);

    const heroName = player.hero?.displayName || "Unknown Hero";
    const shortName = player.hero?.shortName;

    if (!heroStatsMap.has(heroName)) {
      heroStatsMap.set(heroName, {
        name: heroName,
        shortName,
        games: 0,
        wins: 0,
        losses: 0,
      });
    }

    const hero = heroStatsMap.get(heroName);

    hero.games += 1;

    if (player.isVictory) {
      hero.wins += 1;
      wins += 1;
    } else {
      hero.losses += 1;
      losses += 1;
    }

    const positionId = getPositionId(player.position);

    if (positionId && positionStats[positionId]) {
      positionStats[positionId].games += 1;

      if (player.isVictory) {
        positionStats[positionId].wins += 1;
      } else {
        positionStats[positionId].losses += 1;
      }
    }

    if (player.partyId == null) {
      soloMatches += 1;
    } else {
      partyMatches += 1;
    }

    const lobbyType =
      typeof match.lobbyType === "string" ? match.lobbyType.toUpperCase() : "";

    if (lobbyType.includes("RANKED") || lobbyType === "RANKED") {
      rankedMatches += 1;
    }

    impMatches.push({
      id: match.id,
      imp: Number(player.imp || 0),
      isVictory: Boolean(player.isVictory),
      heroName,
      shortName,
      date: match.startDateTime,
    });
  }

  const totalMatches = matches.length;

  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  const winRateColor =
    winRate > 50
      ? "text-emerald-400"
      : winRate < 50
        ? "text-red-400"
        : "text-white/55";

  const winRateBar =
    winRate > 50
      ? "bg-emerald-400/70"
      : winRate < 50
        ? "bg-red-400/70"
        : "bg-white/35";

  const soloPercentage =
    totalMatches > 0 ? (soloMatches / totalMatches) * 100 : 0;

  const partyPercentage =
    totalMatches > 0 ? (partyMatches / totalMatches) * 100 : 0;

  const rankedPercentage =
    totalMatches > 0 ? (rankedMatches / totalMatches) * 100 : 0;

  const heroes = Array.from(heroStatsMap.values())
    .map((hero) => ({
      ...hero,
      winRate: hero.games > 0 ? (hero.wins / hero.games) * 100 : 0,
    }))
    .sort((a, b) => b.games - a.games);

  const positions = Object.entries(positionStats).map(([id, stats]) => {
    const config = POSITION_CONFIG[id];

    return {
      id: Number(id),
      ...config,
      ...stats,
      winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
    };
  });

  const chartMatches = [...impMatches].reverse();

  const maxAbsImp = Math.max(
    ...chartMatches.map((match) => Math.abs(match.imp)),
    1,
  );

  const avgImp =
    chartMatches.length > 0
      ? chartMatches.reduce((sum, match) => sum + match.imp, 0) /
        chartMatches.length
      : 0;

  const bestImp =
    chartMatches.length > 0
      ? Math.max(...chartMatches.map((match) => match.imp))
      : 0;

  const worstImp =
    chartMatches.length > 0
      ? Math.min(...chartMatches.map((match) => match.imp))
      : 0;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-1">
      <section className="relative rounded-lg border border-white/[0.07] bg-[#050505]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-red-400" />

              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                Match Analytics
              </h2>
            </div>

            <p className="mt-1 text-[9px] text-white/25">
              Performance from current filtered matches
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold tabular-nums text-white/80">
              {totalMatches}
            </div>

            <div className="text-[8px] uppercase tracking-[0.16em] text-white/20">
              Matches
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* KPI ROW */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-white/[0.06] bg-white/[0.018] p-3">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                Solo Queue
              </div>

              <div className="mt-1 text-lg font-semibold text-white">
                {soloPercentage.toFixed(0)}%
              </div>

              <div className="mt-0.5 flex items-center justify-between text-[10px] text-white/35">
                <span>{soloMatches} Solo</span>
                <span>{partyMatches} Party</span>
              </div>

              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-white/60"
                  style={{ width: `${soloPercentage}%` }}
                />
              </div>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.018] p-3">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                Ranked
              </div>

              <div className="mt-1 text-lg font-semibold text-white">
                {rankedPercentage.toFixed(0)}%
              </div>

              <div className="mt-0.5 text-[10px] text-white/35">
                {rankedMatches} of {totalMatches}
              </div>

              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-white/60"
                  style={{ width: `${rankedPercentage}%` }}
                />
              </div>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.018] p-3">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                Performance
              </div>

              <div className={`mt-1.5 text-lg font-semibold ${winRateColor}`}>
                {winRate.toFixed(1)}%
              </div>

              <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                <span className="text-emerald-400">{wins}W</span>
                <span className="text-white/20">/</span>
                <span className="text-red-400">{losses}L</span>
              </div>

              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={`h-full rounded-full ${winRateBar}`}
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* HERO PERFORMANCE */}
          <div className="mt-4 border-t border-white/[0.05] pt-4">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">
                    Hero Performance
                  </h3>

                  <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 text-[9px] text-white/30">
                    {heroes.length} HEROES
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] text-white/35">
                  Ordered by games played
                </p>
              </div>

              <div className="text-[9px] uppercase tracking-[0.12em] text-white/20">
                Most played →
              </div>
            </div>

            {heroes.length === 0 ? (
              <div className="flex h-[120px] items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.015] text-[10px] text-white/25">
                No hero data
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-[#08080a]">
                <div className="p-3">
                  <div className="flex h-[72px] w-full items-stretch">
                    {heroes.map((hero, index) => {
                      const totalGames = heroes.reduce(
                        (sum, item) => sum + item.games,
                        0,
                      );

                      const share =
                        totalGames > 0 ? (hero.games / totalGames) * 100 : 0;

                      const accent =
                        hero.winRate > 50
                          ? "#34d399"
                          : hero.winRate < 50
                            ? "#f87171"
                            : "#facc15";

                      const width = Math.max(2.5, share);

                      const iconSize = Math.min(
                        40,
                        Math.max(18, 14 + Math.sqrt(Math.max(share, 0)) * 3.2),
                      );

                      return (
                        <div
                          key={`${hero.name}-${index}`}
                          className="group relative min-w-0"
                          style={{ width: `${width}%` }}
                        >
                          <div className="relative h-full px-[2px]">
                            <div className="absolute inset-x-[2px] bottom-0 top-0 rounded-[4px] border border-white/[0.055] bg-[#17181b] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-white/[0.12] group-hover:bg-[#222328]">
                              <div
                                className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-[4px]"
                                style={{ backgroundColor: accent }}
                              />
                            </div>

                            <div
                              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-white/[0.12] bg-[#101114] shadow-[0_5px_14px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-110"
                              style={{
                                width: iconSize,
                                height: iconSize,
                              }}
                            >
                              {hero.shortName ? (
                                <img
                                  src={getHeroImage(hero.shortName)}
                                  alt={hero.name}
                                  className="h-full w-full object-cover object-top"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-white/20">
                                  ?
                                </div>
                              )}
                            </div>

                            <span
                              className="absolute left-1/2 top-0 z-20 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#08080a]"
                              style={{ backgroundColor: accent }}
                            />

                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-[130px] -translate-x-1/2 group-hover:block">
                              <div className="rounded-lg border border-white/[0.08] bg-[#111216] px-3 py-2.5 shadow-2xl">
                                <div className="flex items-center gap-2">
                                  {hero.shortName && (
                                    <img
                                      src={getHeroImage(hero.shortName)}
                                      alt=""
                                      className="h-7 w-7 rounded-sm object-cover object-top"
                                    />
                                  )}

                                  <div className="min-w-0">
                                    <div className="truncate text-[9px] font-semibold text-white/90">
                                      {hero.name}
                                    </div>

                                    <div className="text-[9px] text-white/30">
                                      {hero.games} games
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-2 text-center">
                                  <div>
                                    <div className="text-[10px] text-emerald-400">
                                      {hero.wins}
                                    </div>

                                    <div className="text-[10px] uppercase tracking-wider text-white/25">
                                      Win
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] text-red-400">
                                      {hero.losses}
                                    </div>

                                    <div className="text-[10px] uppercase tracking-wider text-white/25">
                                      Loss
                                    </div>
                                  </div>

                                  <div>
                                    <div
                                      className="text-[10px]"
                                      style={{ color: accent }}
                                    >
                                      {hero.winRate.toFixed(0)}%
                                    </div>

                                    <div className="text-[10px] uppercase tracking-wider text-white/25">
                                      WR
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 flex h-4 w-full">
                    {heroes.map((hero, index) => {
                      const totalGames = heroes.reduce(
                        (sum, item) => sum + item.games,
                        0,
                      );

                      const share =
                        totalGames > 0 ? (hero.games / totalGames) * 100 : 0;

                      return (
                        <div
                          key={`count-${hero.name}-${index}`}
                          className="min-w-0 text-center text-[10px] font-medium text-white/35"
                          style={{
                            width: `${Math.max(2.5, share)}%`,
                          }}
                        >
                          {hero.games}
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden">
                    Width represents share of matches
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* POSITION */}
          <div className="mt-4 border-t border-white/[0.05] pt-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">
                Position Distribution
              </h3>

              <span className="text-[9px] text-white/20">Games / Win Rate</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {positions.map((position) => {
                const Icon = position.icon;

                const usage =
                  totalMatches > 0 ? (position.games / totalMatches) * 100 : 0;

                return (
                  <div
                    key={position.id}
                    className="group relative overflow-hidden rounded-lg border border-white/[0.05] bg-white/[0.018] px-1.5 py-2 text-center"
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 bg-white/[0.035] transition-all"
                      style={{ height: `${usage}%` }}
                    />

                    <div className="relative">
                      <div className="flex justify-center text-white/50 transition group-hover:text-white/80">
                        <Icon />
                      </div>

                      <div className="mt-1 text-sm font-semibold text-white">
                        {position.games}
                      </div>

                      <div className="mt-0.5 text-[10px]">
                        <span className="text-emerald-400/85">
                          {position.wins}W
                        </span>

                        <span className="px-0.5 text-white/15">/</span>

                        <span className="text-red-400/85">
                          {position.losses}L
                        </span>
                        <span className="px-0.5 text-white/15">/</span>
                        <span
                          className={`text-yellow-400/85 ${
                            position.winRate.toFixed(0) > 50
                              ? "#34d399"
                              : position.winRate.toFixed(0) < 50
                                ? "#f87171"
                                : "#facc15"
                          }`}
                        >
                          {position.winRate.toFixed(0)}% WR
                        </span>
                      </div>

                      <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-white/20">
                        {position.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IMP */}
          <div className="mt-4 border-t border-white/[0.05] pt-4">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">
                  Match IMP
                </h3>

                <p className="mt-0.5 text-[10px] text-white/35">
                  IMP sign vs actual match result
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-emerald-400" />
                  Win
                </span>

                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-red-400" />
                  Loss
                </span>
              </div>
            </div>

            {chartMatches.length === 0 ? (
              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-7 text-center text-[10px] text-white/25">
                No match data
              </div>
            ) : (
              <>
                <div className="relative h-[135px] overflow-hidden rounded-lg border border-white/[0.05] bg-[#070709] px-3 pb-5">
                  <div className="pointer-events-none absolute inset-x-3 top-[40%] border-t border-white/[0.1]" />

                  <div className="relative flex h-full items-stretch gap-[2px]">
                    {chartMatches.map((match, index) => {
                      const normalized =
                        Math.min(Math.abs(match.imp) / maxAbsImp, 1) * 42;

                      const height = Math.max(normalized, 2);

                      const barClass =
                        match.imp >= 0 ? "bg-emerald-400/75" : "bg-red-400/70";

                      const resultClass = match.isVictory
                        ? "bg-emerald-300"
                        : "bg-red-300";

                      return (
                        <div
                          key={`${match.id}-${index}`}
                          className="group relative h-full min-w-0 flex-1"
                        >
                          <div
                            className={`absolute left-1/2 z-0 w-full max-w-[7px] -translate-x-1/2 rounded-[2px] ${barClass}`}
                            style={
                              match.imp >= 0
                                ? { height: `${height}%`, bottom: "52%" }
                                : { height: `${height}%`, top: "48%" }
                            }
                          />

                          <div
                            className={`absolute left-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-[1px] ${resultClass}`}
                            style={{ bottom: "-2px" }}
                          />

                          <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-32 -translate-x-1/2 rounded-lg border border-white/10 bg-[#111214]/95 p-2.5 shadow-xl backdrop-blur-md group-hover:block">
                            <div className="truncate text-[9px] font-semibold text-white">
                              {match.heroName}
                            </div>

                            <div className="mt-0.5 text-[10px] text-white/30">
                              {formatDate(match.date)}
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span
                                className={
                                  match.isVictory
                                    ? "text-[9px] text-emerald-400"
                                    : "text-[9px] text-red-400"
                                }
                              >
                                {match.isVictory ? "Victory" : "Loss"}
                              </span>

                              <span
                                className={`text-[9px] font-semibold ${
                                  match.imp >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                IMP {formatImp(match.imp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pointer-events-none absolute left-1 top-1 text-[9px] text-white/20">
                    +{Math.round(maxAbsImp)}
                  </div>

                  <div className="pointer-events-none absolute left-1 top-[48%] -translate-y-1/2 text-[9px] text-white/20">
                    0
                  </div>

                  <div className="pointer-events-none absolute bottom-5 left-1 text-[9px] text-white/20">
                    -{Math.round(maxAbsImp)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PlayerMatchAnalytics;
