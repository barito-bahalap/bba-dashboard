import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Style
import "@barito-bahalap/styles";
import "./styles/theme.css";
import "./styles/app.css";
// App
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
