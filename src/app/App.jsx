import { useTheme } from "../hooks/useTheme";
import AppLayout from "../components/layout/AppLayout";

function App() {
  useTheme();

  return <AppLayout />;
}

export default App;
