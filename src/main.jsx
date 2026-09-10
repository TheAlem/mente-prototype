import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MentePrototype from "../components/MentePrototype";
import "../app/globals.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MentePrototype />
  </StrictMode>,
);
