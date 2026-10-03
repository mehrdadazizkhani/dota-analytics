const MIN_EFFECTIVE_STRENGTH = 0.45;
const RELATIVE_EDGE_THRESHOLD = 0.34;

function confidenceFactor(matchCount, maxMatchCount) {
  if (!matchCount || !maxMatchCount) {
    return 0;
  }

  return 0.35 + 0.65 * Math.sqrt(Math.min(1, matchCount / maxMatchCount));
}

function addRelation(map, relation) {
  const heroId1 = Number(relation?.heroId1);
  const heroId2 = Number(relation?.heroId2);

  if (!heroId1 || !heroId2 || heroId1 === heroId2) {
    return;
  }

  const key =
    heroId1 < heroId2 ? `${heroId1}:${heroId2}` : `${heroId2}:${heroId1}`;

  if (!map.has(key)) {
    map.set(key, {
      heroIdA: Math.min(heroId1, heroId2),
      heroIdB: Math.max(heroId1, heroId2),
      relations: [],
    });
  }

  map.get(key).relations.push(relation);
}

function collapseRelations(dataset, mode) {
  const relationMap = new Map();

  if (!dataset?.heroes) {
    return [];
  }

  for (const hero of dataset.heroes.values()) {
    const relations = mode === "WITH" ? hero.with : hero.vs;

    for (const relation of relations?.values() || []) {
      addRelation(relationMap, relation);
    }
  }

  return [...relationMap.values()];
}

function buildWithEdge(entry) {
  const totalMatches = entry.relations.reduce(
    (sum, relation) => sum + Number(relation.matchCount || 0),
    0,
  );

  const weightedSynergy = entry.relations.reduce(
    (sum, relation) =>
      sum + Number(relation.synergy || 0) * Number(relation.matchCount || 0),
    0,
  );

  const synergy = totalMatches > 0 ? weightedSynergy / totalMatches : 0;

  return {
    id: `with-${entry.heroIdA}-${entry.heroIdB}`,
    from: entry.heroIdA,
    to: entry.heroIdB,
    value: synergy,
    matchCount: totalMatches,
    kind: "WITH",
  };
}

function normalizeWinRate(value) {
  const number = Number(value || 0);

  // STRATZ may return win rate as either:
  // 0.52 or 52
  return Math.abs(number) <= 1.5 ? number * 100 : number;
}

function buildAgainstEdge(entry) {
  /*
   * VS is directional:
   *
   * heroId1 vs heroId2
   *
   * The hero with the higher win rate has
   * the matchup advantage.
   */

  if (!entry.relations.length) {
    return null;
  }

  /*
   * Use the relation with the largest sample.
   *
   * Both heroes can expose the same matchup from
   * their own perspective, so the largest sample
   * gives us the most reliable observation.
   */

  const relation = [...entry.relations].sort(
    (a, b) => Number(b.matchCount || 0) - Number(a.matchCount || 0),
  )[0];

  if (!relation) {
    return null;
  }

  const heroId1 = Number(relation.heroId1);

  const heroId2 = Number(relation.heroId2);

  if (!heroId1 || !heroId2 || heroId1 === heroId2) {
    return null;
  }

  const winRate1 = normalizeWinRate(relation.winRateHeroId1);

  const winRate2 = normalizeWinRate(relation.winRateHeroId2);

  const advantage = winRate1 - winRate2;

  if (Math.abs(advantage) < 0.001) {
    return null;
  }

  return {
    id: `vs-${Math.min(heroId1, heroId2)}-${Math.max(heroId1, heroId2)}`,

    from: advantage > 0 ? heroId1 : heroId2,

    to: advantage > 0 ? heroId2 : heroId1,

    value: Math.abs(advantage),

    matchCount: Number(relation.matchCount || 0),

    kind: "AGAINST",
  };
}

export function buildWeightedGraph(dataset, mode) {
  const collapsed = collapseRelations(dataset, mode);

  const rawEdges = collapsed
    .map((entry) => {
      if (mode === "WITH") {
        return buildWithEdge(entry);
      }

      return buildAgainstEdge(entry);
    })
    .filter(Boolean);

  const maxMatchCount = Math.max(
    ...rawEdges.map((edge) => edge.matchCount || 0),
    0,
  );

  /*
   * Relationship strength:
   *
   *   absolute relationship value
   *   × confidence from sample size
   *
   * This prevents a tiny sample with a huge win-rate
   * difference from dominating the graph.
   */

  const weightedEdges = rawEdges.map((edge) => ({
    ...edge,

    confidence: confidenceFactor(edge.matchCount, maxMatchCount),

    strength:
      Math.abs(edge.value) * confidenceFactor(edge.matchCount, maxMatchCount),
  }));

  /*
   * Find the strongest relationship for every hero.
   * This lets each hero keep its meaningful relationships
   * instead of forcing exactly 10 visible edges.
   */

  const maxStrengthByHero = new Map();

  for (const edge of weightedEdges) {
    for (const heroId of [edge.from, edge.to]) {
      const current = maxStrengthByHero.get(heroId) || 0;

      maxStrengthByHero.set(heroId, Math.max(current, edge.strength));
    }
  }

  /*
   * Remove very weak relationships.
   *
   * An edge must:
   * 1. Have enough absolute strength.
   * 2. Be at least a meaningful fraction of
   *    the strongest relationship of one of
   *    its two heroes.
   */

  const visibleEdges = weightedEdges.filter((edge) => {
    if (edge.strength < MIN_EFFECTIVE_STRENGTH) {
      return false;
    }

    const heroMax = Math.max(
      maxStrengthByHero.get(edge.from) || 0,
      maxStrengthByHero.get(edge.to) || 0,
    );

    if (!heroMax) {
      return false;
    }

    return edge.strength >= heroMax * RELATIVE_EDGE_THRESHOLD;
  });

  const maxVisibleStrength = Math.max(
    ...visibleEdges.map((edge) => edge.strength),
    1,
  );

  return visibleEdges.map((edge) => ({
    ...edge,

    normalizedStrength: edge.strength / maxVisibleStrength,
  }));
}
