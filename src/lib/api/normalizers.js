function normalizeAliases(aliases) {
  if (!Array.isArray(aliases)) {
    return [];
  }

  return aliases
    .filter(Boolean)
    .map((alias) => String(alias).trim())
    .filter(Boolean);
}

function normalizeRoles(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map((role) => ({
      roleId: role?.roleId || null,
    }))
    .filter((role) => role.roleId);
}

export function normalizeHero(hero) {
  if (!hero) {
    return null;
  }

  const primaryAttribute =
    hero.stats?.primaryAttributeEnum || hero.stats?.primaryAttribute || null;

  const attackType = hero.stats?.attackType || null;

  const complexity = Number(hero.stats?.complexity || 0);

  return {
    id: Number(hero.id),
    name: hero.name || "",
    displayName: hero.displayName || "",
    shortName: hero.shortName || "",

    aliases: normalizeAliases(hero.aliases),

    roles: normalizeRoles(hero.roles),

    primaryAttribute,

    attackType,

    complexity,
  };
}

export function normalizeHeroes(heroes) {
  if (!Array.isArray(heroes)) {
    return [];
  }

  return heroes.map(normalizeHero).filter(Boolean);
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

function normalizeTeam(team) {
  if (!team) {
    return null;
  }

  return {
    id: Number(team.id) || null,
    tag: team.tag || "",
  };
}

function normalizeProPlayer(proSteamAccount) {
  if (!proSteamAccount) {
    return null;
  }

  return {
    name: proSteamAccount.name || "",
    realName: proSteamAccount.realName || "",

    isPro: Boolean(proSteamAccount.isPro),

    totalEarnings: Number(proSteamAccount.totalEarnings || 0),

    position: proSteamAccount.position || null,

    team: normalizeTeam(proSteamAccount.team),
  };
}

export function normalizePlayer(player) {
  const steamAccount = player?.steamAccount;

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

    pro: normalizeProPlayer(steamAccount.proSteamAccount),
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

export function normalizePlayerMatches(matches) {
  if (!Array.isArray(matches)) {
    return [];
  }

  return matches

    .map((match) => ({
      id: Number(match.id) || null,

      durationSeconds: Number(match.durationSeconds || 0),

      startDateTime: match.startDateTime || null,

      actualRank: Number(match.actualRank || 0) || null,

      lobbyType: match.lobbyType || null,

      gameMode: match.gameMode || null,

      laneOutcome: {
        bottom: match.bottomLaneOutcome || null,

        mid: match.midLaneOutcome || null,

        top: match.topLaneOutcome || null,
      },

      league: match.league
        ? {
            id: Number(match.league.id) || null,

            displayName: match.league.displayName || "",
          }
        : null,

      player: normalizeMatchPlayer(
        Array.isArray(match.players) ? match.players[0] : null,
      ),
    }))

    .filter((match) => match.id);
}

function normalizeMatchPlayer(player) {
  if (!player) {
    return null;
  }

  return {
    kills: Number(player.kills || 0),

    deaths: Number(player.deaths || 0),

    assists: Number(player.assists || 0),

    partyId: Number(player.partyId || 0) || null,

    lane: player.lane || null,

    position: player.position || null,

    imp: Number(player.imp || 0),

    isVictory: Boolean(player.isVictory),

    award: player.award || null,

    hero: player.hero
      ? {
          displayName: player.hero.displayName || "",

          shortName: player.hero.shortName || "",
        }
      : null,
  };
}
