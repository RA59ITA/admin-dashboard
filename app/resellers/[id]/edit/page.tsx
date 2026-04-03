import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditResellerForm from "./EditResellerForm";

export default async function EditResellerServer({ params }: { params: { id: string } }) {
  const resellerId = parseInt(params.id);
  
  if (isNaN(resellerId)) {
    return notFound();
  }

  const reseller = await prisma.reseller.findUnique({
    where: { id: resellerId }
  });

  if (!reseller) {
    return notFound();
  }

  return <EditResellerForm reseller={reseller} />;
}
