import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import { ConfirmProvider } from "./components/confirm";
import { I18nProvider } from "./lib/i18n/context";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontro el nodo root.");
}

/* La misma analitica que la landing, para poder ver el recorrido entero: cuanta gente
   llega a la pagina publica y cuanta acaba entrando en el producto. Va fuera de los
   proveedores porque no consume ninguno de sus contextos, y no pinta nada. */
createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </I18nProvider>
    <Analytics />
  </StrictMode>,
);
