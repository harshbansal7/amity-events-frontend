import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid, logout as apiLogout } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isTokenValid());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial auth check
    setIsAuthenticated(isTokenValid());
    setIsLoading(false);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiLogout(); // This clears the token
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
