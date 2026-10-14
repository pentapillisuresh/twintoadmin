import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  adminLogin,
  getMe,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem("twinto_admin_token");
      const savedUser = localStorage.getItem("twinto_admin_user");

      if (!token) {
        if (active) setLoading(false);
        return;
      }

      // Show saved user while verifying the session.
      if (savedUser) {
        try {
          if (active) setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("twinto_admin_user");
        }
      }

      try {
        const response = await getMe();

        if (!active) return;

        // Supports common API response shapes.
        const currentUser =
          response.data?.data?.user ??
          response.data?.data ??
          response.data?.user;

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem(
            "twinto_admin_user",
            JSON.stringify(currentUser)
          );
        }
      } catch (error) {
        if (!active) return;

        // Only clear the session when the server rejects it.
        if (error.response?.status === 401) {
          localStorage.removeItem("twinto_admin_token");
          localStorage.removeItem("twinto_admin_user");
          setUser(null);
        } else if (!savedUser) {
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const response = await adminLogin(email, password);

    const result = response.data;

    const token =
      result?.data?.token ??
      result?.token;

    const loggedInUser =
      result?.data?.user ??
      result?.user;

    if (!result?.success || !token || !loggedInUser) {
      throw new Error(
        result?.message || "Invalid login response from server"
      );
    }

    localStorage.setItem("twinto_admin_token", token);
    localStorage.setItem(
      "twinto_admin_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return loggedInUser;
  }

  function logout() {
    localStorage.removeItem("twinto_admin_token");
    localStorage.removeItem("twinto_admin_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}