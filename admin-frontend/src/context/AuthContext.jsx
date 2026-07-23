import { createContext, useContext, useEffect, useState } from "react";
import axios from "../services/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("user");

    if (token && role && user) {
      setAdmin({
        token,
        role,
        user: JSON.parse(user),
      });
    }

    setLoading(false);
  }, []);

  // LOGIN FUNCTION
  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(data.admin));

    setAdmin({
      token: data.token,
      role: data.role,
      user: data.admin,
    });
  };

  // LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export default function useAuth() {
  return useContext(AuthContext);
}
