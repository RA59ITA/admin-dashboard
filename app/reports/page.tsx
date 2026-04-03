import { prisma } from "@/lib/prisma";
import ReportsView from "@/components/reports/ReportsView";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [orders, expenses, resellers] = await Promise.all([
    prisma.order.findMany({ include: { reseller: true }, orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({ orderBy: { expenseDate: "asc" } }),
    prisma.reseller.findMany(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Analytics & Reports</h2>
      </div>

      <ReportsView orders={orders} expenses={expenses} resellers={resellers} />
    </div>
  );
}
