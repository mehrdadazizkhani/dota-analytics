import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const navigation = [
  {
    label: "Overview",
    path: "/",
  },
  {
    label: "Heroes",
    path: "/heroes",
    children: [
      {
        label: "Heroes",
        path: "/heroes",
      },
      {
        label: "Meta",
        path: "/meta",
      },
    ],
  },
  {
    label: "Players",
    path: "/players",
  },
  {
    label: "Draft Lab",
    path: "/draft-lab",
  },
];

function Sidebar() {
  const location = useLocation();

  const heroesSectionActive =
    location.pathname === "/heroes" ||
    location.pathname.startsWith("/heroes/") ||
    location.pathname === "/meta";

  const [openSections, setOpenSections] = useState({
    Heroes: heroesSectionActive,
  });

  useEffect(() => {
    if (heroesSectionActive) {
      setOpenSections((current) => ({
        ...current,
        Heroes: true,
      }));
    }
  }, [heroesSectionActive]);

  const toggleSection = (label) => {
    setOpenSections((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

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
            {navigation.map((item) => {
              const hasChildren = item.children?.length > 0;

              if (!hasChildren) {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `group relative flex items-center rounded-md border px-3 py-2.5 text-[11px] font-medium transition-all duration-150 ${
                        isActive
                          ? "border-red-500/15 bg-red-500/[0.06] text-white"
                          : "border-transparent text-white/35 hover:border-white/[0.06] hover:bg-white/[0.025] hover:text-white/70"
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
                );
              }

              const isOpen = openSections[item.label];

              return (
                <div key={item.path}>
                  <button
                    type="button"
                    onClick={() => toggleSection(item.label)}
                    className={`group relative cursor-pointer flex w-full items-center rounded-md border px-3 py-2.5 text-[11px] font-medium transition-all duration-150 ${
                      heroesSectionActive
                        ? "border-red-500/15 bg-red-500/[0.06] text-white"
                        : "border-transparent text-white/35 hover:border-white/[0.06] hover:bg-white/[0.025] hover:text-white/70"
                    }`}
                  >
                    {heroesSectionActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-red-400" />
                    )}

                    <span className="flex-1 text-left">{item.label}</span>

                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className={`h-3 w-3 shrink-0 text-white/25 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-3 mt-1 space-y-0.5 border-l border-white/[0.06] pl-2">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            end={child.path === "/heroes"}
                            className={({ isActive }) =>
                              `group flex items-center rounded-md px-3 py-2 text-[10px] font-medium transition-all duration-150 ${
                                isActive
                                  ? "bg-white/[0.045] text-white"
                                  : "text-white/30 hover:bg-white/[0.025] hover:text-white/65"
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <span className="flex-1">{child.label}</span>

                                {isActive && (
                                  <span className="h-1 w-1 rounded-full bg-red-400 shadow-[0_0_7px_rgba(248,113,113,0.65)]" />
                                )}
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
