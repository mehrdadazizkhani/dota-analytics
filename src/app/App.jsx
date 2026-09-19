import { useTheme } from "../hooks/useTheme";
import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  useTheme();

  return <RouterProvider router={router} />;
}

export default App;
