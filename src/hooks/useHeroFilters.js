import { useMemo, useState } from "react";

const INITIAL_FILTERS = {
  search: "",
  attackType: null,
  complexity: null,
  mainRole: null,
  roles: [],
  meta: false,
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function matchesHero(hero, filters) {
  const search = normalize(filters.search);

  const searchableValues = [
    hero.displayName,
    hero.name,
    hero.shortName,
    ...(hero.aliases || []),
  ];

  const matchesSearch =
    !search ||
    searchableValues.some((value) => normalize(value).includes(search));

  const attackType = normalize(hero.stats?.attackType);

  const matchesAttackType =
    !filters.attackType || attackType === normalize(filters.attackType);

  const matchesComplexity =
    !filters.complexity ||
    Number(hero.stats?.complexity) === Number(filters.complexity);

  const heroRoles =
    hero.roles?.map((role) => String(role.roleId || "").toUpperCase()) || [];

  const matchesMainRole =
    !filters.mainRole || heroRoles.includes(filters.mainRole);

  const matchesRoles =
    filters.roles.length === 0 ||
    filters.roles.every((role) => heroRoles.includes(role));

  return (
    matchesSearch &&
    matchesAttackType &&
    matchesComplexity &&
    matchesMainRole &&
    matchesRoles
  );
}

export function useHeroFilters(heroes, meta) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const setSearch = (value) => {
    setFilters((current) => ({
      ...current,
      search: value,
    }));
  };

  const setAttackType = (value) => {
    setFilters((current) => ({
      ...current,
      attackType: value,
    }));
  };

  const setComplexity = (value) => {
    setFilters((current) => ({
      ...current,
      complexity: value,
    }));
  };

  const setMainRole = (value) => {
    setFilters((current) => ({
      ...current,
      mainRole: value,
    }));
  };

  const toggleRole = (role) => {
    setFilters((current) => {
      const exists = current.roles.includes(role);

      return {
        ...current,
        roles: exists
          ? current.roles.filter((item) => item !== role)
          : [...current.roles, role],
      };
    });
  };

  const toggleMeta = () => {
    setFilters((current) => ({
      ...current,
      meta: !current.meta,
    }));
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const heroMatches = useMemo(() => {
    return new Map(heroes.map((hero) => [hero.id, matchesHero(hero, filters)]));
  }, [heroes, filters]);

  const heroMeta = useMemo(() => {
    return new Map(meta.map((hero) => [Number(hero.heroId), hero]));
  }, [meta]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.attackType !== null ||
    filters.complexity !== null ||
    filters.mainRole !== null ||
    filters.roles.length > 0;

  return {
    filters,
    heroMatches,
    heroMeta,
    hasActiveFilters,
    setSearch,
    setAttackType,
    setComplexity,
    setMainRole,
    toggleRole,
    toggleMeta,
    clearFilters,
  };
}
