const DRAFT_RULES = {
  "7.41f": [
    "DB",
    "DB",
    "RB",
    "RB",
    "DB",
    "RB",
    "RB",
    "DP",
    "RP",
    "DB",
    "DB",
    "RB",
    "RP",
    "DP",
    "DP",
    "RP",
    "RP",
    "DP",
    "DB",
    "RB",
    "DB",
    "RB",
    "DP",
    "RP",
  ],
};

export const ACTIVE_DRAFT_VERSION = "7.41f";

export function getDraftRules(version = ACTIVE_DRAFT_VERSION) {
  return DRAFT_RULES[version] || DRAFT_RULES[ACTIVE_DRAFT_VERSION];
}

export function getDraftSequence(
  teamSide = "DIRE",
  firstPickSide = "OUR",
  version = ACTIVE_DRAFT_VERSION,
) {
  const rules = getDraftRules(version);

  const firstPickTeam =
    firstPickSide === "OUR"
      ? teamSide
      : teamSide === "DIRE"
        ? "RADIANT"
        : "DIRE";

  const secondPickTeam = firstPickTeam === "DIRE" ? "RADIANT" : "DIRE";

  const actions = rules.map((code, index) => {
    const physicalCodeTeam = code[0] === "D" ? "DIRE" : "RADIANT";

    const team = physicalCodeTeam === "DIRE" ? firstPickTeam : secondPickTeam;

    const side = team === teamSide ? "OUR" : "ENEMY";

    return {
      index,
      type: code[1] === "P" ? "PICK" : "BAN",
      team,
      side,
      completed: false,
      heroId: null,
    };
  });

  return actions;
}
