import { prisma } from "@/lib/prisma";
import CustomersList from "@/components/customers/CustomersList";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: {
        select: { orders: true }
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1 // Only pull the latest order for the table view preview
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Customers</h2>
      </div>

      <CustomersList customers={customers} />
    </div>
  );
}
