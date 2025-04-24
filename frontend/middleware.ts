import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuration des routes protégées et leurs rôles autorisés
const protectedRoutes = {
  "/dashboard": ["admin", "accueil", "caisse", "graphiste"],
  "/dashboard/clients": ["admin", "accueil"],
  "/dashboard/orders": ["admin", "accueil", "graphiste"],
  "/dashboard/payments": ["admin", "caisse"],
  "/dashboard/inventory": ["admin", "graphiste"],
  "/dashboard/employees": ["admin"],
  "/dashboard/reports": ["admin"],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;

  // Vérifier si la route est protégée
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    path.startsWith(route)
  );

  // Si c'est la page de login et l'utilisateur est déjà connecté
  if (path === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si c'est une route protégée et l'utilisateur n'est pas connecté
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Vérifier les permissions pour les routes protégées
  if (isProtectedRoute && token) {
    try {
      // Décoder le token pour obtenir le rôle
      const tokenData = JSON.parse(atob(token.value.split(".")[1]));
      const userRole = tokenData.role;

      // Vérifier si l'utilisateur a accès à cette route
      const hasAccess = Object.entries(protectedRoutes).some(
        ([route, roles]) => path.startsWith(route) && roles.includes(userRole)
      );

      if (!hasAccess) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // En cas d'erreur de décodage du token, rediriger vers login
      return NextResponse.redirect(new URL("/login", request.url));
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