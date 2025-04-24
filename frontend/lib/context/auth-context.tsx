"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import auth from "@/lib/api/auth";
import type { Employe, SessionUtilisateur } from "@/lib/api/types";

interface AuthContextType {
  user: Omit<Employe, "password"> | null;
  session: SessionUtilisateur | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Omit<Employe, "password"> | null>(null);
  const [session, setSession] = useState<SessionUtilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await auth.getProfile();
          setUser(userData);
          // Récupérer la session si nécessaire
          const sessionResponse = await auth.refreshToken();
          if (sessionResponse.data?.session) {
            setSession(sessionResponse.data.session);
          }
        }
      } catch (error) {
        console.error("Erreur de session:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login({ email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        if (response.data.session) {
          setSession(response.data.session);
        }
        router.push("/dashboard");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      setSession(null);
      router.push("/login");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const response = await auth.refreshToken();
      if (response.data?.session) {
        setSession(response.data.session);
      }
    } catch (error) {
      console.error("Erreur de rafraîchissement de session:", error);
      throw error;
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 