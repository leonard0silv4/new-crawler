import { useState } from "react";
import "../app/globals.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import Config from "./pages/Config";
import { Toaster } from "@/components/ui/sonner";
import AccountCreate from "./pages/AccountCreate";
import Shopee from "./pages/Shopee";
import Header from "./components/Header";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(window.localStorage !== undefined && localStorage.getItem("userToken"))
  );

  return (
    <>
      <Toaster />
      <Router>
        {isAuthenticated && (
          <Header handleAuthentication={setIsAuthenticated} />
        )}

        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<Dashboard />} path="/" />
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<Shopee />} path="/shopee" />
            <Route element={<Sales />} path="/orders" />
            <Route element={<Config />} path="/config" />
          </Route>
          <Route
            element={<Login handleAuthentication={setIsAuthenticated} />}
            path="/login"
          />
          <Route element={<AccountCreate />} path="/account-create" />
        </Routes>
      </Router>
    </>
  );
}

export default App;
