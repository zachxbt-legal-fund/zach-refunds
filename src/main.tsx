import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./polyfills";
import { WalletConfig } from "./wallet.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletConfig>
      <App />
    </WalletConfig>
  </React.StrictMode>
);
