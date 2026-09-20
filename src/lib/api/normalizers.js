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
