import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Buffer } from "buffer";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";

window.Buffer = window.Buffer ?? Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
