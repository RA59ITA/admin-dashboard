import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { DollarSign, AlertCircle, AlertTriangle, CalendarClock, CalendarDays, Target, Wallet } from "lucide-react";
import SeedButton from "@/components/ui/SeedButton";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let orders: any[] = [];
  let expenses: any[] = [];
  
  try {
    const [fetchedOrders, fetchedExpenses] = await Promise.all([
      prisma.order.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } }),
      prisma.expense.findMany(),
    ]);
    orders = fetchedOrders;
    expenses = fetchedExpenses;
  } catch (error) {
    console.error("Database error in Dashboard:", error);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  let todayOrdersCount = 0;
  let todayProfit = 0;
  let monthlyProfit = 0;

  let expiringToday = 0;
  let expiringThisWeek = 0;
  let expiringThisMonth = 0;
  let alreadyExpired = 0;

  // Process Orders
  for (const o of orders) {
    const cDate = new Date(o.createdAt);
    cDate.setHours(0, 0, 0, 0);

    // Order Creation Stats
    if (cDate.getFullYear() === todayYear && cDate.getMonth() === todayMonth) {
      monthlyProfit += o.profit;
      if (cDate.getDate() === todayDate) {
        todayOrdersCount++;
        todayProfit += o.profit;
      }
    }

    // Expiry Stats
    if (o.renewalStatus !== "Renewed") {
      const eDate = new Date(o.expiryDate);
      eDate.setHours(0, 0, 0, 0);
      const diffTime = eDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) alreadyExpired++;
      else if (diffDays === 0) expiringToday++;
      else if (diffDays <= 7) expiringThisWeek++;
      else if (diffDays <= 30) expiringThisMonth++;
    }
  }

  // Process Expenses
  let todayExpenses = 0;
  let monthlyExpenses = 0;

  for (const e of expenses) {
    const d = new Date(e.expenseDate);
    if (d.getFullYear() === todayYear && d.getMonth() === todayMonth) {
      monthlyExpenses += e.amount;
      if (d.getDate() === todayDate) {
        todayExpenses += e.amount;
      }
    }
  }

  // Net Income computations
  const netIncomeToday = todayProfit - todayExpenses;
  const netIncomeThisMonth = monthlyProfit - monthlyExpenses;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600 }}>Financial Overview</h2>
        <SeedButton />
      </div>
      
      {/* Financials Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        
        <Card style={{ padding: "20px", borderLeft: "4px solid var(--accent-base)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Net Income Today</h3>
            <Target size={20} color="var(--accent-base)" style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: netIncomeToday >= 0 ? "var(--text-primary)" : "#f87171" }}>
            ${netIncomeToday.toFixed(2)}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", fontSize: "13px", color: "var(--text-muted)", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
            <span style={{ color: "var(--accent-base)" }}>+{todayProfit.toFixed(2)} Profit</span>
            <span style={{ color: "#f87171" }}>-{todayExpenses.toFixed(2)} Expenses</span>
          </div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid #60a5fa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Net Income This Month</h3>
            <Wallet size={20} color="#60a5fa" style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: netIncomeThisMonth >= 0 ? "var(--text-primary)" : "#f87171" }}>
            ${netIncomeThisMonth.toFixed(2)}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", fontSize: "13px", color: "var(--text-muted)", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
            <span style={{ color: "var(--accent-base)" }}>+{monthlyProfit.toFixed(2)} Profit</span>
            <span style={{ color: "#f87171" }}>-{monthlyExpenses.toFixed(2)} Expenses</span>
          </div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid #a78bfa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Today Orders</h3>
            <DollarSign size={20} color="#a78bfa" style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>{todayOrdersCount}</div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
            Orders generated today
          </div>
        </Card>

      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 600, marginTop: "8px" }}>Renewals Radar</h2>
      
      {/* Renewals Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <Card style={{ padding: "20px", borderLeft: "4px solid #f87171" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Already Expired</h3>
            <AlertCircle size={20} color="#f87171" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "#f87171" }}>{alreadyExpired}</div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid #fbbf24" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Expiring Today</h3>
            <AlertTriangle size={20} color="#fbbf24" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "#fbbf24" }}>{expiringToday}</div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid #60a5fa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Expiring This Week</h3>
            <CalendarClock size={20} color="#60a5fa" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px" }}>{expiringThisWeek}</div>
        </Card>

        <Card style={{ padding: "20px", borderLeft: "4px solid var(--accent-base)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Expiring This Month</h3>
            <CalendarDays size={20} color="var(--accent-base)" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px" }}>{expiringThisMonth}</div>
        </Card>
      </div>

    </div>
  );
}
