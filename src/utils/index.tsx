import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = ({ allowedRoles }: any) => {
  const auth = {
    role: window.localStorage?.getItem("role"),
    token: window.localStorage?.getItem("userToken"),
  };

  if (!auth.token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return (
      <Navigate to={auth.role == "faccionista" ? "/list-faccionist" : "/"} />
    );
  }

  return <Outlet />;
};

export default PrivateRoutes;
