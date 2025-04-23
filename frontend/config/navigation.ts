import { IconType } from 'react-icons'
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiDollarSign, 
  FiSettings, 
  FiBox,
  FiList,
  FiBarChart2,
  FiUserPlus,
  FiPrinter,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiShoppingCart,
  FiUser
} from 'react-icons/fi'

export type NavigationItem = {
  name: string
  href: string
  icon: IconType
  role: string[]
  description?: string
}

export const navigationItems: NavigationItem[] = [
  // Common for all roles
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: FiHome,
    role: ['admin', 'accueil', 'caisse', 'graphiste'],
    description: 'Overview of your workspace'
  },
  
  // Reception role items
  {
    name: 'New Order',
    href: '/dashboard/reception/new-order',
    icon: FiShoppingCart,
    role: ['accueil', 'admin'],
    description: 'Create and manage new orders'
  },
  {
    name: 'Clients',
    href: '/dashboard/clients',
    icon: FiUsers,
    role: ['accueil', 'admin'],
    description: 'Manage client information'
  },
  {
    name: 'Inventory',
    href: '/dashboard/inventory',
    icon: FiBox,
    role: ['accueil', 'graphiste', 'admin'],
    description: 'View inventory status'
  },
  
  // Cashier role items
  {
    name: 'Pending Payments',
    href: '/dashboard/payments/pending',
    icon: FiClock,
    role: ['caisse', 'admin'],
    description: 'Orders awaiting payment'
  },
  {
    name: 'Payment History',
    href: '/dashboard/payments/history',
    icon: FiCheckCircle,
    role: ['caisse', 'admin'],
    description: 'Processed payments history'
  },
  
  // Designer role items
  {
    name: 'Print Queue',
    href: '/dashboard/designer/print-queue',
    icon: FiPrinter,
    role: ['graphiste', 'admin'],
    description: 'Orders paid but awaiting printing'
  },
  
  // Admin only items
  {
    name: 'All Orders',
    href: '/dashboard/orders',
    icon: FiList,
    role: ['admin', 'accueil', 'caisse', 'graphiste'],
    description: 'View all orders'
  },
  {
    name: 'Employees',
    href: '/dashboard/employees',
    icon: FiUserPlus,
    role: ['admin'],
    description: 'Manage staff members'
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FiBarChart2,
    role: ['admin'],
    description: 'Analytics and reporting'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: FiSettings,
    role: ['admin'],
    description: 'System configuration'
  }
]

export const getNavigationByRole = (role: string): NavigationItem[] => {
  return navigationItems.filter(item => item.role.includes(role))
} 