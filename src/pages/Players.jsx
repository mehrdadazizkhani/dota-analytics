import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";

function Players() {
  const { accountId, authenticated, loading: authLoading } = useAuth();

  const { player, loading: playerLoading, error } = usePlayer(accountId);

  if (authLoading || playerLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Players</h1>

        <p className="mt-1 text-sm text-white/50">Loading player data...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Players</h1>

        <p className="mt-1 text-sm text-white/50">
          Sign in with Steam to view your player profile.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Players</h1>

        <p className="mt-1 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Players</h1>

      <pre className="mt-6 overflow-auto rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/70">
        {JSON.stringify(player, null, 2)}
      </pre>
    </div>
  );
}

export default Players;
