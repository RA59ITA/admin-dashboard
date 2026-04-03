import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";
import OrdersList from "@/components/orders/OrdersList";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { 
      customer: true,
      reseller: true
    },
    orderBy: { createdAt: "desc" }
  });

  const resellers = await prisma.reseller.findMany();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Manage Orders</h2>
        <Link href="/orders/new">
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: "8px" }} /> New Order
          </Button>
        </Link>
      </div>

      <OrdersList orders={orders} resellers={resellers} />
    </div>
  );
}
