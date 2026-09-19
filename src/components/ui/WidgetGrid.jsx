function WidgetGrid({ children, className = "" }) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${className}`}
    >
      {children}
    </div>
  );
}

export default WidgetGrid;
