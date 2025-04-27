"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import auth from "@/lib/api/auth";
import { ROUTES } from "@/constants/routes"
import { UserRole } from "@/types/roles"

interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserData | null;
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
    default:
      return ROUTES.LOGIN;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier le token au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await auth.getProfile();
      setUser(userData as UserData);
      setIsAuthenticated(true);
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
      const response = await auth.login({ email, password });
      console.log('Login response:', response);
      if (response.data) {
        const { token, ...userData } = response.data;
        console.log('Setting user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('Redirecting to dashboard...');
        router.push(ROUTES.DASHBOARD);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const response = await auth.refreshToken();
      if (response.data) {
        const { token, ...userData } = response.data;
        setUser(userData);
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