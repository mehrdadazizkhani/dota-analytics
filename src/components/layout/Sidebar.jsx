import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Overview", path: "/" },
  { label: "Heroes", path: "/heroes" },
  { label: "Players", path: "/players" },
  { label: "Draft Lab", path: "/draft-lab" },
];

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/[0.07] bg-[#050505] md:block">
      <div className="flex h-full flex-col">
        <nav className="px-3 py-5">
          <div className="mb-3 flex items-center gap-2 px-3">
            <span className="h-1 w-1 rounded-full bg-red-400" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
              Analytics
            </span>
          </div>

          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-md px-3 py-2.5 text-[11px] font-medium transition-all duration-150 ${
                    isActive
                      ? "border border-red-500/15 bg-red-500/[0.06] text-white"
                      : "border border-transparent text-white/35 hover:border-white/[0.06] hover:bg-white/[0.025] hover:text-white/70"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-red-400" />
                    )}

                    <span className="flex-1">{item.label}</span>

                    {isActive && (
                      <span className="h-1 w-1 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-auto px-4 pb-5">
          <div className="border-t border-white/[0.06] pt-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[8px] uppercase tracking-[0.18em] text-white/20">
                Dota Scope
              </span>

              <span className="text-[8px] tabular-nums text-white/15">
                v1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
