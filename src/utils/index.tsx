import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  let auth = {
    token:
      window.localStorage !== undefined && localStorage.getItem("userToken"),
  };
  return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
