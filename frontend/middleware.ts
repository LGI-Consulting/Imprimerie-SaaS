import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, PROTECTED_ROUTES } from "./constants/routes";
import { ERROR_MESSAGES } from "./constants/errors";
import { UserRole } from "./types/roles";

// Fonction utilitaire pour décoder le token JWT
function decodeToken(token: string): { role: UserRole } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Fonction pour vérifier l'accès à une route
function hasAccessToRoute(path: string, userRole: UserRole): boolean {
  return Object.entries(PROTECTED_ROUTES).some(
    ([route, roles]) => path.startsWith(route) && roles.includes(userRole)
  );
}

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

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;

  // Vérifier si la route est protégée
  const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some((route) =>
    path.startsWith(route)
  );

  // Si c'est la page de login et l'utilisateur est déjà connecté
  if (path === ROUTES.LOGIN && token) {
    const tokenData = decodeToken(token.value);
    if (tokenData) {
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(tokenData.role), request.url)
      );
    }
  }

  // Si c'est une route protégée et l'utilisateur n'est pas connecté
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  // Vérifier les permissions pour les routes protégées
  if (isProtectedRoute && token) {
    const tokenData = decodeToken(token.value);
    
    if (!tokenData) {
      // Token invalide
      const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
      response.cookies.delete("token");
      return response;
    }

    // Vérifier si l'utilisateur a accès à cette route
    if (!hasAccessToRoute(path, tokenData.role)) {
      // Rediriger vers la page par défaut du rôle
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(tokenData.role), request.url)
      );
    }
  }

  return NextResponse.next();
}

// Configuration des routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
}; 