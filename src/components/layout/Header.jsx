function Header() {
  return (
    <header className="h-16 border-b border-white/10 bg-black">
      <div className="flex h-full items-center gap-6 px-6">
        {/* Logo */}
        <div className="shrink-0">
          <span className="text-sm font-semibold tracking-wide text-white">
            Dota Analytics
          </span>
        </div>

        {/* Search */}
        <div className="hidden flex-1 md:block">
          <div className="mx-auto max-w-xl">
            <input
              type="text"
              placeholder="Search players, matches, heroes..."
              className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.05]"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3">
          <a
            href="/api/auth/steam"
            className="cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            Login with Steam
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
