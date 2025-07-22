import { createContext, useEffect, useState } from "react";

export interface AuthContextProps {
  token: string | null;
  role: string | null;
  permissions: string[];
  login: (
    token: AuthContextProps["token"],
    role: AuthContextProps["role"],
    permissions: AuthContextProps["permissions"]
  ) => void;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    const storedRole = localStorage.getItem("role");
    const storedPermissions = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );

    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      setPermissions(storedPermissions);
    }
  }, []);

  const login = (
    token: AuthContextProps["token"],
    role: AuthContextProps["role"],
    permissions: AuthContextProps["permissions"]
  ) => {
    setToken(token);
    setRole(role);
    setPermissions(permissions);

    localStorage.setItem("userToken", token ?? "");
    localStorage.setItem("role", role ?? "");
    localStorage.setItem("permissions", JSON.stringify(permissions));
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setPermissions([]);

    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");

    console.log("logout chamado");
  };

  return (
    <AuthContext.Provider value={{ token, role, permissions, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
