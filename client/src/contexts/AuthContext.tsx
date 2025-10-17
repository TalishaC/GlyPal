import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: Omit<User, "password"> | null;
  setUser: (user: Omit<User, "password"> | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<Omit<User, "password"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved user
    const savedUser = localStorage.getItem("glypal_user");
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem("glypal_user");
      }
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser: Omit<User, "password"> | null) => {
    if (newUser) {
      localStorage.setItem("glypal_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("glypal_user");
    }
    setUserState(newUser);
  };

  const logout = () => {
    localStorage.removeItem("glypal_user");
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
