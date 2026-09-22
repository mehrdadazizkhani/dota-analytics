import { useAuth } from "../../hooks/useAuth";

function Header() {
  const {
    loading: authLoading,
    authenticated,
    accountId,
    profile,
    logout,
  } = useAuth();

  return (
    <header className="relative h-[68px] border-b border-white/[0.08] bg-[#050505]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

      <div className="flex h-full items-center px-5 lg:px-7">
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-red-500/30 bg-red-500/[0.06]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(239,68,68,0.12)_45%,rgba(239,68,68,0.12)_55%,transparent_55%)]" />

            <span className="relative text-[11px] font-black tracking-tight text-red-400">
              DA
            </span>
          </div>

          <div className="hidden sm:block">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-white">
              DOTA ANALYTICS
            </div>

            <div className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.2em] text-white/25">
              Competitive Intelligence
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="hidden flex-1 px-8 md:block lg:px-16">
          <div className="mx-auto max-w-2xl">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-white/25 transition group-focus-within:text-red-400/70"
                >
                  <path
                    d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Search players, matches, heroes..."
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-10 pr-16 text-[12px] text-white outline-none transition duration-200 placeholder:text-white/20 hover:border-white/[0.13] hover:bg-white/[0.035] focus:border-red-500/30 focus:bg-white/[0.045] focus:shadow-[0_0_24px_rgba(239,68,68,0.05)]"
              />

              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-medium text-white/20">
                  /
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="ml-auto flex items-center">
          {authLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.025]" />
          ) : authenticated ? (
            <div className="flex items-center gap-2">
              {/* Player */}
              <div className="group flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 transition hover:border-white/[0.12] hover:bg-white/[0.04]">
                <div className="relative">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name || "Steam profile"}
                      className="h-8 w-8 rounded-md border border-white/[0.12] object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.04]" />
                  )}

                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#050505] bg-emerald-400" />
                </div>

                <div className="hidden min-w-0 sm:block">
                  <div className="max-w-[120px] truncate text-[11px] font-semibold text-white">
                    {profile?.name || "Dota Account"}
                  </div>

                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[8px] uppercase tracking-[0.12em] text-white/25">
                      ID
                    </span>

                    <span className="text-[9px] tabular-nums text-white/35">
                      {accountId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                title="Logout"
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-white/25 transition hover:border-red-500/25 hover:bg-red-500/[0.06] hover:text-red-400"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M10 4H5.8A1.8 1.8 0 0 0 4 5.8v12.4A1.8 1.8 0 0 0 5.8 20H10M14 8l4 4-4 4m4-4H9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/steam"
              className="group flex h-10 items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.025] px-3.5 text-[11px] font-semibold text-white/60 transition hover:border-red-500/30 hover:bg-red-500/[0.06] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-white/35 transition group-hover:text-red-400"
              >
                <path
                  d="M12 21a9 9 0 1 0-8.45-5.9l4.15 1.72a2.8 2.8 0 1 0 1.1-2.04l-2.1-.87A5.2 5.2 0 1 1 12 17.2c-.73 0-1.42-.15-2.05-.42"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span>LOGIN WITH STEAM</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
