"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, StatusBadge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import OrderDeleteButton from "./OrderDeleteButton";
import { Search, Send, Copy, Check, MessageCircleCheck } from "lucide-react";
import { updateOrderStatus } from "@/app/actions";

function OrderWhatsAppActions({ order }: { order: any }) {
  const [copied, setCopied] = useState(false);

  if (!order.reseller) return null;

  const generateWhatsAppText = () => {
    return `Hello, I need a ${order.months}-month ${order.subscriptionType} plan.

Customer Name: ${order.customer.name}
Customer Number: ${order.customer.phone || "N/A"}
Customer Email: ${order.customer.email || "N/A"}

Please process this order.`;
  };

  const handleSend = () => {
    if (!order.reseller.whatsappNumber) {
      alert("Reseller has no WhatsApp number.");
      return;
    }
    const text = encodeURIComponent(generateWhatsAppText());
    const cleanNumber = order.reseller.whatsappNumber.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateWhatsAppText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
      <Button variant="outline" size="sm" onClick={handleCopy} title="Copy Message" style={{ padding: "4px 8px" }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </Button>
      <Button variant="primary" size="sm" onClick={handleSend} title="Send to Reseller" disabled={!order.reseller.whatsappNumber} style={{ padding: "4px 8px" }}>
        <Send size={14} />
      </Button>
    </div>
  );
}

function CustomerPaymentAction({ order }: { order: any }) {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const generateWhatsAppText = () => {
    return `Hello ${order.customer.name}, your payment was received successfully. Please wait for your order. We will update you soon.`;
  };

  const handleAction = async (type: "copy" | "send") => {
    setIsUpdating(true);
    // Automatically update the order status
    await updateOrderStatus(order.id, "Payment Received");
    setIsUpdating(false);

    if (type === "copy") {
      await navigator.clipboard.writeText(generateWhatsAppText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
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
    <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
      <Button variant="outline" size="sm" onClick={() => handleAction("copy")} title="Copy Payment Confirmation" disabled={isUpdating} style={{ padding: "4px 8px" }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction("send")} title="Send Payment Confirmation to Customer" disabled={isUpdating || !order.customer.phone} style={{ padding: "4px 8px", borderColor: "var(--accent-base)", color: "var(--accent-base)" }}>
        <MessageCircleCheck size={14} style={{ marginRight: "4px" }} /> Payment Received
      </Button>
    </div>
  );
}

type OrderWithRelations = any; // Quick generic type to accept the included data

export default function OrdersList({ orders, resellers }: { orders: OrderWithRelations[], resellers: any[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterReseller, setFilterReseller] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filteredOrders = orders.filter((order) => {
    // Search (Name, Phone, Email)
    const term = search.toLowerCase();
    const matchSearch = term === "" || 
      order.customer.name.toLowerCase().includes(term) ||
      (order.customer.email && order.customer.email.toLowerCase().includes(term)) ||
      (order.customer.phone && order.customer.phone.toLowerCase().includes(term));
      
    // Type Filter
    const matchType = filterType === "" || order.subscriptionType === filterType;
    
    // Reseller Filter
    const matchReseller = filterReseller === "" || (order.resellerId && order.resellerId.toString() === filterReseller);
    
    // Status Filter
    const matchStatus = filterStatus === "" || order.status === filterStatus;
    
    // Date Filter (YYYY-MM to match order creation month for simplicity)
    const matchDate = filterDate === "" || new Date(order.createdAt).toISOString().startsWith(filterDate);

    return matchSearch && matchType && matchReseller && matchStatus && matchDate;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Card style={{ padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Search</label>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0, 0, 0, 0.25)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "0 12px" }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                placeholder="Name, Email, or Phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", padding: "10px", width: "100%", fontSize: "14px" }} 
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Service</label>
            <select className="input-base" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Services</option>
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
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Status</label>
            <select className="input-base" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Month Created</label>
            <input type="month" className="input-base" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Reseller</TableHead>
              <TableHead>Financials</TableHead>
              <TableHead>Status & Renewal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>
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
                  </TableCell>
                  <TableCell>{order.months} mo</TableCell>
                  <TableCell>
                    <div style={{ fontSize: "12px" }}>Cre: {new Date(order.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: "12px" }}>Start: {new Date(order.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: "12px" }}>Exp: {new Date(order.expiryDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>{order.reseller ? order.reseller.name : "Direct"}</TableCell>
                  <TableCell>
                    <div style={{ fontSize: "12px" }}>Buy: ${order.buyingPrice.toFixed(2)}</div>
                    <div style={{ fontSize: "12px" }}>Sell: ${order.sellingPrice.toFixed(2)}</div>
                    <div style={{ fontSize: "12px", color: order.profit >= 0 ? "var(--accent-base)" : "#f87171", fontWeight: 500 }}>
                      Profit: ${order.profit.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ marginBottom: "6px" }}><StatusBadge status={order.status} /></div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Renewal: {order.renewalStatus}</div>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Link href={`/orders/${order.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <OrderDeleteButton id={order.id} />
                    </div>
                    <OrderWhatsAppActions order={order} />
                    <CustomerPaymentAction order={order} />
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
