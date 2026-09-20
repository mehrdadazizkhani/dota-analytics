import { Navigate, useParams } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { usePlayerOverview } from "../hooks/usePlayerOverview";
import { usePlayerMatches } from "../hooks/usePlayerMatches";

import PlayerHeader from "../components/players/PlayerHeader";
import PlayerOverview from "../components/players/PlayerOverview";
import PlayerHeroPerformance from "../components/players/PlayerHeroPerformance";
import PlayerRecentMatches from "../components/players/PlayerRecentMatches";

function Players() {
  const { accountId: routeAccountId } = useParams();

  const {
    accountId: ownAccountId,
    authenticated,
    loading: authLoading,
  } = useAuth();

  if (authLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Players
        </h1>

        <p className="mt-1 text-sm text-white/50">Loading player data...</p>
      </div>
    );
  }

  if (!routeAccountId) {
    if (authenticated && ownAccountId) {
      return <Navigate to={`/players/${ownAccountId}`} replace />;
    }

    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Players
        </h1>

        <p className="mt-1 text-sm text-white/50">
          Sign in with Steam or open a player profile by account ID.
        </p>
      </div>
    );
  }

  const accountId = routeAccountId;

  return <PlayerProfile accountId={accountId} />;
}

function PlayerProfile({ accountId }) {
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
  } = usePlayerMatches(accountId);

  if (playerLoading || overviewLoading || matchesLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Player
        </h1>

        <p className="mt-1 text-sm text-white/50">Loading player data...</p>
      </div>
    );
  }

  if (playerError || overviewError || matchesError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Player
        </h1>

        <p className="mt-1 text-sm text-red-400">
          {playerError ||
            overviewError ||
            matchesError ||
            "Failed to load player data."}
        </p>
      </div>
    );
  }

  if (!player) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Private Profile
        </h1>

        <p className="mt-1 text-sm text-white/50">
          This player's profile is private or unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Player
        </h1>

        <p className="mt-1 text-sm text-white/50">
          Player profile and Dota 2 analytics.
        </p>
      </div>

      <PlayerHeader player={player} />

      <PlayerOverview overview={overview} />

      <PlayerHeroPerformance heroes={overview?.heroesPerformance} />

      <PlayerRecentMatches matches={matches} />
    </div>
  );
}

export default Players;
