"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, StatusBadge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Search, Eye } from "lucide-react";
import Link from "next/link";

export default function CustomersList({ customers }: { customers: any[] }) {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(customer => {
    const term = search.toLowerCase();
    return term === "" || 
      customer.name.toLowerCase().includes(term) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.toLowerCase().includes(term));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Card style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "400px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Search Customers</label>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(0, 0, 0, 0.25)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "0 12px" }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              placeholder="Search by Name, Phone, or Email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", padding: "10px", width: "100%", fontSize: "14px" }} 
            />
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Latest Subscription</TableHead>
              <TableHead>Latest Expiry</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                   No matching customers found.
                 </TableCell>
               </TableRow>
            ) : (
               filteredCustomers.map(customer => {
                 // Determine latest order
                 const latestOrder = customer.orders && customer.orders.length > 0 
                   ? customer.orders[0] // Because we order by createdAt desc in DB
                   : null;

                 return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div style={{ fontWeight: 500 }}>{customer.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>ID: {customer.id}</div>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontSize: "13px" }}>{customer.phone || "No Phone"}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{customer.email || "No Email"}</div>
                    </TableCell>
                    <TableCell>{customer._count.orders}</TableCell>
                    <TableCell>
                      {latestOrder ? (
                        <span style={{ fontWeight: 500, color: "var(--accent-base)" }}>{latestOrder.subscriptionType}</span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {latestOrder ? new Date(latestOrder.expiryDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {latestOrder ? <StatusBadge status={latestOrder.status} /> : <span style={{ color: "var(--text-muted)" }}>No Orders</span>}
                    </TableCell>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye size={14} style={{ marginRight: "6px" }} /> View History
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                 );
               })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
