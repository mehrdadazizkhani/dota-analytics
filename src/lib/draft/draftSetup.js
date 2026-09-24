const DRAFT_SETUP_STORAGE_KEY = "dota-analytics-draft-setup";

export function createDraftSetup() {
  return {
    players: [
      {
        id: "player-1",
        name: "",
        position: null,
        heroPool: [],
      },
      {
        id: "player-2",
        name: "",
        position: null,
        heroPool: [],
      },
      {
        id: "player-3",
        name: "",
        position: null,
        heroPool: [],
      },
      {
        id: "player-4",
        name: "",
        position: null,
        heroPool: [],
      },
      {
        id: "player-5",
        name: "",
        position: null,
        heroPool: [],
      },
    ],

    teamThreats: [],
  };
}

export function loadDraftSetup() {
  try {
    const saved = localStorage.getItem(DRAFT_SETUP_STORAGE_KEY);

    if (!saved) {
      return createDraftSetup();
    }

    return JSON.parse(saved);
  } catch {
    return createDraftSetup();
  }
}

export function saveDraftSetup(setup) {
  try {
    localStorage.setItem(DRAFT_SETUP_STORAGE_KEY, JSON.stringify(setup));
  } catch {
    // Ignore localStorage errors.
  }
}
