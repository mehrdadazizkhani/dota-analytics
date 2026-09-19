import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Overview", path: "/" },
  { label: "Heroes", path: "/heroes" },
  { label: "Players", path: "/players" },
  { label: "Matches", path: "/matches" },
  { label: "Analysis", path: "/analysis" },
];

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-black/10 bg-white dark:border-white/10 dark:bg-black md:block">
      <nav className="p-4">
        <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
          Analytics
        </div>

        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-black/5 font-medium dark:bg-white/5"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
