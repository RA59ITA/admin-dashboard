"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShoppingCart, 
  Users, 
  Briefcase, 
  RefreshCcw, 
  Receipt, 
  BarChart, 
  Settings 
} from "lucide-react";
import "./layout.css"; // We'll put localized CSS here or stick to modules

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders/new", label: "New Order", icon: PlusCircle },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/resellers", label: "Resellers", icon: Briefcase },
  { href: "/renewals", label: "Renewals", icon: RefreshCcw },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <div className="logo-glow"></div>
        <h2>Admin<span className="text-accent">Panel</span></h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon className="nav-icon" size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
