"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import "./layout.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
