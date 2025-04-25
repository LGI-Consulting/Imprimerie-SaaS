export type UserRole = "admin" | "caisse" | "graphiste" | "accueil";

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageOrders: boolean;
  canManagePayments: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewDashboard: true,
    canManageUsers: true,
    canManageOrders: true,
    canManagePayments: true,
    canManageInventory: true,
    canViewReports: true,
    canManageSettings: true,
  },
  caisse: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageOrders: true,
    canManagePayments: true,
    canManageInventory: false,
    canViewReports: false,
    canManageSettings: false,
  },
  graphiste: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageOrders: true,
    canManagePayments: false,
    canManageInventory: true,
    canViewReports: false,
    canManageSettings: false,
  },
  accueil: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageOrders: true,
    canManagePayments: false,
    canManageInventory: true,
    canViewReports: false,
    canManageSettings: false,
  },
}; 