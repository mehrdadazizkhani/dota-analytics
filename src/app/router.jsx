import { createBrowserRouter, Outlet } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

function Page({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}

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
        element: <Page title="Overview" />,
      },
      {
        path: "/heroes",
        element: <Page title="Heroes" />,
      },
      {
        path: "/players",
        element: <Page title="Players" />,
      },
      {
        path: "/matches",
        element: <Page title="Matches" />,
      },
      {
        path: "/analysis",
        element: <Page title="Analysis" />,
      },
    ],
  },
]);

export default router;
