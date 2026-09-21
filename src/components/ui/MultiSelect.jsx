import { useEffect, useRef, useState } from "react";

function MultiSelect({
  value = [],
  onChange,
  options = [],
  searchable = false,
  placeholder = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useRef(null);

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

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

  function toggleOption(option) {
    if (value.includes(option.value)) {
      onChange(value.filter((item) => item !== option.value));
    } else {
      onChange([...value, option.value]);
    }
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-w-[180px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#11141b] px-4 py-2.5 text-sm text-white/80 transition hover:border-white/20"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOptions.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            <span className="truncate">{selectedOptions.length} selected</span>
          )}
        </div>

        <svg
          className={`h-4 w-4 text-white/40 transition ${
            open ? "rotate-180" : ""
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
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#11141b] p-1 shadow-2xl shadow-black/40">
          {searchable && (
            <div className="p-1">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
          )}

          {selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-white/[0.05]"
            >
              Clear selection
            </button>
          )}

          <div className="max-h-72 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  value.includes(option.value)
                    ? "bg-white/[0.08] text-white"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon && (
                    <span className="flex h-4 w-4 items-center justify-center">
                      {option.icon}
                    </span>
                  )}

                  <span>{option.label}</span>
                </div>

                {value.includes(option.value) && (
                  <svg
                    className="h-4 w-4 text-emerald-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 011.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
