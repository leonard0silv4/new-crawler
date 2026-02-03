import { useState, useEffect } from "react";
import "../app/globals.css";

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import PrivateRoutes from "./utils";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ListFaccionista from "./pages/Faccionista";
import Users from "./pages/Users";
import Sales from "./pages/Sales";
import Config from "./pages/Config/indexV2";
import { Toaster } from "@/components/ui/sonner";
import AccountCreate from "./pages/ManagerUsers";
import UsersPage from "./pages/ManagerUsers/ManageUsers";
import Shopee from "./pages/Shopee";
import Header from "./components/Header";
import MinimalHeader from "./components/Header/MinimalHeader";
// import Job from "./pages/Job/index";
import JobV2 from "./pages/Job/indexV2";
import { ModalProvider } from "./context/ModalContext";
import { NotifyProvider } from "./context/NotifyContext";
import NavUser from "./pages/Job/navUser";
import ProductionForm from "./pages/ControlProd";
import SellerProductsPage from "./pages/AccountsMeli";
import LogsPage from "./pages/Logs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import instance from "./config/axios";
import WelcomePage from "./pages/Welcome/indexV1";
import WelcomePageNew from "./pages/Welcome/";

import Nf from "./pages/Nf";
import { usePermission } from "./hooks/usePermissions";
import Products from "./pages/Products";
import ConfirmLote from "./pages/Job/ConfirmLote";
import PriceAnalyze from "./pages/PriceAnalyze";
import Expedicao from "./pages/Expedicao";
import DashboardExpedicao from "./pages/Expedicao/DashboardExpedicao";
import RelatorioExpedicao from "./pages/Expedicao/RelatorioExpedicao";
import DescarregamentoLotes from "./pages/DescarregamentoLotes";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(window.localStorage !== undefined && localStorage.getItem("userToken"))
  );

  const [roles, setRoles] = useState([]);
  const location = useLocation();
  const { can, isOwner } = usePermission();

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

  const isConfirmRoute = location.pathname.startsWith("/confirm/");

  return (
    <QueryClientProvider client={queryClient}>
      {/* {JSON.stringify(roles)} */}
      <NotifyProvider>
        <ModalProvider>
          <Toaster />
          {!isConfirmRoute && isAuthenticated && enableLinks && (
            <Header handleAuthentication={setIsAuthenticated} />
          )}
          {!isConfirmRoute && isAuthenticated && !enableLinks && (
            <MinimalHeader handleAuthentication={setIsAuthenticated} />
          )}
          <Routes>
            {roles.length > 0 && (
              <Route element={<PrivateRoutes allowedRoles={roles} />}>
                <Route
                  path="/"
                  element={
                    isOwner || can("view_sales") ? (
                      <WelcomePageNew />
                    ) : (
                      <WelcomePage />
                    )
                  }
                />
                <Route path="/v2" element={<WelcomePageNew />} />
                <Route element={<Dashboard />} path="/dashboard" />
                <Route element={<Shopee />} path="/shopee" />
                <Route element={<Sales />} path="/orders" />
                <Route element={<Config />} path="/config" />
                <Route element={<Users />} path="/users" />
                <Route element={<AccountCreate />} path="/account-create" />
                <Route element={<UsersPage />} path="/manage-users" />
                <Route element={<ProductionForm />} path="/control-prod" />
                <Route element={<Nf />} path="/nf" />
                <Route element={<Products />} path="/products-catalog" />
                <Route
                  element={<SellerProductsPage />}
                  path="/account/products"
                />
                <Route element={<LogsPage />} path="/logs" />
                <Route element={<PriceAnalyze />} path="/price-analyze" />
                <Route element={<Expedicao />} path="/expedicao" />
                <Route element={<DashboardExpedicao />} path="/dashboard-expedicao" />
                <Route element={<RelatorioExpedicao />} path="/relatorio-expedicao" />
                <Route
                  path="/descarregamento-lotes"
                  element={
                    can("expedition_discharge") ? (
                      <DescarregamentoLotes />
                    ) : (
                      <Navigate to="/users" replace />
                    )
                  }
                />
                <Route
                  path="/job/:user"
                  element={
                    can("expedition_discharge") ? (
                      <>
                        <JobV2 />
                        <NavUser />
                      </>
                    ) : (
                      <Navigate to="/users" replace />
                    )
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
            {/* Rota desprotegida para confirmação de lote via QR code */}
            <Route
              element={<ConfirmLote />}
              path="/confirm/:idFaccionista/:idLote"
            />
          </Routes>
        </ModalProvider>
      </NotifyProvider>
    </QueryClientProvider>
  );
}

export default App;
