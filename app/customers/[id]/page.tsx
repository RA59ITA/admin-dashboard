import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, StatusBadge } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CustomerHistoryPage({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);

  if (isNaN(customerId)) {
    return notFound();
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        include: { reseller: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!customer) {
    return notFound();
  }

  const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + order.sellingPrice, 0);
  const totalProfit = customer.orders.reduce((sum: number, order: any) => sum + order.profit, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/customers">
          <Button variant="outline" size="sm" style={{ padding: "8px" }}>
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Customer Details</h2>
      </div>

      {/* Customer Header Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        <Card style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "var(--accent-base)" }}>Profile Info</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <User size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: 500 }}>{customer.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Phone size={18} color="var(--text-muted)" />
              <span>{customer.phone || "No Phone"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Mail size={18} color="var(--text-muted)" />
              <span>{customer.email || "No Email"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Calendar size={18} color="var(--text-muted)" />
              <span>Joined: {new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "var(--accent-base)" }}>Lifetime Value</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "auto", marginBottom: "auto" }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Total Orders</div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>{customer.orders.length}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Total Spent</div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>${totalSpent.toFixed(2)}</div>
            </div>
            <div style={{ gridColumn: "span 2", borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "4px" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Accumulated Profit</div>
              <div style={{ fontSize: "20px", fontWeight: 600, color: totalProfit >= 0 ? "var(--accent-base)" : "#f87171" }}>
                ${totalProfit.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders History Table */}
      <h3 style={{ fontSize: "20px", fontWeight: 600, marginTop: "8px" }}>Order History</h3>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Financials</TableHead>
              <TableHead>Reseller</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customer.orders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                   No orders recorded for this customer yet.
                 </TableCell>
               </TableRow>
            ) : (
               customer.orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div style={{ fontWeight: 500, fontSize: "13px" }}>#ORD-{order.id.toString().padStart(3, '0')}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: 500, color: "var(--accent-base)" }}>{order.subscriptionType}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{order.months} Months</div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: "12px" }}>Start: {new Date(order.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: "12px" }}>Exp: {new Date(order.expiryDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: "12px" }}>Buy: ${order.buyingPrice.toFixed(2)}</div>
                    <div style={{ fontSize: "12px" }}>Sell: ${order.sellingPrice.toFixed(2)}</div>
                    <div style={{ fontSize: "12px", color: order.profit >= 0 ? "var(--accent-base)" : "#f87171" }}>
                      Prof: ${order.profit.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>{order.reseller ? order.reseller.name : "Direct"}</TableCell>
                  <TableCell>
                    <div style={{ marginBottom: "4px" }}><StatusBadge status={order.status} /></div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Renew: {order.renewalStatus}</div>
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
