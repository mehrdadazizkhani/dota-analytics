import { useEffect, useState } from "react";

import AgainstGraph from "../components/against/AgainstGraph";

import { getDraftData, getHeroes } from "../lib/api/stratz";

import { buildDraftDataset } from "../lib/draft/draftData";

export default function Against() {
  const [mode, setMode] = useState("AGAINST");

  const [heroes, setHeroes] = useState([]);

  const [dataset, setDataset] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [heroData, draftData] = await Promise.all([
          getHeroes(),
          getDraftData("DIVINE_IMMORTAL"),
        ]);

        if (cancelled) {
          return;
        }

        const normalizedDataset = buildDraftDataset(draftData);

        const heroMap = new Map(
          heroData.map((hero) => [Number(hero.id), hero]),
        );

        const graphHeroes = [];

        for (const hero of normalizedDataset.heroes.values()) {
          const metadata = heroMap.get(Number(hero.heroId));

          if (!metadata) {
            continue;
          }

          graphHeroes.push({
            ...hero,
            ...metadata,
            heroId: Number(hero.heroId),
          });
        }

        const graphDataset = {
          ...normalizedDataset,

          heroes: new Map(graphHeroes.map((hero) => [hero.heroId, hero])),
        };

        setHeroes(graphHeroes);

        setDataset(graphDataset);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(err?.message || "Failed to load hero matchup data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#08090b] text-sm text-zinc-500">
        Loading hero relationships...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#08090b] text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="flex h-full items-center justify-center bg-[#08090b] text-sm text-zinc-500">
        No graph data available.
      </div>
    );
  }

  const graphNodes = heroes;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#08090b]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">
            Hero Relationships
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            Explore hero synergy and matchup relationships.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.025] p-1">
          {["WITH", "AGAINST"].map((option) => {
            const active = mode === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={[
                  "rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition",
                  active
                    ? "bg-white/[0.1] text-white"
                    : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Graph */}
      <div className="relative min-h-0 flex-1">
        <AgainstGraph nodes={graphNodes} dataset={dataset} mode={mode} />
      </div>
    </div>
  );
}
