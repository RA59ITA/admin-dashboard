"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const formatCurrency = (amount: number) => {
  return `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ReportsView({
  orders,
  expenses,
}: {
  orders: any[];
  expenses: any[];
  resellers: any[];
}) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const filteredOrders = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });
  }, [orders, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      return d >= start && d <= end;
    });
  }, [expenses, startDate, endDate]);

  const globalMetrics = useMemo(() => {
    let todaySales = 0;
    let todayProfit = 0;
    let todayExpense = 0;

    let monthlySales = 0;
    let monthlyProfit = 0;
    let monthlyExpense = 0;

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    orders.forEach((o) => {
      const d = new Date(o.createdAt);

      if (d.getFullYear() === todayYear && d.getMonth() === todayMonth) {
        monthlySales += Number(o.sellingPrice || 0);
        monthlyProfit += Number(o.profit || 0);

        if (d.getDate() === todayDate) {
          todaySales += Number(o.sellingPrice || 0);
          todayProfit += Number(o.profit || 0);
        }
      }
    });

    expenses.forEach((e) => {
      const d = new Date(e.expenseDate);

      if (d.getFullYear() === todayYear && d.getMonth() === todayMonth) {
        monthlyExpense += Number(e.amount || 0);

        if (d.getDate() === todayDate) {
          todayExpense += Number(e.amount || 0);
        }
      }
    });

    return {
      todaySales,
      todayProfit,
      todayExpense,
      monthlySales,
      monthlyProfit,
      monthlyExpense,
      netIncomeToday: todayProfit - todayExpense,
      netIncomeMonthly: monthlyProfit - monthlyExpense,
    };
  }, [orders, expenses]);

  const trendData = useMemo(() => {
    const map = new Map<
      string,
      { date: string; profit: number; expenses: number }
    >();

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      map.set(d.toISOString().split("T")[0], {
        date: d.toISOString().split("T")[0],
        profit: 0,
        expenses: 0,
      });
    }

    filteredOrders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toISOString().split("T")[0];

      if (map.has(dateKey)) {
        map.get(dateKey)!.profit += Number(o.profit || 0);
      }
    });

    filteredExpenses.forEach((e) => {
      const dateKey = new Date(e.expenseDate).toISOString().split("T")[0];

      if (map.has(dateKey)) {
        map.get(dateKey)!.expenses += Number(e.amount || 0);
      }
    });

    return Array.from(map.values());
  }, [filteredOrders, filteredExpenses, startDate, endDate]);

  const packageSummary = useMemo(() => {
    const acc: Record<string, number> = {};

    filteredOrders.forEach((o) => {
      const packageName = o.subscriptionType || "Unknown Package";
      acc[packageName] =
        (acc[packageName] || 0) + Number(o.sellingPrice || 0);
    });

    return Object.entries(acc)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredOrders]);

  const resellerSummary = useMemo(() => {
    const acc: Record<string, number> = {};

    filteredOrders.forEach((o) => {
      const name = o.reseller ? o.reseller.name : "Direct Customer";
      acc[name] = (acc[name] || 0) + Number(o.sellingPrice || 0);
    });

    return Object.entries(acc)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredOrders]);

  const topSellingSubscription =
    packageSummary.length > 0 ? packageSummary[0].name : "N/A";

  const filteredSalesTotal = filteredOrders.reduce(
    (sum, o) => sum + Number(o.sellingPrice || 0),
    0
  );

  const filteredProfitTotal = filteredOrders.reduce(
    (sum, o) => sum + Number(o.profit || 0),
    0
  );

  const filteredExpenseTotal = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const filteredNet = filteredProfitTotal - filteredExpenseTotal;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: "-8px",
          marginTop: "-8px",
        }}
      >
        Fixed Timeline Metrics
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <Card style={{ padding: "16px", borderTop: "3px solid #60a5fa" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Daily Sales Total
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>
            {formatCurrency(globalMetrics.todaySales)}
          </div>
        </Card>

        <Card style={{ padding: "16px", borderTop: "3px solid #60a5fa" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Monthly Sales Total
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>
            {formatCurrency(globalMetrics.monthlySales)}
          </div>
        </Card>

        <Card
          style={{ padding: "16px", borderTop: "3px solid var(--accent-base)" }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Daily Profit Total
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>
            {formatCurrency(globalMetrics.todayProfit)}
          </div>
        </Card>

        <Card
          style={{ padding: "16px", borderTop: "3px solid var(--accent-base)" }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Monthly Profit Total
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>
            {formatCurrency(globalMetrics.monthlyProfit)}
          </div>
        </Card>

        <Card style={{ padding: "16px", borderTop: "3px solid #f87171" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Daily Expense Total
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>
            {formatCurrency(globalMetrics.todayExpense)}
          </div>
        </Card>

        <Card style={{ padding: "16px", borderTop: "3px solid #f87171" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Monthly Expense Total
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700 }}>
            {formatCurrency(globalMetrics.monthlyExpense)}
          </div>
        </Card>

        <Card style={{ padding: "16px", borderTop: "3px solid #a78bfa" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Net Income Today
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color:
                globalMetrics.netIncomeToday >= 0
                  ? "var(--text-primary)"
                  : "#f87171",
            }}
          >
            {formatCurrency(globalMetrics.netIncomeToday)}
          </div>
        </Card>

        <Card style={{ padding: "16px", borderTop: "3px solid #a78bfa" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Net Income This Month
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color:
                globalMetrics.netIncomeMonthly >= 0
                  ? "var(--text-primary)"
                  : "#f87171",
            }}
          >
            {formatCurrency(globalMetrics.netIncomeMonthly)}
          </div>
        </Card>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--border-light)",
          margin: "8px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ fontSize: "20px", fontWeight: 600 }}>
          Custom Reports Generator
        </h3>

        <Card
          style={{
            padding: "8px 16px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            width: "fit-content",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            Filter Timeline:
          </span>

          <input
            type="date"
            className="input-base"
            style={{ padding: "6px" }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <span style={{ color: "var(--text-muted)" }}>to</span>

          <input
            type="date"
            className="input-base"
            style={{ padding: "6px" }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <Card
          style={{
            padding: "20px",
            textAlign: "center",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "4px",
            }}
          >
            Selected Range Sales
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#60a5fa" }}>
            {formatCurrency(filteredSalesTotal)}
          </div>
        </Card>

        <Card
          style={{
            padding: "20px",
            textAlign: "center",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "4px",
            }}
          >
            Selected Range Profit
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--accent-base)",
            }}
          >
            {formatCurrency(filteredProfitTotal)}
          </div>
        </Card>

        <Card
          style={{
            padding: "20px",
            textAlign: "center",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "4px",
            }}
          >
            Selected Range Expense
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#f87171" }}>
            {formatCurrency(filteredExpenseTotal)}
          </div>
        </Card>

        <Card
          style={{
            padding: "20px",
            textAlign: "center",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "4px",
            }}
          >
            Selected Range Net Income
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: filteredNet >= 0 ? "#a78bfa" : "#f87171",
            }}
          >
            {formatCurrency(filteredNet)}
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
        }}
      >
        <Card style={{ padding: "24px", height: "400px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Profit vs Expense Daily Trend
          </h3>

          <ResponsiveContainer width="100%" height="85%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                fontSize={12}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis stroke="var(--text-muted)" fontSize={12} />

              <Tooltip
                formatter={(value: number) => formatCurrency(Number(value))}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                itemStyle={{ fontSize: "14px", fontWeight: 600 }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: "12px" }}
              />

              <Line
                type="monotone"
                name="Daily Profit (Rs.)"
                dataKey="profit"
                stroke="var(--accent-base)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                name="Daily Expenses (Rs.)"
                dataKey="expenses"
                stroke="#f87171"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Top Selling Package
          </h3>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                border: "1px dashed var(--accent-base)",
                borderRadius: "50%",
                height: "200px",
                width: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: "rgba(0,255,136,0.05)",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                Best Seller
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--accent-base)",
                  marginTop: "4px",
                }}
              >
                {topSellingSubscription}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        <Card style={{ padding: "24px", height: "400px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Sales by Package Type
          </h3>

          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={packageSummary}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />

              <Tooltip
                formatter={(value: number) => formatCurrency(Number(value))}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />

              <Bar
                dataKey="sales"
                name="Total Sales (Rs.)"
                fill="#60a5fa"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: "24px", height: "400px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Sales by Reseller
          </h3>

          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={resellerSummary}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />

              <Tooltip
                formatter={(value: number) => formatCurrency(Number(value))}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />

              <Bar
                dataKey="sales"
                name="Total Sales (Rs.)"
                fill="#a78bfa"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
