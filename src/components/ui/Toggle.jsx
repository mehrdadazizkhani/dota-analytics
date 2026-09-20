function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#11141b] px-4 py-2.5 transition hover:border-white/20"
    >
      <div className="flex flex-col text-left">
        <span className="text-sm text-white/80">{label}</span>

        {description && (
          <span className="mt-0.5 text-xs text-white/30">{description}</span>
        )}
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 ${
          checked
            ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.35)]"
            : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}

export default Toggle;
