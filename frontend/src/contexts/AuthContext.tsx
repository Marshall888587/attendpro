import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "../types";
import * as authService from "../services/auth.service";
import { clearToken, getToken, setToken } from "../services/tokenStorage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .fetchMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string, remember = false) {
    const { token, user: loggedInUser } = await authService.login(email, password);
    setToken(token, remember);
    setUser(loggedInUser);
    return loggedInUser;
  }

  function logout() {
    clearToken();
    setUser(null);
    window.location.href = "/login";
  }

  async function refreshUser() {
    const fresh = await authService.fetchMe();
    setUser(fresh);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
  );
}
