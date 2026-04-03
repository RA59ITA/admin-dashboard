"use client";

import { usePathname } from "next/navigation";
import { Bell, User, Search } from "lucide-react";
import "./layout.css";

export default function Header() {
  const pathname = usePathname();
  
  // Format path to title (e.g. /orders/new -> New Order)
  const getTitle = () => {
    if (pathname === "/") return "Dashboard";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    
    if (parts[0] === "orders" && parts[1] === "new") return "New Order";
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  };

  return (
    <header className="top-header glass">
      <div className="header-title">
        <h1>{getTitle()}</h1>
      </div>
      
      <div className="header-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
        
        <button className="icon-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <button className="profile-button">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
