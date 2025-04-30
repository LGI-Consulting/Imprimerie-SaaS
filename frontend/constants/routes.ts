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
    SPENDINGS: "/dashboard/admin/spendings",
    COMPTE_EXPLOITANT: "/dashboard/admin/exploitant",
    BANQUE: "/dashboard/admin/banque",
    SMT: "/dashboard/admin/smt"
  },
  CAISSE: {
    BASE: "/dashboard/caisse",
    PAYMENTS: "/dashboard/caisse/payments",
    ORDERS: "/dashboard/caisse/orders",
  },
  ATELIER: {
    BASE: "/dashboard/atelier",
  },
  ACCUEIL: {
    BASE: "/dashboard/accueil",
    ORDERS: "/dashboard/accueil/orders",
    CLIENTS: "/dashboard/accueil/clients",
  },
  STOCK: {
    BASE: "/dashboard/stock",
    INVENTORY: "/dashboard/stock/inventory",
  },
};

// Configuration des routes protégées et leurs rôles autorisés
export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  // Routes principales
  [ROUTES.DASHBOARD]: ["admin", "caisse", "graphiste", "accueil"],
  
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
  
  // Routes accueil
  [ROUTES.ACCUEIL.BASE]: ["admin", "accueil"],
  [ROUTES.ACCUEIL.ORDERS]: ["admin", "accueil"],
  [ROUTES.ACCUEIL.CLIENTS]: ["admin", "accueil"],
  
  // Routes stock
  [ROUTES.STOCK.BASE]: ["admin", "accueil", "graphiste"],
  [ROUTES.STOCK.INVENTORY]: ["admin", "accueil", "graphiste"],
}; 