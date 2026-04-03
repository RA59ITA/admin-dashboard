import { prisma } from "@/lib/prisma";
import ExpensesList from "@/components/expenses/ExpensesList";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { expenseDate: "desc" }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Expenses Tracker</h2>
      </div>

      <ExpensesList expenses={expenses} />
    </div>
  );
}
