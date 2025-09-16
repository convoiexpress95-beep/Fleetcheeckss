import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Indicateur bundle micro-app ClearTrip
(window as any).__BUNDLE_ID__ = 'clear-trip';

createRoot(document.getElementById("root")!).render(<App />);
