import { prisma } from "@/lib/prisma";
import EditOrderForm from "@/components/orders/EditOrderForm";
import { notFound } from "next/navigation";

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id);
  
  if (isNaN(orderId)) {
    return notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!order) {
    return notFound();
  }

  const resellers = await prisma.reseller.findMany({
    orderBy: { name: "asc" }
  });

  return <EditOrderForm order={order} resellers={resellers} />;
}
