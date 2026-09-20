import { getPlayerRank } from "../../lib/dota/rank";

function PlayerHeader({ player }) {
  if (!player) {
    return null;
  }

  const rank = getPlayerRank(player.seasonRank, player.seasonLeaderboardRank);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,255,255,0.07),transparent_35%)]" />

      <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-md" />

            <img
              src={player.avatar}
              alt={player.name}
              className="relative h-20 w-20 rounded-2xl object-cover ring-1 ring-white/15 sm:h-24 sm:w-24"
            />

            {player.isDotaPlusSubscriber && (
              <div className="absolute -bottom-2 -right-2 rounded-lg border border-white/10 bg-[#11141b] p-1.5 shadow-lg">
                <img
                  src="https://cdn.stratz.com/images/dota2/plus/logo.png"
                  alt="Dota Plus"
                  className="h-6 w-6 object-contain"
                />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {player.name}
              </h1>

              {player.pro?.isPro && (
                <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Pro
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-white/30">
              Steam / Dota Account {player.accountId}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {player.guild && (
                <span className="rounded-md border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-white/60">
                  {player.guild.tag
                    ? `[${player.guild.tag}] ${player.guild.name}`
                    : player.guild.name}
                </span>
              )}

              {player.pro?.team?.tag && (
                <span className="rounded-md border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-white/70">
                  {player.pro.team.tag}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          {rank && (
            <div className="relative h-24 w-24 shrink-0">
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
                <span className="absolute bottom-3 left-0 z-20 flex w-full justify-center text-[10px] font-bold leading-none text-white drop-shadow-md">
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
