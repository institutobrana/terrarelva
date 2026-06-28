import type { PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";

import { fetchCurrentUser, loginRequest, type AuthUser } from "@/services/auth/authApi";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/services/auth/authStorage";

type AuthContextValue = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    fetchCurrentUser(token)
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  async function login(email: string, password: string) {
    const session = await loginRequest(email, password);
    setStoredToken(session.token);
    setUser(session.user);
  }

  function logout() {
    clearStoredToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        isBootstrapping,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
