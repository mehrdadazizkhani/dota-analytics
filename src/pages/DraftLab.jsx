import { useEffect, useState } from "react";
import { getDraftData, getHeroes } from "../lib/api/stratz";
import { buildDraftDataset } from "../lib/draft/draftData";
import DraftSuggestions from "../components/draft/DraftSuggestions";
import { getDraftSuggestions } from "../lib/draft/draftSuggestions";
import DraftAnalysis from "../components/draft/DraftAnalysis";
import {
  createDraftSetup,
  loadDraftSetup,
  saveDraftSetup,
} from "../lib/draft/draftSetup";
import {
  createDraftState,
  loadDraftSession,
  saveDraftSession,
  clearDraftSession,
} from "../lib/draft/draftState";
import { calculateHeroScore } from "../lib/draft/draftEngine";
import DraftHeroPicker from "../components/draft/DraftHeroPicker";
import { getHeroAsset } from "../lib/assets/heroes";
import Select from "../components/ui/Select";
import { getDraftSequence } from "../lib/draft/draftOrder";
import { calculateDraftAdvantage } from "../lib/draft/draftAnalysis";
import {
  OfflaneIcon,
  SafelaneIcon,
  MidlaneIcon,
  SoftSupportIcon,
  HardSupportIcon,
} from "../components/icons/PositionIcons";

const DRAFT_BRACKETS = [
  {
    label: "Herald / Guardian",
    value: "HERALD_GUARDIAN",
  },
  {
    label: "Crusader / Archon",
    value: "CRUSADER_ARCHON",
  },
  {
    label: "Legend / Ancient",
    value: "LEGEND_ANCIENT",
  },
  {
    label: "Divine / Immortal",
    value: "DIVINE_IMMORTAL",
  },
  {
    label: "All",
    value: "ALL",
  },
];

const POSITIONS = [
  {
    value: 1,
    label: "Safe Lane",
    icon: <SafelaneIcon />,
  },
  {
    value: 2,
    label: "Mid Lane",
    icon: <MidlaneIcon />,
  },
  {
    value: 3,
    label: "Offlane",
    icon: <OfflaneIcon />,
  },
  {
    value: 4,
    label: "Soft Support",
    icon: <SoftSupportIcon />,
  },
  {
    value: 5,
    label: "Hard Support",
    icon: <HardSupportIcon />,
  },
];

const COMFORT_LEVELS = [1, 2, 3, 4, 5];

function DraftLab() {
  const [bracket, setBracket] = useState(() => {
    try {
      return localStorage.getItem("dota-draft-bracket") || "DIVINE_IMMORTAL";
    } catch {
      return "DIVINE_IMMORTAL";
    }
  });

  const [teamSide, setTeamSide] = useState(() => {
    try {
      return localStorage.getItem("dota-draft-team-side") || "DIRE";
    } catch {
      return "DIRE";
    }
  });

  const [firstPickSide, setFirstPickSide] = useState(() => {
    try {
      return localStorage.getItem("dota-draft-first-pick-side") || "OUR";
    } catch {
      return "OUR";
    }
  });
  const [heroes, setHeroes] = useState([]);
  const [heroesLoading, setHeroesLoading] = useState(true);
  const [heroesError, setHeroesError] = useState("");

  const [loading, setLoading] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [error, setError] = useState("");

  const [draftSetup, setDraftSetup] = useState(() => loadDraftSetup());

  const [draftSessionActive, setDraftSessionActive] = useState(() => {
    return Boolean(loadDraftSession());
  });

  const [draftState, setDraftState] = useState(() => {
    const session = loadDraftSession();

    return session?.draftState || createDraftState();
  });

  useEffect(() => {
    if (!draftSessionActive) {
      return;
    }

    saveDraftSession(draftState);
  }, [draftState, draftSessionActive]);

  useEffect(() => {
    if (!draftSessionActive) {
      return;
    }

    async function restoreDraft() {
      try {
        setLoading(true);
        setError("");

        const draftData = await getDraftData(bracket);

        const dataset = buildDraftDataset(draftData);

        setDraftData(dataset);
      } catch (error) {
        console.error("Failed to restore draft:", error);
        setError(error.message || "Failed to restore draft.");
        setDraftSessionActive(false);
        clearDraftSession();
      } finally {
        setLoading(false);
      }
    }

    restoreDraft();
  }, [draftSessionActive]);

  const [picker, setPicker] = useState({
    open: false,
    type: null,
    playerId: null,
    actionIndex: null,
    title: "",
  });

  useEffect(() => {
    saveDraftSetup(draftSetup);
  }, [draftSetup]);

  useEffect(() => {
    localStorage.setItem("dota-draft-bracket", bracket);
  }, [bracket]);

  useEffect(() => {
    localStorage.setItem("dota-draft-team-side", teamSide);
  }, [teamSide]);

  useEffect(() => {
    localStorage.setItem("dota-draft-first-pick-side", firstPickSide);
  }, [firstPickSide]);

  const draftSequence = getDraftSequence(teamSide, firstPickSide);

  useEffect(() => {
    async function loadHeroes() {
      try {
        setHeroesLoading(true);
        setHeroesError("");

        const data = await getHeroes();

        setHeroes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load heroes:", error);
        setHeroesError(error.message || "Failed to load heroes.");
      } finally {
        setHeroesLoading(false);
      }
    }

    loadHeroes();
  }, []);

  function getDraftAction(index) {
    return draftSequence[index] || null;
  }

  function getDraftHero(heroId) {
    return heroes.find((hero) => Number(hero.id) === Number(heroId));
  }

  function getUsedDraftHeroIds() {
    return [
      ...draftState.ourPicks,
      ...draftState.ourBans,
      ...draftState.enemyPicks,
      ...draftState.enemyBans,
    ].map((item) => Number(item.heroId));
  }

  function setDraftActionHero(actionIndex, heroId) {
    const action = getDraftAction(actionIndex);

    if (!action) {
      return;
    }

    const collectionKey =
      action.side === "OUR"
        ? action.type === "PICK"
          ? "ourPicks"
          : "ourBans"
        : action.type === "PICK"
          ? "enemyPicks"
          : "enemyBans";

    setDraftState((current) => {
      const collection = current[collectionKey] || [];

      const existingIndex = collection.findIndex(
        (item) => Number(item.actionIndex) === Number(actionIndex),
      );

      // Check whether this hero is already used
      // by another draft action.
      const heroAlreadyUsed = [
        ...current.ourPicks,
        ...current.ourBans,
        ...current.enemyPicks,
        ...current.enemyBans,
      ].some(
        (item) =>
          Number(item.heroId) === Number(heroId) &&
          Number(item.actionIndex) !== Number(actionIndex),
      );

      if (heroAlreadyUsed) {
        return current;
      }

      const nextCollection = [...collection];

      const value = {
        heroId: Number(heroId),
        actionIndex: Number(actionIndex),
      };

      if (existingIndex >= 0) {
        nextCollection[existingIndex] = value;
      } else {
        nextCollection.push(value);
      }

      const isCurrentAction =
        Number(actionIndex) === Number(current.currentActionIndex);

      return {
        ...current,
        [collectionKey]: nextCollection,

        // Only completing the current action advances the draft.
        // Editing an older completed action does NOT move the draft backwards.
        currentActionIndex: isCurrentAction
          ? Math.min(
              Number(current.currentActionIndex) + 1,
              draftSequence.length,
            )
          : current.currentActionIndex,
      };
    });
  }

  function removeDraftAction(actionIndex) {
    const action = getDraftAction(actionIndex);

    if (!action) {
      return;
    }

    const collectionKey =
      action.side === "OUR"
        ? action.type === "PICK"
          ? "ourPicks"
          : "ourBans"
        : action.type === "PICK"
          ? "enemyPicks"
          : "enemyBans";

    setDraftState((current) => ({
      ...current,
      [collectionKey]: current[collectionKey].filter(
        (item) => Number(item.actionIndex) !== Number(actionIndex),
      ),
    }));
  }

  function openDraftActionPicker(actionIndex) {
    const action = getDraftAction(actionIndex);

    if (!action) {
      return;
    }

    // Future actions are locked.
    // Current and previously completed actions remain editable.
    if (Number(actionIndex) > Number(draftState.currentActionIndex)) {
      return;
    }

    setPicker({
      open: true,
      type: "DRAFT_ACTION",
      playerId: null,
      actionIndex,
      title:
        action.type === "PICK"
          ? `${action.side === "OUR" ? "Our" : "Enemy"} Pick`
          : `${action.side === "OUR" ? "Our" : "Enemy"} Ban`,
    });
  }

  function closePicker() {
    setPicker({
      open: false,
      type: null,
      playerId: null,
      actionIndex: null,
      title: "",
    });
  }

  function updatePlayer(playerId, changes) {
    setDraftSetup((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              ...changes,
            }
          : player,
      ),
    }));
  }

  function handleBackToSetup() {
    clearDraftSession();

    setDraftSessionActive(false);
    setDraftData(null);
    setDraftState(createDraftState());
    setError("");
    closePicker();
  }

  function updatePlayerName(playerId, name) {
    updatePlayer(playerId, { name });
  }

  function updatePlayerPosition(playerId, position) {
    updatePlayer(playerId, {
      position: position ? Number(position) : null,
    });
  }

  function toggleHeroInPool(playerId, heroId) {
    setDraftSetup((current) => ({
      ...current,
      players: current.players.map((player) => {
        if (player.id !== playerId) {
          return player;
        }

        const existing = player.heroPool.find(
          (item) => Number(item.heroId) === Number(heroId),
        );

        if (existing) {
          return {
            ...player,
            heroPool: player.heroPool.filter(
              (item) => Number(item.heroId) !== Number(heroId),
            ),
          };
        }

        return {
          ...player,
          heroPool: [
            ...player.heroPool,
            {
              heroId: Number(heroId),
              comfort: 3,
            },
          ],
        };
      }),
    }));
  }

  function updateHeroComfort(playerId, heroId, comfort) {
    setDraftSetup((current) => ({
      ...current,
      players: current.players.map((player) => {
        if (player.id !== playerId) {
          return player;
        }

        return {
          ...player,
          heroPool: player.heroPool.map((item) =>
            Number(item.heroId) === Number(heroId)
              ? {
                  ...item,
                  comfort: Number(comfort),
                }
              : item,
          ),
        };
      }),
    }));
  }

  function toggleThreat(heroId) {
    setDraftSetup((current) => {
      const exists = current.teamThreats.some(
        (item) => Number(item.heroId) === Number(heroId),
      );

      if (exists) {
        return {
          ...current,
          teamThreats: current.teamThreats.filter(
            (item) => Number(item.heroId) !== Number(heroId),
          ),
        };
      }

      return {
        ...current,
        teamThreats: [
          ...current.teamThreats,
          {
            heroId: Number(heroId),
          },
        ],
      };
    });
  }

  function getHeroById(heroId) {
    return heroes.find((hero) => Number(hero.id) === Number(heroId));
  }

  function getPlayerHeroPool(player) {
    return player.heroPool
      .map((item) => {
        const hero = getHeroById(item.heroId);

        if (!hero) {
          return null;
        }

        return {
          ...item,
          hero,
        };
      })
      .filter(Boolean);
  }

  function getThreatHeroes() {
    return draftSetup.teamThreats
      .map((item) => getHeroById(item.heroId))
      .filter(Boolean);
  }

  function openPlayerHeroPicker(playerId) {
    setPicker({
      open: true,
      type: "PLAYER_POOL",
      playerId,
      actionIndex: null,
      title: "Select Hero Pool",
    });
  }

  function openThreatPicker() {
    setPicker({
      open: true,
      type: "THREAT",
      playerId: null,
      actionIndex: null,
      title: "Select Team Threat",
    });
  }

  function handlePickerSelect(hero) {
    if (!hero) {
      return;
    }

    if (picker.type === "DRAFT_ACTION" && picker.actionIndex !== null) {
      const usedHeroIds = new Set(getUsedDraftHeroIds());

      const action = getDraftAction(picker.actionIndex);

      const currentCollectionKey =
        action.side === "OUR"
          ? action.type === "PICK"
            ? "ourPicks"
            : "ourBans"
          : action.type === "PICK"
            ? "enemyPicks"
            : "enemyBans";

      const currentCollection = draftState[currentCollectionKey] || [];

      const currentHero = currentCollection.find(
        (item) => Number(item.actionIndex) === Number(picker.actionIndex),
      );

      // Allow the hero currently assigned to this slot,
      // but block heroes used by any other draft action.
      if (
        usedHeroIds.has(Number(hero.id)) &&
        Number(currentHero?.heroId) !== Number(hero.id)
      ) {
        return;
      }

      setDraftActionHero(picker.actionIndex, hero.id);

      closePicker();
      return;
    }

    if (picker.type === "PLAYER_POOL" && picker.playerId) {
      toggleHeroInPool(picker.playerId, hero.id);
      return;
    }

    if (picker.type === "THREAT") {
      toggleThreat(hero.id);
    }
  }

  function getPickerSelectedIds() {
    if (picker.type === "PLAYER_POOL" && picker.playerId) {
      const player = draftSetup.players.find(
        (item) => item.id === picker.playerId,
      );

      return player?.heroPool.map((item) => item.heroId) || [];
    }

    if (picker.type === "THREAT") {
      return draftSetup.teamThreats.map((item) => item.heroId);
    }

    if (picker.type === "DRAFT_ACTION" && picker.actionIndex !== null) {
      const action = getDraftAction(picker.actionIndex);

      if (!action) {
        return [];
      }

      const collectionKey =
        action.side === "OUR"
          ? action.type === "PICK"
            ? "ourPicks"
            : "ourBans"
          : action.type === "PICK"
            ? "enemyPicks"
            : "enemyBans";

      const collection = draftState[collectionKey] || [];

      const current = collection.find(
        (item) => Number(item.actionIndex) === Number(picker.actionIndex),
      );

      return current?.heroId ? [current.heroId] : [];
    }

    return [];
  }

  async function handleStartDraft() {
    try {
      setLoading(true);
      setError("");
      setDraftData(null);

      const freshDraftState = createDraftState();

      setDraftState(freshDraftState);
      setDraftSessionActive(true);
      saveDraftSession(freshDraftState);

      const [data] = await Promise.all([getDraftData(bracket)]);

      const dataset = buildDraftDataset(data);

      setDraftData(dataset);
    } catch (error) {
      console.error("Failed to load draft data:", error);
      setError(error.message || "Failed to load draft data.");

      setDraftSessionActive(false);
      clearDraftSession();
    } finally {
      setLoading(false);
    }
  }

  function handleResetSetup() {
    clearDraftSession();

    localStorage.removeItem("dota-draft-bracket");
    localStorage.removeItem("dota-draft-team-side");
    localStorage.removeItem("dota-draft-first-pick-side");

    const emptySetup = createDraftSetup();

    setDraftSessionActive(false);
    setDraftSetup(emptySetup);
    setDraftState(createDraftState());
    setDraftData(null);
    setBracket("DIVINE_IMMORTAL");
    setTeamSide("DIRE");
    setFirstPickSide("OUR");
    setError("");
    closePicker();
  }

  const threatHeroes = getThreatHeroes();

  const draftSuggestions = getDraftSuggestions({
    heroes,
    draftState,
    draftSetup,
    draftDataset: draftData,
  });

  const draftAdvantage = calculateDraftAdvantage({
    draftState,
    draftDataset: draftData,
  });

  const testHeroData = draftData
    ? Array.from(draftData.heroes.values())[0]
    : null;

  const testHero = testHeroData
    ? {
        id: testHeroData.heroId,
        roles: [],
      }
    : null;

  const testScore = testHero
    ? calculateHeroScore({
        hero: testHero,
        player: draftSetup.players[0],
        draftState,
        draftSetup,
        draftDataset: draftData,
      })
    : null;

  const matchupCount = draftData
    ? Array.from(draftData.heroes.values()).reduce(
        (total, hero) => total + hero.with.size + hero.vs.size,
        0,
      )
    : 0;

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* PAGE HEADER */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-red-400" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Draft Intelligence
            </span>
          </div>

          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white">
            Draft Lab
          </h1>

          <p className="mt-0.5 text-[10px] text-white/25">
            Configure your team and build a competitive draft.
          </p>
        </div>
        {!draftData && (
          <div className="flex items-center gap-2">
            <Select
              value={bracket}
              onChange={setBracket}
              options={DRAFT_BRACKETS}
              className="min-w-[170px]"
            />

            <button
              type="button"
              onClick={handleResetSetup}
              disabled={loading}
              className="h-8 cursor-pointer rounded-md border border-white/[0.07] bg-white/[0.02] px-3 text-[9px] font-medium uppercase tracking-[0.1em] text-white/30 transition hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* SETUP */}
      {!draftData && (
        <section className="relative rounded-lg border border-white/[0.07] bg-[#050505]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

          <div className="border-b border-white/[0.06] px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-red-400" />

                <h2 className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  Team Setup
                </h2>
              </div>

              <span className="text-[8px] text-white/15">
                {
                  draftSetup.players.filter(
                    (player) => player.name || player.position,
                  ).length
                }
                /5 configured
              </span>
            </div>
          </div>

          <div className="p-3">
            {/* PLAYERS */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
              {draftSetup.players.map((player, index) => {
                const pool = getPlayerHeroPool(player);

                return (
                  <div
                    key={player.id}
                    className="relative rounded-md border border-white/[0.06] bg-white/[0.015] p-2.5"
                  >
                    {/* PLAYER TITLE */}
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded border border-white/[0.08] bg-white/[0.025] text-[8px] font-semibold text-white/40">
                          {index + 1}
                        </span>

                        <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-white/40">
                          Player {index + 1}
                        </span>
                      </div>

                      <span className="text-[7px] text-white/15">
                        {pool.length} heroes
                      </span>
                    </div>

                    {/* NAME */}
                    <input
                      type="text"
                      value={player.name}
                      onChange={(event) =>
                        updatePlayerName(player.id, event.target.value)
                      }
                      placeholder={`Player ${index + 1}`}
                      disabled={loading}
                      className="mb-1.5 h-7 w-full rounded border border-white/[0.06] bg-white/[0.02] px-2 text-[9px] text-white outline-none placeholder:text-white/15 focus:border-red-500/30"
                    />

                    {/* POSITION */}
                    <Select
                      value={player.position || ""}
                      onChange={(value) =>
                        updatePlayerPosition(player.id, value)
                      }
                      options={[
                        {
                          value: "",
                          label: "Position",
                        },
                        ...POSITIONS,
                      ]}
                      className="mb-2 w-full"
                    />

                    {/* HERO POOL */}
                    <div className="grid grid-cols-4 min-h-[58px] items-center gap-1.5">
                      {pool.map((item) => (
                        <div
                          key={item.heroId}
                          className="group relative h-[58px] w-[44px] shrink-0"
                        >
                          {/* HERO */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextComfort =
                                item.comfort >= 5 ? 1 : item.comfort + 1;

                              updateHeroComfort(
                                player.id,
                                item.heroId,
                                nextComfort,
                              );
                            }}
                            className="relative block h-full w-full cursor-pointer overflow-hidden rounded border border-white/[0.08] bg-black"
                            title={`Comfort ${item.comfort}/5 — click to change`}
                          >
                            <img
                              src={getHeroAsset(item.hero, "portrait")}
                              alt={item.hero.displayName}
                              className="h-full w-full object-cover transition duration-150 group-hover:scale-[1.04]"
                              loading="lazy"
                            />

                            {/* COMFORT NUMBER */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                              <span className="text-4xl font-bold leading-none tabular-nums text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                {item.comfort}
                              </span>
                            </div>
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleHeroInPool(player.id, item.heroId)
                            }
                            className="absolute -right-1 -top-1 z-20 flex h-4 w-4 cursor-pointer items-center justify-center text-center rounded border border-black/80 bg-black/90 text-white/45 shadow-md transition hover:border-red-500/50 hover:bg-red-500/90 hover:text-white"
                            aria-label={`Remove ${item.hero.displayName}`}
                            title={`Remove ${item.hero.displayName}`}
                          >
                            x
                          </button>
                        </div>
                      ))}

                      {/* ADD HERO */}
                      <button
                        type="button"
                        onClick={() => openPlayerHeroPicker(player.id)}
                        disabled={heroesLoading || loading}
                        className="flex h-[58px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded border border-dashed border-white/[0.1] bg-white/[0.015] text-lg font-light text-white/20 transition hover:border-red-500/30 hover:bg-red-500/[0.04] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Add hero to Player ${index + 1}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="mt-5 text-[7px] uppercase tracking-[0.1em] text-white/10">
                      Hero Pool · Comfort 1–5
                    </div>
                  </div>
                );
              })}
            </div>

            {/* THREATS + ACTION */}
            <div className="mt-3 flex flex-col gap-3 border-t border-white/[0.06] pt-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30">
                    Team Threats
                  </span>

                  <span className="text-[7px] text-white/10">
                    {threatHeroes.length}
                  </span>
                </div>

                <div className="flex min-h-[42px] items-center gap-1.5">
                  {threatHeroes.map((hero) => (
                    <div
                      key={hero.id}
                      className="group relative h-[42px] w-[32px]"
                    >
                      <div className="h-full w-full overflow-hidden rounded border border-red-500/25 bg-black">
                        <img
                          src={getHeroAsset(hero, "portrait")}
                          alt={hero.displayName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleThreat(hero.id)}
                        className="absolute -right-1 -top-1 flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full border border-black bg-red-500/80 text-[8px] text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={openThreatPicker}
                    disabled={heroesLoading || loading}
                    className="flex h-[42px] w-[32px] cursor-pointer items-center justify-center rounded border border-dashed border-white/[0.1] bg-white/[0.015] text-base font-light text-white/20 transition hover:border-red-500/30 hover:bg-red-500/[0.04] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Add team threat"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {(error || heroesError) && (
                  <div className="max-w-[280px] truncate rounded border border-red-500/15 bg-red-500/[0.04] px-2.5 py-1.5 text-[8px] text-red-400/70">
                    {error || heroesError}
                  </div>
                )}

                {heroesLoading && (
                  <span className="text-[8px] uppercase tracking-[0.1em] text-white/20">
                    Loading heroes...
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleStartDraft}
                  disabled={loading || heroesLoading}
                  className={`h-8 rounded-md border px-4 text-[9px] font-semibold uppercase tracking-[0.12em] transition-all ${
                    loading || heroesLoading
                      ? "cursor-not-allowed border-white/[0.07] bg-white/[0.02] text-white/20"
                      : "cursor-pointer border-red-500/30 bg-red-500/[0.08] text-red-400 hover:border-red-500/50 hover:bg-red-500/[0.12]"
                  }`}
                >
                  {loading ? "Loading..." : "Start Draft"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DATASET LOADED / TEMPORARY ENGINE TEST */}
      {draftData && (
        <section className="relative rounded-lg border border-white/[0.07] bg-[#050505]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

          <div className="border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-red-400" />

                  <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    Draft Dataset Loaded
                  </h2>
                </div>

                <p className="mt-1 text-[9px] text-white/20">
                  Bracket: {bracket}
                </p>
              </div>

              <button
                type="button"
                onClick={handleBackToSetup}
                className="cursor-pointer rounded-md border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-white/35 transition hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white/60"
              >
                Back to Setup
              </button>
            </div>
          </div>

          {/* DRAFT BOARD */}
          <div className="border-b border-white/[0.06] px-4 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-red-400" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Draft
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[8px] uppercase tracking-[0.1em] text-white/20">
                    Our Team
                  </span>

                  <button
                    type="button"
                    onClick={() => setTeamSide("DIRE")}
                    className={`cursor-pointer rounded border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] transition ${
                      teamSide === "DIRE"
                        ? "border-red-500/40 bg-red-500/[0.08] text-red-400"
                        : "border-white/[0.07] bg-white/[0.02] text-white/25 hover:text-white/50"
                    }`}
                  >
                    Dire
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeamSide("RADIANT")}
                    className={`cursor-pointer rounded border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] transition ${
                      teamSide === "RADIANT"
                        ? "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400"
                        : "border-white/[0.07] bg-white/[0.02] text-white/25 hover:text-white/50"
                    }`}
                  >
                    Radiant
                  </button>

                  <span className="mx-1 h-4 w-px bg-white/[0.07]" />

                  <span className="text-[8px] uppercase tracking-[0.1em] text-white/20">
                    First Pick
                  </span>

                  <button
                    type="button"
                    onClick={() => setFirstPickSide("OUR")}
                    className={`cursor-pointer rounded border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] transition ${
                      firstPickSide === "OUR"
                        ? "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400"
                        : "border-white/[0.07] bg-white/[0.02] text-white/25 hover:text-white/50"
                    }`}
                  >
                    Our Team
                  </button>

                  <button
                    type="button"
                    onClick={() => setFirstPickSide("ENEMY")}
                    className={`cursor-pointer rounded border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] transition ${
                      firstPickSide === "ENEMY"
                        ? "border-red-500/40 bg-red-500/[0.08] text-red-400"
                        : "border-white/[0.07] bg-white/[0.02] text-white/25 hover:text-white/50"
                    }`}
                  >
                    Enemy
                  </button>
                </div>
              </div>

              <div className="text-[8px] uppercase tracking-[0.12em] text-white/20">
                {draftState.currentActionIndex + 1} / {draftSequence.length}
              </div>
            </div>

            {/* BOARD */}
            <div className="relative">
              {/* SIDE ZONES */}
              <div className="pointer-events-none absolute inset-0 z-0">
                {/* OUR TEAM ZONE */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-emerald-500/[0.075] via-emerald-500/[0.035] to-transparent" />

                {/* ENEMY TEAM ZONE */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-500/[0.075] via-red-500/[0.035] to-transparent" />

                {/* CENTER DIVIDER */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.07]" />

                {/* OUR LABEL */}
                <div className="absolute left-2 top-2">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-emerald-400/50">
                    OUR TEAM
                  </span>
                </div>

                {/* ENEMY LABEL */}
                <div className="absolute bottom-2 left-2">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-red-400/50">
                    ENEMY TEAM
                  </span>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2">
                {draftSequence.map((action) => {
                  const isPick = action.type === "PICK";

                  return (
                    <div
                      key={`line-${action.index}`}
                      className="flex-1 px-[2px]"
                    >
                      <div
                        className={`h-[4px] w-full ${
                          isPick ? "bg-emerald-500/70" : "bg-red-500/70"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* ACTION COLUMNS */}
              <div
                className="relative z-10 grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${draftSequence.length}, minmax(0, 1fr))`,
                }}
              >
                {draftSequence.map((action) => {
                  const key = `${action.side}_${action.type}`;

                  const collection =
                    key === "OUR_PICK"
                      ? draftState.ourPicks
                      : key === "OUR_BAN"
                        ? draftState.ourBans
                        : key === "ENEMY_PICK"
                          ? draftState.enemyPicks
                          : draftState.enemyBans;

                  const entry = collection.find(
                    (item) => Number(item.actionIndex) === Number(action.index),
                  );

                  const hero = entry ? getDraftHero(entry.heroId) : null;

                  const isCurrentAction =
                    Number(action.index) ===
                    Number(draftState.currentActionIndex);

                  const isCompleted = Boolean(entry);

                  const isLocked = !isCurrentAction && !isCompleted;

                  const isOurSide = action.side === "OUR";
                  const isPick = action.type === "PICK";

                  const markerColor = isPick
                    ? "text-emerald-400"
                    : "text-red-400";

                  const borderColor = "border-white/[0.12]";

                  return (
                    <div
                      key={action.index}
                      className="relative h-[190px] min-w-0"
                    >
                      {/* ACTION SLOT */}

                      <button
                        type="button"
                        onClick={() => openDraftActionPicker(action.index)}
                        className="absolute inset-0 w-full cursor-pointer"
                      >
                        {/* HERO */}
                        {hero ? (
                          <div
                            className={`absolute left-1/2 z-20 w-full max-w-[52px] -translate-x-1/2 overflow-hidden rounded border bg-[#050505] ${borderColor} ${
                              isPick
                                ? isOurSide
                                  ? "bottom-[calc(50%+6px)] aspect-[71/94]"
                                  : "top-[calc(50%+6px)] aspect-[71/94]"
                                : isOurSide
                                  ? "bottom-[calc(50%+6px)] aspect-[57/32]"
                                  : "top-[calc(50%+6px)] aspect-[57/32]"
                            }`}
                          >
                            <img
                              src={getHeroAsset(
                                hero,
                                isPick ? "portrait" : "landscape",
                              )}
                              alt={hero.displayName}
                              className={`h-full w-full object-cover ${
                                isPick ? "" : "grayscale opacity-70"
                              }`}
                            />
                          </div>
                        ) : (
                          /* PLACEHOLDER */
                          <div
                            className={`absolute left-1/2 z-20 flex w-full max-w-[52px] -translate-x-1/2 items-center justify-center rounded border border-dashed bg-[#080808] text-white/30 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white/60 ${
                              isPick ? "aspect-[71/94]" : "aspect-[57/32]"
                            } ${
                              isOurSide
                                ? "bottom-[calc(50%+6px)]"
                                : "top-[calc(50%+6px)]"
                            } ${
                              isCurrentAction
                                ? "animate-[draftGlow_1.8s_ease-in-out_infinite]"
                                : ""
                            }`}
                          >
                            <span className="text-lg font-light leading-none">
                              +
                            </span>
                          </div>
                        )}

                        {/* TRIANGLE */}
                        <span
                          className={`absolute left-1/2 z-30 -translate-x-1/2 text-[11px] leading-none ${markerColor} ${
                            isOurSide
                              ? "top-[calc(50%-10px)]"
                              : "top-[calc(50%-1px)]"
                          }`}
                        >
                          {isOurSide ? "▲" : "▼"}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DraftSuggestions
            heroes={heroes}
            draftState={draftState}
            suggestions={draftSuggestions}
          />

          <DraftAnalysis analysis={draftAdvantage} />

          {/* DATASET SUMMARY */}
          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[8px] uppercase tracking-[0.14em] text-white/20">
                Heroes
              </div>

              <div className="mt-1 text-xl font-semibold tabular-nums text-white">
                {draftData.heroes?.size || 0}
              </div>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[8px] uppercase tracking-[0.14em] text-white/20">
                Matchup Relations
              </div>

              <div className="mt-1 text-xl font-semibold tabular-nums text-white">
                {matchupCount}
              </div>
            </div>

            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[8px] uppercase tracking-[0.14em] text-white/20">
                Status
              </div>

              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-400">
                Ready
              </div>
            </div>
          </div>

          {/* SETUP SUMMARY */}
          <div className="border-t border-white/[0.06] p-3">
            <div className="mb-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">
              Draft Setup Loaded
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {draftSetup.players.map((player, index) => (
                <div
                  key={player.id}
                  className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5"
                >
                  <div className="text-[8px] uppercase tracking-[0.1em] text-white/20">
                    Player {index + 1}
                  </div>

                  <div className="mt-1 text-[10px] font-medium text-white/60">
                    {player.name || `Player ${index + 1}`}
                  </div>

                  <div className="mt-1 text-[8px] text-white/20">
                    Position:{" "}
                    {player.position
                      ? `Position ${player.position}`
                      : "Not set"}
                  </div>

                  <div className="mt-1 text-[8px] text-white/20">
                    Hero Pool: {player.heroPool.length}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
              <div className="text-[8px] uppercase tracking-[0.1em] text-white/20">
                Team Threats
              </div>

              <div className="mt-1 text-[10px] font-medium text-white/60">
                {draftSetup.teamThreats.length}
              </div>
            </div>
          </div>

          {/* ENGINE TEST */}
          {testScore && (
            <div className="border-t border-white/[0.06] p-3">
              <div className="mb-2">
                <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/20">
                  Draft Engine Test
                </div>

                <div className="mt-1 text-[9px] text-white/20">
                  Testing Hero ID: {testScore.heroId}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {[
                  ["Comfort", testScore.scores.playerComfort],
                  ["Position", testScore.scores.positionFit],
                  ["Meta", testScore.scores.meta],
                  ["Synergy", testScore.scores.synergy],
                  ["Counter", testScore.scores.counter],
                  ["Threat", testScore.scores.threat],
                  ["Conflict", testScore.scores.conflict],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5"
                  >
                    <div className="text-[8px] uppercase tracking-[0.1em] text-white/20">
                      {label}
                    </div>

                    <div className="mt-1 text-sm font-semibold tabular-nums text-white">
                      {value.toFixed(1)}
                    </div>
                  </div>
                ))}

                <div className="rounded-md border border-red-500/20 bg-red-500/[0.04] p-2.5">
                  <div className="text-[8px] uppercase tracking-[0.1em] text-red-400/50">
                    Final
                  </div>

                  <div className="mt-1 text-sm font-semibold tabular-nums text-red-400">
                    {testScore.finalScore.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* HERO PICKER */}
      <DraftHeroPicker
        open={picker.open}
        heroes={heroes}
        selectedHeroIds={getPickerSelectedIds()}
        title={picker.title}
        onSelect={handlePickerSelect}
        onClose={closePicker}
        disabledHeroIds={
          picker.type === "DRAFT_ACTION" ? getUsedDraftHeroIds() : []
        }
      />
    </div>
  );
}

export default DraftLab;
