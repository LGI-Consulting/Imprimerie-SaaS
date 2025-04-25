import { UserRole } from "@/types/roles";

export const ROUTES = {
  // Routes principales
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  
  // Routes par rôle
  ADMIN: {
    BASE: "/dashboard/admin",
    EMPLOYEES: "/dashboard/admin/employees",
    SETTINGS: "/dashboard/admin/settings",
    REPORTS: "/dashboard/admin/reports",
  },
  CAISSE: {
    BASE: "/dashboard/caisse",
    PAYMENTS: "/dashboard/caisse/payments",
    ORDERS: "/dashboard/caisse/orders",
  },
  ATELIER: {
    BASE: "/dashboard/atelier",
    QUEUE: "/dashboard/atelier/queue",
    FILES: "/dashboard/atelier/files",
    PRODUCTION: "/dashboard/atelier/production",
  },
  ACCUEIL: {
    BASE: "/dashboard/accueil",
    ORDERS: "/dashboard/accueil/orders",
    CLIENTS: "/dashboard/accueil/clients",
  },
  STOCK: {
    BASE: "/dashboard/stock",
    INVENTORY: "/dashboard/stock/inventory",
    ALERTS: "/dashboard/stock/alerts",
  },
};

// Configuration des routes protégées et leurs rôles autorisés
export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  // Routes principales
  [ROUTES.DASHBOARD]: ["admin", "caisse", "graphiste", "accueil", "stock"],
  
  // Routes admin
  [ROUTES.ADMIN.BASE]: ["admin"],
  [ROUTES.ADMIN.EMPLOYEES]: ["admin"],
  [ROUTES.ADMIN.SETTINGS]: ["admin"],
  [ROUTES.ADMIN.REPORTS]: ["admin"],
  
  // Routes caisse
  [ROUTES.CAISSE.BASE]: ["admin", "caisse"],
  [ROUTES.CAISSE.PAYMENTS]: ["admin", "caisse"],
  [ROUTES.CAISSE.ORDERS]: ["admin", "caisse"],
  
  // Routes atelier
  [ROUTES.ATELIER.BASE]: ["admin", "graphiste"],
  [ROUTES.ATELIER.QUEUE]: ["admin", "graphiste"],
  [ROUTES.ATELIER.FILES]: ["admin", "graphiste"],
  [ROUTES.ATELIER.PRODUCTION]: ["admin", "graphiste"],
  
  // Routes accueil
  [ROUTES.ACCUEIL.BASE]: ["admin", "accueil"],
  [ROUTES.ACCUEIL.ORDERS]: ["admin", "accueil"],
  [ROUTES.ACCUEIL.CLIENTS]: ["admin", "accueil"],
  
  // Routes stock
  [ROUTES.STOCK.BASE]: ["admin", "stock"],
  [ROUTES.STOCK.INVENTORY]: ["admin", "stock"],
  [ROUTES.STOCK.ALERTS]: ["admin", "stock"],
}; 