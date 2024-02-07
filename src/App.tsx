import "../app/globals.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import { Toaster } from "@/components/ui/sonner";
import AccountCreate from "./pages/AccountCreate";

function App() {
  return (
    <>
      <Toaster />
      <Router>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<Dashboard />} path="/" />
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<Sales />} path="/pedidos" />
          </Route>
          <Route element={<Login />} path="/login" />
          <Route element={<AccountCreate />} path="/accountCreate" />
        </Routes>
      </Router>
    </>
  );
}

export default App;
