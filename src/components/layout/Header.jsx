function Header() {
  return (
    <header className="h-16 border-b border-black/10 bg-white dark:border-white/10 dark:bg-black">
      <div className="flex h-full items-center gap-6 px-6">
        {/* Logo */}
        <div className="shrink-0">
          <span className="text-sm font-semibold tracking-wide">
            Dota Analytics
          </span>
        </div>

        {/* Search */}
        <div className="hidden flex-1 md:block">
          <div className="mx-auto max-w-xl">
            <input
              type="text"
              placeholder="Search players, matches, heroes..."
              className="h-9 w-full rounded-md border border-black/10 bg-black/5 px-3 text-sm outline-none transition placeholder:text-black/40 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-white/40 dark:focus:border-white/20"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-xs font-medium transition hover:bg-black/5 dark:hover:bg-white/5"
          >
            Theme
          </button>

          <button
            type="button"
            className="rounded-md px-3 py-2 text-xs font-medium transition hover:bg-black/5 dark:hover:bg-white/5"
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
