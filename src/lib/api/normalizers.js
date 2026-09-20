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
