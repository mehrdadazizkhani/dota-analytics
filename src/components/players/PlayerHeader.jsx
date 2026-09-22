import { getPlayerRank } from "../../lib/dota/rank";

function PlayerHeader({ player }) {
  if (!player) {
    return null;
  }

  const rank = getPlayerRank(player.seasonRank, player.seasonLeaderboardRank);

  const playerImage = player.pro
    ? `https://cdn.stratz.com/images/dota2/players/${player.accountId}.png`
    : player.avatar;

  return (
    <section className="relative overflow-hidden rounded-lg border border-white/[0.07] bg-[#050505]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(239,68,68,0.045),transparent_30%)]" />

      <div className="relative flex flex-col gap-6 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Player info */}
        <div className="flex min-w-0 items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-lg bg-red-500/[0.06] blur-md" />

            <img
              src={playerImage}
              alt={player.name}
              className="relative h-16 w-16 rounded-lg object-cover ring-1 ring-white/[0.1] sm:h-20 sm:w-20"
            />

            {player.isDotaPlusSubscriber && (
              <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.1] bg-[#080808] shadow-lg">
                <img
                  src="https://cdn.stratz.com/images/dota2/plus/logo.png"
                  alt="Dota Plus"
                  className="h-4 w-4 object-contain"
                />
              </div>
            )}
          </div>

          {/* Name / info */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {player.pro?.name || player.name}
              </h1>

              {player.pro?.name && player.pro.name !== player.name && (
                <span className="text-[10px] text-white/25">
                  Steam: {player.name}
                </span>
              )}

              {player.pro?.isPro && (
                <span className="rounded border border-red-500/20 bg-red-500/[0.06] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-red-400/80">
                  Pro
                </span>
              )}
            </div>

            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/20">
              Steam / Dota Account
              <span className="ml-1.5 tabular-nums text-white/30">
                {player.accountId}
              </span>
            </p>

            {/* Team + Guild */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {player.pro?.team?.id && (
                <div className="flex items-center gap-1.5 rounded border border-white/[0.07] bg-white/[0.025] px-2 py-1">
                  <img
                    src={`https://cdn.stratz.com/images/dota2/teams/${player.pro.team.id}.png`}
                    alt={player.pro.team.tag}
                    className="h-4 w-4 object-contain"
                  />

                  <span className="text-[10px] font-semibold text-white/55">
                    {player.pro.team.tag}
                  </span>
                </div>
              )}

              {player.guild && (
                <span className="rounded border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-white/40">
                  {player.guild.tag
                    ? `[${player.guild.tag}] ${player.guild.name}`
                    : player.guild.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center justify-end">
          {rank && (
            <div className="relative h-20 w-20 shrink-0 sm:h-22 sm:w-22">
              <img
                src={rank.medalImage}
                alt="Rank medal"
                className="absolute inset-0 h-full w-full object-contain"
              />

              {rank.starsImage && (
                <img
                  src={rank.starsImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain"
                />
              )}

              {rank.leaderboardRank && (
                <span className="absolute bottom-2.5 left-0 z-20 flex w-full justify-center text-[9px] font-bold leading-none text-white drop-shadow-md">
                  {rank.leaderboardRank}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PlayerHeader;
