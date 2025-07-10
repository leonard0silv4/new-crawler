import { useState, useEffect } from "react";
import "../app/globals.css";

import { Routes, Route, useLocation } from "react-router-dom";
import PrivateRoutes from "./utils";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ListFaccionista from "./pages/Faccionista";
import Users from "./pages/Users";
import Sales from "./pages/Sales";
import Config from "./pages/Config";
import { Toaster } from "@/components/ui/sonner";
import AccountCreate from "./pages/ManagerUsers";
import UsersPage from "./pages/ManagerUsers/ManageUsers";
import Shopee from "./pages/Shopee";
import Header from "./components/Header";
import MinimalHeader from "./components/Header/MinimalHeader";
import Job from "./pages/Job";
import { ModalProvider } from "./context/ModalContext";
import { NotifyProvider } from "./context/NotifyContext";
import NavUser from "./pages/Job/navUser";
import ProductionForm from "./pages/ControlProd";
import SellerProductsPage from "./pages/AccountsMeli";
import LogsPage from "./pages/Logs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import instance from "./config/axios";
import WelcomePage from "./pages/Welcome";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(window.localStorage !== undefined && localStorage.getItem("userToken"))
  );

  const [roles, setRoles] = useState([]);
  const location = useLocation();

  useEffect(() => {
    instance.get("/roles").then((res: any) => {
      const roleNames = res
        .map((role: any) => role.name)
        .filter((r: any) => r !== "faccionista");
      setRoles(roleNames);
    });
  }, [location]);

  const enableLinks =
    isAuthenticated && localStorage.getItem("role") != "faccionista";

  return (
    <QueryClientProvider client={queryClient}>
      {/* {JSON.stringify(roles)} */}
      <NotifyProvider>
        <ModalProvider>
          <Toaster />
          {isAuthenticated && enableLinks && (
            <Header handleAuthentication={setIsAuthenticated} />
          )}
          {isAuthenticated && !enableLinks && (
            <MinimalHeader handleAuthentication={setIsAuthenticated} />
          )}
          <Routes>
            {roles.length > 0 && (
              <Route element={<PrivateRoutes allowedRoles={roles} />}>
                <Route path="/" element={<WelcomePage />} />
                <Route element={<Dashboard />} path="/dashboard" />
                <Route element={<Shopee />} path="/shopee" />
                <Route element={<Sales />} path="/orders" />
                <Route element={<Config />} path="/config" />
                <Route element={<Users />} path="/users" />
                <Route element={<AccountCreate />} path="/account-create" />
                <Route element={<UsersPage />} path="/manage-users" />
                <Route element={<ProductionForm />} path="/control-prod" />
                <Route
                  element={<SellerProductsPage />}
                  path="/account/products"
                />
                <Route element={<LogsPage />} path="/logs" />
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
            )}

            {/* Acesso ao ListFaccionista é restrito a faccionistas */}
            <Route element={<PrivateRoutes allowedRoles={["faccionista"]} />}>
              <Route path="/list-faccionist" element={<ListFaccionista />} />
            </Route>

            <Route
              element={<Login handleAuthentication={setIsAuthenticated} />}
              path="/login"
            />
          </Routes>
        </ModalProvider>
      </NotifyProvider>
    </QueryClientProvider>
  );
}

export default App;
