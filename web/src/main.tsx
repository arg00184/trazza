import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ConfirmProvider } from "./components/confirm";
import { I18nProvider } from "./lib/i18n/context";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontro el nodo root.");
}

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </I18nProvider>
  </StrictMode>,
);
