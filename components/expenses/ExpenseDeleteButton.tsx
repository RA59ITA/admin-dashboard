"use client";

import { deleteExpense } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export default function ExpenseDeleteButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this expense?")) {
      await deleteExpense(id);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: "#f87171" }}>
      Delete
    </Button>
  );
}
