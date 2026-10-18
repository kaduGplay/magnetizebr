import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadAllAssets } from "./lib/preload-assets";

createRoot(document.getElementById("root")!).render(<App />);
preloadAllAssets();
