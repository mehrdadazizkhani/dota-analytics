function Widget({ title, children, className = "" }) {
  return (
    <section
      className={`relative rounded-lg border border-white/[0.07] bg-[#050505] ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-lg bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      {title && (
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
            {title}
          </h2>
        </div>
      )}

      <div className="p-4">{children}</div>
    </section>
  );
}

export default Widget;
