function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-white/[0.07] bg-white/[0.025] px-3 py-2 transition-all duration-150 hover:border-white/[0.13] hover:bg-white/[0.04]"
    >
      <div className="flex min-w-0 flex-col text-left">
        <span className="text-[11px] font-medium text-white/55">{label}</span>

        {description && (
          <span className="mt-0.5 text-[9px] text-white/20">{description}</span>
        )}
      </div>

      <div
        className={`relative h-4 w-7 shrink-0 rounded-full transition-all duration-150 ${
          checked
            ? "bg-red-400/80 shadow-[0_0_10px_rgba(248,113,113,0.2)]"
            : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all duration-150 ${
            checked ? "left-3.5" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}

export default Toggle;
