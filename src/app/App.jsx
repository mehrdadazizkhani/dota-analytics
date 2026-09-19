import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = "dark";
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
