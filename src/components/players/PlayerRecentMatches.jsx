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

function PlayerRecentMatches({ matches }) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Recent Matches
        </h2>

        <p className="mt-1 text-sm text-white/40">
          Your latest Dota 2 matches.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr className="text-xs text-white/40">
                <th className="px-5 py-4 font-medium">Hero</th>

                <th className="px-5 py-4 font-medium">Result</th>

                <th className="px-5 py-4 font-medium">K / D / A</th>

                <th className="px-5 py-4 font-medium">IMP</th>

                <th className="px-5 py-4 font-medium">Position</th>

                <th className="px-5 py-4 font-medium">Duration</th>

                <th className="px-5 py-4 font-medium">Date</th>

                <th className="px-5 py-4 font-medium">League</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {matches.map((match) => {
                const player = match.player;
                const hero = player?.hero;

                return (
                  <tr
                    key={match.id}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {hero?.shortName ? (
                          <img
                            src={`https://cdn.stratz.com/images/dota2/heroes/${hero.shortName}_icon.png`}
                            alt={hero.displayName}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-white/5" />
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {hero?.displayName || "Unknown Hero"}
                          </p>

                          <p className="text-xs text-white/30">
                            Match #{match.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          player?.isVictory
                            ? "text-sm font-medium text-emerald-400"
                            : "text-sm font-medium text-red-400"
                        }
                      >
                        {player?.isVictory ? "Victory" : "Defeat"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-white">
                        {player?.kills || 0}
                        <span className="mx-1 text-white/20">/</span>
                        {player?.deaths || 0}
                        <span className="mx-1 text-white/20">/</span>
                        {player?.assists || 0}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-white">
                        {player?.imp ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-white/70">
                        {getPositionLabel(player?.position)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-white/70">
                        {formatDuration(match.durationSeconds)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-white/70">
                        {formatDate(match.startDateTime)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-white/70">
                        {match.league?.displayName || "—"}
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
