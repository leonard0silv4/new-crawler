import { useState } from "react";
import "../app/globals.css";

import { Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ListFaccionista from "./pages/Faccionista";
import Users from "./pages/Users";
import Sales from "./pages/Sales";
import Config from "./pages/Config";
import { Toaster } from "@/components/ui/sonner";
import AccountCreate from "./pages/AccountCreate";
import Shopee from "./pages/Shopee";
import Header from "./components/Header";
import MinimalHeader from "./components/Header/MinimalHeader";
import Job from "./pages/Job";
import { ModalProvider } from "./context/ModalContext";
import NavUser from "./pages/Job/navUser";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(window.localStorage !== undefined && localStorage.getItem("userToken"))
  );

  const enableLinks =
    isAuthenticated && localStorage.getItem("role") == "owner";

  return (
    <>
      <ModalProvider>
        <Toaster />
        {isAuthenticated && enableLinks && (
          <Header handleAuthentication={setIsAuthenticated} />
        )}
        {isAuthenticated && !enableLinks && (
          <MinimalHeader handleAuthentication={setIsAuthenticated} />
        )}
        <Routes>
          <Route element={<PrivateRoutes allowedRoles={["owner"]} />}>
            <Route element={<Dashboard />} path="/" />
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<Shopee />} path="/shopee" />
            <Route element={<Sales />} path="/orders" />
            <Route element={<Config />} path="/config" />
            <Route element={<Users />} path="/users" />
            <Route
              path="/job/:user"
              element={
                <>
                  <Job />
                  <NavUser />
                </>
              }
            />
          </Route>

          {/* Acesso ao ListFaccionista é restrito a faccionistas */}
          <Route element={<PrivateRoutes allowedRoles={["faccionista"]} />}>
            <Route path="/list-faccionist" element={<ListFaccionista />} />
          </Route>

          <Route
            element={<Login handleAuthentication={setIsAuthenticated} />}
            path="/login"
          />
          <Route element={<AccountCreate />} path="/account-create" />
        </Routes>
      </ModalProvider>
    </>
  );
}

export default App;
