import { createBrowserRouter, Outlet } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

import Overview from "../pages/Overview";
import Heroes from "../pages/Heroes";
import HeroDetail from "../pages/HeroDetail";
import Players from "../pages/Players";
import Matches from "../pages/Matches";
import Analysis from "../pages/Analysis";

function Layout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Overview />,
      },
      {
        path: "/heroes",
        element: <Heroes />,
      },
      {
        path: "/heroes/:heroId",
        element: <HeroDetail />,
      },
      {
        path: "/players",
        element: <Players />,
      },
      {
        path: "/players/:accountId",
        element: <Players />,
      },
      {
        path: "/matches",
        element: <Matches />,
      },
      {
        path: "/analysis",
        element: <Analysis />,
      },
    ],
  },
]);

export default router;
