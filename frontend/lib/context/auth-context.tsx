"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import auth from "@/lib/api/auth";
import type { Employe, SessionUtilisateur } from "@/lib/api/types";
import { ROUTES } from "@/constants/routes"
import { UserRole } from "@/types/roles"

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

// Fonction pour obtenir la route de redirection par défaut selon le rôle
function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return ROUTES.ADMIN.BASE;
    case "caisse":
      return ROUTES.CAISSE.BASE;
    case "graphiste":
      return ROUTES.ATELIER.BASE;
    case "accueil":
      return ROUTES.ACCUEIL.BASE;
    case "stock":
      return ROUTES.STOCK.BASE;
    default:
      return ROUTES.LOGIN;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Omit<Employe, "password"> | null>(null);
  const [session, setSession] = useState<SessionUtilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier le token au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Vérifier le token dans localStorage ou les cookies
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Appeler l'API pour vérifier le token
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Échec de la connexion");
      }

      const { token, user } = await response.json();
      localStorage.setItem("token", token);
      setUser(user);
      setIsAuthenticated(true);
      router.push(getDefaultRouteForRole(user.role as UserRole));
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
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
    isAuthenticated,
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