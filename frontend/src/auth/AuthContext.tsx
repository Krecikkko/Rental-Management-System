import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

// Zaktualizowany typ użytkownika
type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

type AuthCtx = {
  token: string | null;
  user: User | null; // Użycie nowego typu
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<AuthCtx["user"]>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      // ustawiamy Authorization na przyszłe requesty
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      api.get("/auth/me").then(res => setUser(res.data)).catch(() => setUser(null));
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    // FastAPI OAuth2PasswordRequestForm wymaga grant_type=password + form-urlencoded
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);
    form.set("grant_type", "password");

    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    setToken(res.data.access_token);
  };

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
