import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Buffer } from "buffer";

import { BrowserRouter } from "react-router-dom";

window.Buffer = window.Buffer ?? Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
