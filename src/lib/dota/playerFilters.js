function filterByPosition(match, position) {
  if (!position || position === "ALL") {
    return true;
  }

  return match.player?.position === position;
}

function filterByHero(match, hero) {
  if (!hero || hero === "ALL") {
    return true;
  }

  return match.player?.hero?.shortName === hero;
}

function filterByMode(match, mode) {
  if (!mode || mode === "ALL") {
    return true;
  }

  const partyId = match.player?.partyId;

  if (mode === "SOLO") {
    return partyId === null;
  }

  if (mode === "PARTY") {
    return partyId !== null;
  }

  return true;
}

function filterByTurbo(match, excludeTurbo) {
  if (!excludeTurbo) {
    return true;
  }

  return match.gameMode !== "TURBO";
}

function filterByTime(match, time) {
  if (!time || time === "ALL") {
    return true;
  }

  const matchDate = new Date(match.startDateTime);

  const now = new Date();

  const monthsMap = {
    "1_MONTH": 1,
    "3_MONTH": 3,
    "6_MONTH": 6,
    "12_MONTH": 12,
  };

  const months = monthsMap[time];

  if (!months) {
    return true;
  }

  const limitDate = new Date();

  limitDate.setMonth(now.getMonth() - months);

  return matchDate >= limitDate;
}

export function filterPlayerMatches(matches, filters) {
  if (!Array.isArray(matches)) {
    return [];
  }

  return matches.filter((match) => {
    return (
      filterByPosition(match, filters.position) &&
      filterByHero(match, filters.hero) &&
      filterByMode(match, filters.mode) &&
      filterByTurbo(match, filters.excludeTurbo) &&
      filterByTime(match, filters.time)
    );
  });
}
