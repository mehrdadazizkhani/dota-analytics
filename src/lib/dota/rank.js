const RANK_CDN = "https://cdn.stratz.com/images/dota2/seasonal_rank";

export function getPlayerRank(seasonRank, leaderboardRank) {
  const rank = Number(seasonRank || 0);
  const leaderboard = Number(leaderboardRank || 0);

  if (!rank) {
    return null;
  }

  const rankString = String(rank);

  const medalTier = rankString.substring(0, 1);
  const starTier = rankString.substring(1, 2);

  const immortalType = leaderboard ? (leaderboard <= 10 ? "c" : "b") : "";

  return {
    medalImage: `${RANK_CDN}/medal_${medalTier}${immortalType}.png`,
    starsImage: immortalType ? null : `${RANK_CDN}/star_${starTier}.png`,
    leaderboardRank: leaderboard || null,
  };
}
