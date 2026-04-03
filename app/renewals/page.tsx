import { prisma } from "@/lib/prisma";
import RenewalsList from "@/components/renewals/RenewalsList";

export const dynamic = 'force-dynamic';

export default async function RenewalsPage() {
  const orders = await prisma.order.findMany({
    include: { 
      customer: true,
      reseller: true
    },
    orderBy: { expiryDate: "asc" } // Order by closest expiry natively
  });

  const resellers = await prisma.reseller.findMany();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Renewals & Expirations</h2>
      </div>

      <RenewalsList orders={orders} resellers={resellers} />
    </div>
  );
}
