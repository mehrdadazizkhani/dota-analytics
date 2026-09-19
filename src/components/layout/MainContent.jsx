function MainContent() {
  return (
    <main className="min-w-0 flex-1 bg-white dark:bg-black">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>

          <p className="mt-1 text-sm text-black/50 dark:text-white/50">
            Dota 2 competitive analytics and statistics.
          </p>
        </div>

        <div className="rounded-lg border border-black/10 p-6 dark:border-white/10">
          Main Content
        </div>
      </div>
    </main>
  );
}

export default MainContent;
