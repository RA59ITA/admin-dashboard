import { prisma } from "@/lib/prisma";
import NewOrderForm from "@/components/orders/NewOrderForm";

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
  const resellers = await prisma.reseller.findMany({
    orderBy: { name: "asc" }
  });

  return <NewOrderForm resellers={resellers} />;
}
