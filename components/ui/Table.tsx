import React from "react";
import "./ui.css";

interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="table-container">
      <table className="data-table">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>;
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <th>{children}</th>;
}

export function TableCell({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props}>{children}</td>;
}

export function StatusBadge({ status }: { status: "Active" | "Pending" | "Expired" | string }) {
  const statusLower = status.toLowerCase();
  
  let badgeClass = "status-badge ";
  let style = {};
  if (statusLower === "active") badgeClass += "status-active";
  else if (statusLower === "expired") badgeClass += "status-expired";
  else if (statusLower === "payment received") {
    style = { background: "rgba(96, 165, 250, 0.1)", color: "#60a5fa", border: "1px solid rgba(96, 165, 250, 0.2)" };
  } else if (statusLower === "renewed") {
    style = { background: "rgba(167, 139, 250, 0.1)", color: "#a78bfa", border: "1px solid rgba(167, 139, 250, 0.2)" };
  } else if (statusLower === "expiring soon") {
    style = { background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", border: "1px solid rgba(251, 191, 36, 0.2)" };
  } else badgeClass += "status-pending";

  return <span className={badgeClass.trim()} style={style}>{status}</span>;
}
