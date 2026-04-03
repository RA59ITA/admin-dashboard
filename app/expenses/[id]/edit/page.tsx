import { prisma } from "@/lib/prisma";
import EditExpenseForm from "@/components/expenses/EditExpenseForm";
import { notFound } from "next/navigation";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const expenseId = parseInt(params.id);
  
  if (isNaN(expenseId)) {
    return notFound();
  }

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId }
  });

  if (!expense) {
    return notFound();
  }

  return <EditExpenseForm expense={expense} />;
}
