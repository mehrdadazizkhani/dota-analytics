function Widget({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-black ${className}`}
    >
      {title && (
        <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
      )}

      <div className="p-4">{children}</div>
    </section>
  );
}

export default Widget;
