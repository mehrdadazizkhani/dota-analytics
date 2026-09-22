import {
  OfflaneIcon,
  SafelaneIcon,
  MidlaneIcon,
  SoftSupportIcon,
  HardSupportIcon,
} from "../icons/PositionIcons";

function formatDuration(seconds) {
  const totalSeconds = Number(seconds || 0);

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString();
}

function getPositionLabel(position) {
  const positions = {
    POSITION_1: "Safe Lane",
    POSITION_2: "Mid Lane",
    POSITION_3: "Off Lane",
    POSITION_4: "Soft Support",
    POSITION_5: "Hard Support",
  };

  return positions[position] || position || "—";
}

function getPositionIcon(position) {
  const icons = {
    POSITION_1: SafelaneIcon,
    POSITION_2: MidlaneIcon,
    POSITION_3: OfflaneIcon,
    POSITION_4: SoftSupportIcon,
    POSITION_5: HardSupportIcon,
  };

  const Icon = icons[position];

  return Icon ? <Icon /> : null;
}

function PlayerRecentMatches({ matches }) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-red-400" />

          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Recent Matches
          </h2>
        </div>

        <p className="mt-1.5 text-[10px] text-white/25">
          Your latest Dota 2 matches.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-[#050505]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/[0.06] bg-white/[0.015]">
              <tr className="text-[9px] uppercase tracking-[0.14em] text-white/25">
                <th className="px-4 py-3 font-medium">Hero</th>

                <th className="px-4 py-3 font-medium">Result</th>

                <th className="px-4 py-3 font-medium">K / D / A</th>

                <th className="px-4 py-3 font-medium">IMP</th>

                <th className="px-4 py-3 font-medium">Position</th>

                <th className="px-4 py-3 font-medium">Duration</th>

                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {matches.map((match) => {
                const player = match.player;
                const hero = player?.hero;

                return (
                  <tr
                    key={match.id}
                    className="transition-colors duration-150 hover:bg-white/[0.025]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {hero?.shortName ? (
                          <img
                            src={`https://cdn.stratz.com/images/dota2/heroes/${hero.shortName}_icon.png`}
                            alt={hero.displayName}
                            className="h-8 w-8 rounded-md object-cover ring-1 ring-white/[0.08]"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-white/[0.04]" />
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-white/75">
                            {hero?.displayName || "Unknown Hero"}
                          </p>

                          <p className="mt-0.5 text-[8px] tabular-nums text-white/20">
                            MATCH #{match.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded border text-[9px] font-bold ${
                          player?.isVictory
                            ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-400"
                            : "border-red-400/15 bg-red-400/[0.06] text-red-400"
                        }`}
                      >
                        {player?.isVictory ? "W" : "L"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-[11px] tabular-nums text-white/65">
                        {player?.kills || 0}
                        <span className="mx-1 text-white/15">/</span>
                        {player?.deaths || 0}
                        <span className="mx-1 text-white/15">/</span>
                        {player?.assists || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <ImpBar imp={player?.imp} />
                    </td>

                    <td className="px-4 py-3">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.06] bg-white/[0.025]"
                        title={getPositionLabel(player?.position)}
                      >
                        {getPositionIcon(player?.position)}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-[11px] tabular-nums text-white/45">
                        {formatDuration(match.durationSeconds)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-[11px] tabular-nums text-white/45">
                        {formatDate(match.startDateTime)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default PlayerRecentMatches;

function ImpBar({ imp }) {
  const value = Math.max(-100, Math.min(100, Number(imp || 0)));
  const width = Math.abs(value) / 2;

  let barColor = "bg-white/40";

  if (value >= 20) {
    barColor = "bg-emerald-400";
  }

  if (value <= -20) {
    barColor = "bg-red-400";
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex w-9 justify-center text-[10px] font-bold tabular-nums text-white/55">
        {value > 0 ? "+" : ""}
        {value}
      </span>

      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />

        {value >= 0 ? (
          <div
            className={`absolute left-1/2 top-0 h-full rounded-r-full ${barColor}`}
            style={{
              width: `${width}%`,
            }}
          />
        ) : (
          <div
            className={`absolute right-1/2 top-0 h-full rounded-l-full ${barColor}`}
            style={{
              width: `${width}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
