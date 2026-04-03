"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateExpense } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditExpenseForm({ expense }: { expense: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState<number | "">(expense.amount);
  const [expenseDate, setExpenseDate] = useState(new Date(expense.expenseDate).toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    await updateExpense(expense.id, formData);
    
    setLoading(false);
    router.push("/expenses");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Card>
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Edit Expense #{expense.id}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <Input 
            name="description" 
            label="Description" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            required 
          />
          
          <Input 
            name="amount" 
            label="Amount ($)" 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={e => setAmount(parseFloat(e.target.value))} 
            required 
          />
          
          <Input 
            name="expenseDate" 
            label="Expense Date" 
            type="date" 
            value={expenseDate} 
            onChange={e => setExpenseDate(e.target.value)} 
            required 
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving Updates..." : "Save Updates"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
