import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", key: "dashboard", shortKey: "dashboardShort", icon: LayoutDashboard },
  { href: "/pos", key: "pos", shortKey: "posShort", icon: ShoppingCart },
  { href: "/inventory", key: "inventory", shortKey: "inventoryShort", icon: Package },
  { href: "/register", key: "register", shortKey: "registerShort", icon: Wallet },
] as const;
