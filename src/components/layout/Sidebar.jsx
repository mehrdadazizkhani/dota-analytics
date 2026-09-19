const navigation = ["Overview", "Heroes", "Players", "Matches", "Analysis"];

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-black/10 bg-white dark:border-white/10 dark:bg-black md:block">
      <nav className="p-4">
        <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
          Analytics
        </div>

        <div className="space-y-1">
          {navigation.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
