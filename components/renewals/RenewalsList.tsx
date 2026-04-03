"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, StatusBadge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AlertCircle, CalendarClock, AlertTriangle, CalendarDays, Send, Copy, Check, RefreshCcw, Plus } from "lucide-react";
import { updateRenewalStatus } from "@/app/actions";

function RenewalActionMenu({ order }: { order: any }) {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const generateWhatsAppText = () => {
    return `Hello ${order.customer.name}, your ${order.subscriptionType} plan expires on ${new Date(order.expiryDate).toLocaleDateString()}. Let’s renew it.`;
  };

  const handleAction = async (type: "copy" | "send" | "renew") => {
    setIsUpdating(true);

    if (type === "renew") {
      await updateRenewalStatus(order.id, "Renewed");
      setIsUpdating(false);
      return;
    }

    if (type === "send") {
      await updateRenewalStatus(order.id, "Message Sent");
    }
    
    setIsUpdating(false);

    if (type === "copy") {
      await navigator.clipboard.writeText(generateWhatsAppText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (type === "send") {
      if (!order.customer.phone) {
        alert("Customer has no phone number.");
        return;
      }
      const text = encodeURIComponent(generateWhatsAppText());
      const cleanNumber = order.customer.phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        <Button variant="outline" size="sm" onClick={() => handleAction("copy")} title="Copy Renewal Message" disabled={isUpdating} style={{ padding: "4px 8px" }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAction("send")} title="Send Renewal Message to Customer" disabled={isUpdating || !order.customer.phone} style={{ padding: "4px 8px", borderColor: "#60a5fa", color: "#60a5fa" }}>
          <Send size={14} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAction("renew")} title="Mark as Renewed" disabled={isUpdating || order.renewalStatus === "Renewed"} style={{ padding: "4px 8px", borderColor: "var(--accent-base)", color: "var(--accent-base)" }}>
          <RefreshCcw size={14} />
        </Button>
      </div>
      <Link href="/orders/new">
        <Button variant="ghost" size="sm" style={{ width: "100%", fontSize: "11px", height: "24px", color: "var(--text-muted)" }}>
          <Plus size={12} style={{ marginRight: "4px" }} /> Create Renewal
        </Button>
      </Link>
    </div>
  );
}

type OrderWithRelations = any; // Generic

export default function RenewalsList({ orders, resellers }: { orders: OrderWithRelations[], resellers: any[] }) {
  const [filterTime, setFilterTime] = useState("");
  const [filterPackage, setFilterPackage] = useState("");
  const [filterReseller, setFilterReseller] = useState("");
  const [filterRenewalStatus, setFilterRenewalStatus] = useState("");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Process orders with derived days and statuses
  const processedOrders = useMemo(() => {
    return orders.map(order => {
      const expiry = new Date(order.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let derivedStatus = "Active";
      if (order.renewalStatus === "Renewed") {
        derivedStatus = "Renewed";
      } else if (diffDays < 0) {
        derivedStatus = "Expired";
      } else if (diffDays <= 3) {
        derivedStatus = "Expiring Soon";
      }

      return {
        ...order,
        diffDays,
        derivedStatus
      };
    });
  }, [orders, today]);

  // Calculations for metric cards
  const metrics = useMemo(() => {
    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;
    let expiredCount = 0;

    processedOrders.forEach(order => {
      if (order.renewalStatus === "Renewed") return; // Ignore already renewed from metrics usually

      const { diffDays } = order;
      if (diffDays < 0) expiredCount++;
      if (diffDays === 0) todayCount++;
      if (diffDays >= 0 && diffDays <= 7) thisWeekCount++;
      if (diffDays >= 0 && diffDays <= 30) thisMonthCount++;
    });

    return { todayCount, thisWeekCount, thisMonthCount, expiredCount };
  }, [processedOrders]);

  // Apply visual filters
  const filteredOrders = processedOrders.filter((order) => {
    const { diffDays } = order;

    // Time Filter
    let matchTime = true;
    if (filterTime === "today") matchTime = diffDays === 0;
    if (filterTime === "3days") matchTime = diffDays >= 0 && diffDays <= 3;
    if (filterTime === "week") matchTime = diffDays >= 0 && diffDays <= 7;
    if (filterTime === "month") matchTime = diffDays >= 0 && diffDays <= 30;
    if (filterTime === "expired") matchTime = diffDays < 0;

    // Package Filter
    const matchPackage = filterPackage === "" || order.subscriptionType === filterPackage;
    
    // Reseller Filter
    const matchReseller = filterReseller === "" || (order.resellerId && order.resellerId.toString() === filterReseller);
    
    // Renewal Status Filter
    const matchRenewalStatus = filterRenewalStatus === "" || order.renewalStatus === filterRenewalStatus;

    return matchTime && matchPackage && matchReseller && matchRenewalStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <Card style={{ padding: "20px", borderLeft: "4px solid #f87171" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Already Expired</h3>
            <AlertCircle size={20} color="#f87171" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "#f87171" }}>{metrics.expiredCount}</div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid #fbbf24" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Expiring Today</h3>
            <AlertTriangle size={20} color="#fbbf24" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "#fbbf24" }}>{metrics.todayCount}</div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid #60a5fa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Expiring This Week</h3>
            <CalendarClock size={20} color="#60a5fa" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px" }}>{metrics.thisWeekCount}</div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid var(--accent-base)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Expiring This Month</h3>
            <CalendarDays size={20} color="var(--accent-base)" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px" }}>{metrics.thisMonthCount}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Timeline</label>
            <select className="input-base" value={filterTime} onChange={e => setFilterTime(e.target.value)}>
              <option value="">All Time</option>
              <option value="today">Expiring Today</option>
              <option value="3days">Expiring in 3 Days</option>
              <option value="week">Expiring This Week</option>
              <option value="month">Expiring This Month</option>
              <option value="expired">Already Expired</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Package</label>
            <select className="input-base" value={filterPackage} onChange={e => setFilterPackage(e.target.value)}>
              <option value="">All Packages</option>
              <option value="Canva Pro">Canva Pro</option>
              <option value="CapCut Pro">CapCut Pro</option>
              <option value="Adobe Creative Cloud">Adobe Creative Cloud</option>
              <option value="ChatGPT Plus">ChatGPT Plus</option>
              <option value="VEO3">VEO3</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Reseller</label>
            <select className="input-base" value={filterReseller} onChange={e => setFilterReseller(e.target.value)}>
              <option value="">All Resellers / Direct</option>
              {resellers.map(r => (
                <option key={r.id} value={r.id.toString()}>{r.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Renewal Status</label>
            <select className="input-base" value={filterRenewalStatus} onChange={e => setFilterRenewalStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Renewed">Renewed</option>
              <option value="Message Sent">Message Sent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Renewals Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>Renewal Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                   No matching orders found.
                 </TableCell>
               </TableRow>
            ) : (
               filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div style={{ fontWeight: 500 }}>{order.customer.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{order.customer.phone || "-"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{order.customer.email || "-"}</div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: 500, color: "var(--accent-base)" }}>{order.subscriptionType}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{order.reseller ? order.reseller.name : "Direct"}</div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: "12px" }}>Start: {new Date(order.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: "12px", fontWeight: order.diffDays <= 7 ? 600 : 400, color: order.diffDays < 0 ? "#f87171" : order.diffDays <= 3 ? "#fbbf24" : "var(--text-primary)" }}>
                      Exp: {new Date(order.expiryDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ 
                      fontSize: "14px", 
                      fontWeight: 700, 
                      color: order.diffDays < 0 ? "#f87171" : order.diffDays <= 3 ? "#fbbf24" : order.diffDays <= 7 ? "#60a5fa" : "var(--accent-base)" 
                    }}>
                      {order.diffDays < 0 ? `${Math.abs(order.diffDays)} Days Overdue` : `${order.diffDays} Days`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.derivedStatus} />
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: order.renewalStatus === "Renewed" ? "var(--accent-base)" : order.renewalStatus === "Message Sent" ? "#60a5fa" : "var(--text-secondary)" }}>
                      {order.renewalStatus}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RenewalActionMenu order={order} />
                  </TableCell>
                </TableRow>
               ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
