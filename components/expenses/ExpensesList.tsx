"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import { createExpense } from "@/app/actions";
import ExpenseDeleteButton from "./ExpenseDeleteButton";
import Link from "next/link";
import { Plus, TrendingDown } from "lucide-react";

export default function ExpensesList({ expenses }: { expenses: any[] }) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { dailyTotal, monthlyTotal } = useMemo(() => {
    let daily = 0;
    let monthly = 0;

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    expenses.forEach((exp) => {
      const d = new Date(exp.expenseDate);

      if (d.getFullYear() === todayYear && d.getMonth() === todayMonth) {
        monthly += exp.amount;

        if (d.getDate() === todayDate) {
          daily += exp.amount;
        }
      }
    });

    return { dailyTotal: daily, monthlyTotal: monthly };
  }, [expenses]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await createExpense(formData);

    setDescription("");
    setAmount("");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
    setLoading(false);
  };

  return (
    <div className="expenses-page">
      {/* Metric Cards */}
      <div className="expenses-metrics">
        <Card style={{ padding: "24px", borderLeft: "4px solid #f87171" }}>
          <div className="expense-metric-header">
            <h3>Expenses Today</h3>
            <TrendingDown size={20} color="#f87171" style={{ opacity: 0.8 }} />
          </div>

          <div className="expense-metric-value" style={{ color: "#f87171" }}>
            ${dailyTotal.toFixed(2)}
          </div>
        </Card>

        <Card
          style={{
            padding: "24px",
            borderLeft: "4px solid var(--accent-base)",
          }}
        >
          <div className="expense-metric-header">
            <h3>Expenses This Month</h3>
            <TrendingDown
              size={20}
              color="var(--accent-base)"
              style={{ opacity: 0.8 }}
            />
          </div>

          <div
            className="expense-metric-value"
            style={{ color: "var(--accent-base)" }}
          >
            ${monthlyTotal.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="expenses-list-header">
        <h3>All Expenses</h3>

        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus size={16} style={{ marginRight: "6px" }} />
              Log Expense
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card
          style={{
            padding: "20px",
            border: "1px dashed var(--accent-base)",
            background: "rgba(0, 255, 136, 0.02)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            New Expense Record
          </h3>

          <form onSubmit={handleSubmit} className="expense-form">
            <Input
              name="description"
              label="Description"
              placeholder="e.g. Server Hosting"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <Input
              name="amount"
              label="Amount ($)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                setAmount(value === "" ? "" : parseFloat(value));
              }}
              required
            />

            <Input
              name="expenseDate"
              label="Expense Date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              style={{ height: "42px" }}
            >
              {loading ? "Saving..." : "Save Expense"}
            </Button>
          </form>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        {/* Desktop Table */}
        <div className="desktop-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    style={{ textAlign: "center", color: "var(--text-muted)" }}
                  >
                    No expenses recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Logged: {new Date(expense.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--accent-base)",
                        }}
                      >
                        {expense.description}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#f87171",
                        }}
                      >
                        ${expense.amount.toFixed(2)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link href={`/expenses/${expense.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <ExpenseDeleteButton id={expense.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-cards">
          {expenses.length === 0 ? (
            <div className="expense-empty">No expenses recorded yet.</div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="expense-card">
                <div className="expense-top">
                  <span className="expense-date">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </span>

                  <span className="expense-amount">
                    ${expense.amount.toFixed(2)}
                  </span>
                </div>

                <div className="expense-desc">{expense.description}</div>

                <div className="expense-logged">
                  Logged: {new Date(expense.createdAt).toLocaleDateString()}
                </div>

                <div className="expense-actions">
                  <Link href={`/expenses/${expense.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>

                  <ExpenseDeleteButton id={expense.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
