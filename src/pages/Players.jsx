import { Navigate, useParams } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { usePlayerOverview } from "../hooks/usePlayerOverview";
import { usePlayerMatches } from "../hooks/usePlayerMatches";

import PlayerFilters from "../components/players/PlayerFilters";
import PlayerHeader from "../components/players/PlayerHeader";
import PlayerOverview from "../components/players/PlayerOverview";
import PlayerHeroPerformance from "../components/players/PlayerHeroPerformance";
import PlayerRecentMatches from "../components/players/PlayerRecentMatches";
import { useHeroes } from "../hooks/useHeroes";

function Players() {
  const { accountId: routeAccountId } = useParams();

  const {
    accountId: ownAccountId,
    authenticated,
    loading: authLoading,
  } = useAuth();

  if (authLoading) {
    return <div>Loading player data...</div>;
  }

  if (!routeAccountId) {
    if (authenticated && ownAccountId) {
      return <Navigate to={`/players/${ownAccountId}`} replace />;
    }

    return (
      <div>
        <h1 className="text-2xl font-semibold text-white">Players</h1>

        <p className="mt-1 text-sm text-white/50">
          Sign in with Steam or open a player profile by account ID.
        </p>
      </div>
    );
  }

  return <PlayerProfile accountId={routeAccountId} />;
}

function PlayerProfile({ accountId }) {
  const [filters, setFilters] = useState({
    limit: "25",

    positionIds: [],
    heroIds: [],

    time: "ALL",

    mode: "ALL",

    rankedOnly: true,
  });

  const { heroes, loading: heroesLoading, error: heroesError } = useHeroes();

  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayer(accountId);

  const {
    overview,
    loading: overviewLoading,
    error: overviewError,
  } = usePlayerOverview(accountId);

  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
  } = usePlayerMatches(accountId, filters);

  if (playerLoading || overviewLoading || matchesLoading) {
    return <div>Loading player data...</div>;
  }

  if (playerError || overviewError || matchesError) {
    return (
      <div className="text-red-400">
        {playerError ||
          overviewError ||
          matchesError ||
          "Failed to load player data."}
      </div>
    );
  }

  if (!player) {
    return (
      <div>
        <h1 className="text-2xl text-white">Private Profile</h1>

        <p className="text-white/50">
          This player's profile is private or unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Player</h1>

        <p className="mt-1 text-sm text-white/50">
          Player profile and Dota 2 analytics.
        </p>
      </div>

      <PlayerHeader player={player} />

      <PlayerFilters
        filters={filters}
        setFilters={setFilters}
        heroes={heroes}
      />

      <PlayerOverview overview={overview} />

      <PlayerHeroPerformance heroes={overview?.heroesPerformance} />

      <PlayerRecentMatches matches={matches.slice(0, Number(filters.limit))} />
    </div>
  );
}

export default Players;
