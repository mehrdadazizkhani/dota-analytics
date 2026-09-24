function average(values) {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getHeroData(heroId, draftDataset) {
  return draftDataset?.heroes?.get(Number(heroId)) || null;
}

function getTeamPicks(picks = [], draftDataset) {
  return picks
    .map((pick) => getHeroData(pick.heroId, draftDataset))
    .filter(Boolean);
}

function calculateHeroMetaScore(hero) {
  const winRate = Number(hero.meta?.winRate || 0);
  const pickRate = Number(hero.meta?.pickRate || 0);

  const winRateScore = Math.max(0, Math.min(100, ((winRate - 45) / 10) * 100));

  const pickRateScore = Math.max(0, Math.min(100, (pickRate / 10) * 100));

  return winRateScore * 0.7 + pickRateScore * 0.3;
}

function calculateTeamMeta(picks, draftDataset) {
  const heroes = getTeamPicks(picks, draftDataset);

  if (!heroes.length) return 0;

  return average(heroes.map(calculateHeroMetaScore));
}

function calculateTeamSynergy(picks, draftDataset) {
  const heroes = getTeamPicks(picks, draftDataset);

  if (heroes.length < 2) return 0;

  const synergyValues = [];

  for (let i = 0; i < heroes.length; i += 1) {
    for (let j = i + 1; j < heroes.length; j += 1) {
      const relation = heroes[i].with?.get(heroes[j].heroId);

      if (!relation) continue;

      synergyValues.push(Number(relation.synergy || 0));
    }
  }

  if (!synergyValues.length) return 0;

  return Math.max(0, Math.min(100, average(synergyValues) * 10));
}

function calculateTeamCounter(picks, enemyPicks, draftDataset) {
  const ourHeroes = getTeamPicks(picks, draftDataset);
  const enemyHeroes = getTeamPicks(enemyPicks, draftDataset);

  if (!ourHeroes.length || !enemyHeroes.length) return 0;

  const counterValues = [];

  for (const ourHero of ourHeroes) {
    for (const enemyHero of enemyHeroes) {
      const relation = ourHero.vs?.get(enemyHero.heroId);

      if (!relation) continue;

      counterValues.push(Number(relation.winRateHeroId1 || 0));
    }
  }

  if (!counterValues.length) return 0;

  const averageWinRate = average(counterValues);

  return Math.max(0, Math.min(100, ((averageWinRate - 40) / 20) * 100));
}

function calculateBanImpact(draftState, draftDataset) {
  const ourPicks = draftState.ourPicks || [];
  const enemyPicks = draftState.enemyPicks || [];
  const ourBans = draftState.ourBans || [];
  const enemyBans = draftState.enemyBans || [];

  let ourBanImpact = 0;
  let enemyBanImpact = 0;

  /*
   * OUR BANS
   *
   * We banned this hero from the enemy.
   * If that hero has strong Meta value, the ban protects us
   * from a strong enemy option.
   */
  for (const ban of ourBans) {
    const hero = getHeroData(ban.heroId, draftDataset);

    if (!hero) continue;

    const metaScore = calculateHeroMetaScore(hero);

    const counterValues = [];

    for (const ourPick of ourPicks) {
      const ourHero = getHeroData(ourPick.heroId, draftDataset);

      if (!ourHero) continue;

      const relation = ourHero.vs?.get(hero.heroId);

      if (!relation) continue;

      counterValues.push(Number(relation.winRateHeroId2 || 0));
    }

    const enemyThreat =
      counterValues.length > 0 ? average(counterValues) : metaScore;

    ourBanImpact += enemyThreat;
  }

  /*
   * ENEMY BANS
   *
   * Enemy banned this hero from us.
   * If that hero has strong Meta value, we lose access
   * to a strong option.
   */
  for (const ban of enemyBans) {
    const hero = getHeroData(ban.heroId, draftDataset);

    if (!hero) continue;

    const metaScore = calculateHeroMetaScore(hero);

    const counterValues = [];

    for (const enemyPick of enemyPicks) {
      const enemyHero = getHeroData(enemyPick.heroId, draftDataset);

      if (!enemyHero) continue;

      const relation = hero.vs?.get(enemyHero.heroId);

      if (!relation) continue;

      counterValues.push(Number(relation.winRateHeroId1 || 0));
    }

    const lostOption =
      counterValues.length > 0 ? average(counterValues) : metaScore;

    enemyBanImpact += lostOption;
  }

  return {
    ourBanImpact,
    enemyBanImpact,
    advantage: ourBanImpact - enemyBanImpact,
  };
}

export function calculateDraftAdvantage({ draftState, draftDataset }) {
  if (!draftState || !draftDataset) {
    return {
      ourScore: 0,
      enemyScore: 0,
      advantage: 0,
      label: "NEUTRAL",
      metrics: {
        meta: 0,
        synergy: 0,
        counter: 0,
        banImpact: 0,
      },
    };
  }

  const ourPicks = draftState.ourPicks || [];
  const enemyPicks = draftState.enemyPicks || [];

  const ourMeta = calculateTeamMeta(ourPicks, draftDataset);

  const enemyMeta = calculateTeamMeta(enemyPicks, draftDataset);

  const ourSynergy = calculateTeamSynergy(ourPicks, draftDataset);

  const enemySynergy = calculateTeamSynergy(enemyPicks, draftDataset);

  const ourCounter = calculateTeamCounter(ourPicks, enemyPicks, draftDataset);

  const enemyCounter = calculateTeamCounter(enemyPicks, ourPicks, draftDataset);

  const banImpact = calculateBanImpact(draftState, draftDataset);

  const ourScore = ourMeta * 0.4 + ourSynergy * 0.3 + ourCounter * 0.3;

  const enemyScore = enemyMeta * 0.4 + enemySynergy * 0.3 + enemyCounter * 0.3;

  const advantage = ourScore - enemyScore + banImpact.advantage * 0.1;

  let label = "NEUTRAL";

  if (advantage >= 10) {
    label = "ADVANTAGE";
  } else if (advantage <= -10) {
    label = "DISADVANTAGE";
  }

  return {
    ourScore,
    enemyScore,
    advantage,
    label,
    metrics: {
      meta: ourMeta - enemyMeta,
      synergy: ourSynergy - enemySynergy,
      counter: ourCounter - enemyCounter,
      banImpact: banImpact.advantage,
    },
  };
}
