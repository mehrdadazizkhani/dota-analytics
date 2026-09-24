const DRAFT_SESSION_STORAGE_KEY = "dota-draft-session";

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

export function loadDraftSession() {
  try {
    const saved = localStorage.getItem(DRAFT_SESSION_STORAGE_KEY);

    if (!saved) {
      return null;
    }

    const session = JSON.parse(saved);

    if (!session?.active || !session?.draftState) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function saveDraftSession(draftState) {
  try {
    localStorage.setItem(
      DRAFT_SESSION_STORAGE_KEY,
      JSON.stringify({
        active: true,
        draftState,
      }),
    );
  } catch {
    // Ignore localStorage errors.
  }
}

export function clearDraftSession() {
  try {
    localStorage.removeItem(DRAFT_SESSION_STORAGE_KEY);
  } catch {
    // Ignore localStorage errors.
  }
}
