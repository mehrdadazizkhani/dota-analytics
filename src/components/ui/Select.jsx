import { useEffect, useRef, useState } from "react";

function Select({
  value,
  onChange,
  options = [],
  searchable = false,
  placeholder = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useRef(null);

  const selected =
    options.find((option) => option.value === value) || options[0];

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(option) {
    onChange(option.value);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex min-w-[150px] cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 text-[11px] font-medium transition-all duration-150 ${
          open
            ? "border-red-500/25 bg-red-500/[0.05] text-white"
            : "border-white/[0.07] bg-white/[0.025] text-white/45 hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white/70"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {selected?.icon && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-white/45">
              {selected.icon}
            </span>
          )}

          <span className="truncate">{selected?.label || placeholder}</span>
        </div>

        <svg
          className={`h-3.5 w-3.5 shrink-0 text-white/25 transition-transform duration-150 ${
            open ? "rotate-180 text-red-400/70" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a1.04 1.04 0 011.08 1.04l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[190px] overflow-hidden rounded-md border border-white/[0.08] bg-[#080808] shadow-[0_18px_50px_rgba(0,0,0,0.6)]">
          {searchable && (
            <div className="border-b border-white/[0.06] p-2">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20"
                >
                  <path
                    d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hero..."
                  className="h-8 w-full rounded border border-white/[0.07] bg-white/[0.025] pl-8 pr-2 text-[11px] text-white outline-none transition placeholder:text-white/20 focus:border-red-500/20 focus:bg-white/[0.04]"
                />
              </div>
            </div>
          )}

          <div className="max-h-72 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selectedOption = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded px-2.5 py-2 text-left transition-all duration-100 ${
                      selectedOption
                        ? "bg-red-500/[0.07] text-white"
                        : "text-white/45 hover:bg-white/[0.035] hover:text-white/80"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {option.icon && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm text-white/45">
                          {option.icon}
                        </span>
                      )}

                      <span className="truncate text-[11px]">
                        {option.label}
                      </span>
                    </div>

                    {selectedOption && (
                      <span className="ml-3 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm bg-red-400/90">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-2.5 w-2.5 text-black"
                        >
                          <path
                            d="m4.5 10 3.5 3.5 7.5-7.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-5 text-center text-[10px] uppercase tracking-[0.12em] text-white/20">
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Select;
