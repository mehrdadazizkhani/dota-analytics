import { createBrowserRouter, Outlet } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

import Overview from "../pages/Overview";
import Heroes from "../pages/Heroes";
import HeroDetail from "../pages/HeroDetail";
import Players from "../pages/Players";
import DraftLab from "../pages/DraftLab";
import Meta from "../pages/Meta";

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
        path: "/meta",
        element: <Meta />,
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
        path: "/draft-lab",
        element: <DraftLab />,
      },
    ],
  },
]);

export default router;
