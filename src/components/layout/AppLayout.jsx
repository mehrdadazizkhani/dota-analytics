import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

function AppLayout() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Header />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}

export default AppLayout;
