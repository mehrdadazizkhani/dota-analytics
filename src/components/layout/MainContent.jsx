function MainContent({ children }) {
  return (
    <main className="min-w-0 flex-1 bg-white dark:bg-black">
      <div className="mx-auto w-full max-w-[1600px] py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}

export default MainContent;
