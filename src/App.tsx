import "../app/globals.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import { Toaster } from "@/components/ui/sonner";
import AccountCreate from "./pages/AccountCreate";
import Shopee from "./pages/Shopee";

function App() {
  return (
    <>
      <Toaster />
      <Router>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<Dashboard />} path="/" />
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<Shopee />} path="/shopee" />
            <Route element={<Sales />} path="/orders" />
          </Route>
          <Route element={<Login />} path="/login" />
          <Route element={<AccountCreate />} path="/account-create" />
        </Routes>
      </Router>
    </>
  );
}

export default App;
