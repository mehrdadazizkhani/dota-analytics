export function createDraftState() {
  return {
    draftOrder: "FIRST_PICK",

    ourPicks: [],
    ourBans: [],

    enemyPicks: [],
    enemyBans: [],

    currentActionIndex: 0,
  };
}
