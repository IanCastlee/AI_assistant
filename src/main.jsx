import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DarkmodeProvider } from "../context/Darkmode.jsx";

createRoot(document.getElementById("root")).render(
  <DarkmodeProvider>
    <App />
  </DarkmodeProvider>
);
