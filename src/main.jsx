import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App.jsx";
import { Analytics } from "@vercel/analytics/react"
import { ContextVariablesProvider } from "./context/ContextVariables.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
  <StrictMode>
    <ContextVariablesProvider>
      <AuthContextProvider>
        <Analytics />
        <App />
      </AuthContextProvider>
    </ContextVariablesProvider>
  </StrictMode>
  );
}
window.Buffer = Buffer;
