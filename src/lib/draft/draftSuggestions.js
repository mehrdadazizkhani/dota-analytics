import { calculateHeroScore } from "./draftEngine";

function getAvailableHeroes(heroes, draftState) {
  const usedHeroIds = new Set(
    [
      ...draftState.ourPicks,
      ...draftState.ourBans,
      ...draftState.enemyPicks,
      ...draftState.enemyBans,
    ].map((item) => Number(item.heroId)),
  );

  return heroes.filter((hero) => !usedHeroIds.has(Number(hero.id)));
}

function getHeroDataset(hero, draftDataset) {
  return draftDataset?.heroes?.get(Number(hero.id)) || null;
}

function scoreHero({ hero, player, draftState, draftSetup, draftDataset }) {
  const datasetHero = getHeroDataset(hero, draftDataset);

  const score = calculateHeroScore({
    hero: {
      ...hero,
      heroId: Number(hero.id),
      roles: hero.roles || [],
      meta: datasetHero?.meta || {},
      stats: datasetHero?.stats || {},
      with: datasetHero?.with || new Map(),
      vs: datasetHero?.vs || new Map(),
      matchCountWith: datasetHero?.matchCountWith || 0,
      matchCountVs: datasetHero?.matchCountVs || 0,
    },
    player,
    draftState,
    draftSetup,
    draftDataset,
  });

  return {
    hero,
    score: score.finalScore,
    breakdown: score.scores,
  };
}

function sortSuggestions(items) {
  return items.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return String(a.hero.displayName).localeCompare(String(b.hero.displayName));
  });
}

export function getDraftSuggestions({
  heroes = [],
  draftState,
  draftSetup,
  draftDataset,
}) {
  if (!draftState || !draftDataset) {
    return {
      bestPicks: [],
      comfortPicks: [],
      bestBans: [],
      teamThreats: [],
    };
  }

  const availableHeroes = getAvailableHeroes(heroes, draftState);

  const primaryPlayer =
    draftSetup?.players?.find((player) => player.position === 1) ||
    draftSetup?.players?.[0] ||
    null;

  const scoredPicks = availableHeroes
    .map((hero) =>
      scoreHero({
        hero,
        player: primaryPlayer,
        draftState,
        draftSetup,
        draftDataset,
      }),
    )
    .filter(Boolean);

  const bestPicks = sortSuggestions([...scoredPicks]).slice(0, 3);

  const comfortPicks = sortSuggestions(
    [...scoredPicks]
      .filter((item) => {
        const player = primaryPlayer;

        return player?.heroPool?.some(
          (poolHero) => Number(poolHero.heroId) === Number(item.hero.id),
        );
      })
      .sort((a, b) => {
        const comfortA =
          primaryPlayer?.heroPool?.find(
            (item) => Number(item.heroId) === Number(a.hero.id),
          )?.comfort || 0;

        const comfortB =
          primaryPlayer?.heroPool?.find(
            (item) => Number(item.heroId) === Number(b.hero.id),
          )?.comfort || 0;

        return comfortB - comfortA;
      }),
  ).slice(0, 3);

  const bestBans = sortSuggestions([...scoredPicks]).slice(3, 6);

  const threatIds = new Set(
    (draftSetup?.teamThreats || []).map((item) => Number(item.heroId)),
  );

  const teamThreats = availableHeroes
    .filter((hero) => threatIds.has(Number(hero.id)))
    .map((hero) => ({
      hero,
      score: 0,
      breakdown: {},
    }));

  return {
    bestPicks,
    comfortPicks,
    bestBans,
    teamThreats,
  };
}
