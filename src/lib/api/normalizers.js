export function normalizeHeroes(response) {
  return response?.data?.constants?.heroes || [];
}

export function normalizePlayer(response) {
  const steamAccount = response?.data?.player?.steamAccount;

  if (!steamAccount) {
    return null;
  }

  return {
    accountId: Number(steamAccount.id) || null,

    name: steamAccount.name || "",

    avatar: steamAccount.avatar || "",

    isDotaPlusSubscriber: Boolean(steamAccount.isDotaPlusSubscriber),

    seasonRank: Number(steamAccount.seasonRank || 0),

    seasonLeaderboardRank:
      Number(steamAccount.seasonLeaderboardRank || 0) || null,

    guild: normalizeGuild(steamAccount.guild),

    pro: normalizePro(steamAccount.proSteamAccount),
  };
}

function normalizeGuild(guild) {
  const data = guild?.guild;

  if (!data) {
    return null;
  }

  return {
    name: data.name || "",
    tag: data.tag || "",
  };
}

function normalizePro(pro) {
  if (!pro) {
    return null;
  }

  return {
    name: pro.name || "",
    realName: pro.realName || "",
    isPro: Boolean(pro.isPro),

    totalEarnings: Number(pro.totalEarnings || 0),

    position: pro.position || null,

    team: pro.team
      ? {
          id: Number(pro.team.id) || null,
          tag: pro.team.tag || "",
        }
      : null,
  };
}

export function normalizePlayerOverview(response) {
  const player = response?.data?.player;

  if (!player) {
    return null;
  }

  return {
    ...player,
  };
}

export function normalizePlayerMatches(response) {
  return response?.data?.player?.matches?.edges?.map((edge) => edge.node) || [];
}
