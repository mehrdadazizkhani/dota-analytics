import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

function AppLayout({ children }) {
  return (
    <div className="container mx-auto min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Header />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}

export default AppLayout;
