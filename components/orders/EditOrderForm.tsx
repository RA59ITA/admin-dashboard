"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateOrder } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

export default function EditOrderForm({ order, resellers }: { order: any, resellers: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // States for frontend auto-calculations (initialized with existing database values)
  const [startDate, setStartDate] = useState(new Date(order.startDate).toISOString().split('T')[0]);
  const [months, setMonths] = useState<number>(order.months);
  const [buyingPrice, setBuyingPrice] = useState<number | "">(order.buyingPrice);
  const [sellingPrice, setSellingPrice] = useState<number | "">(order.sellingPrice);

  // Derived state calculations
  const expiryDateFormatted = useMemo(() => {
    if (!startDate || isNaN(months)) return "-";
    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setMonth(start.getMonth() + months);
    return expiry.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }, [startDate, months]);

  const profit = useMemo(() => {
    if (buyingPrice === "" || sellingPrice === "") return 0;
    return Number(sellingPrice) - Number(buyingPrice);
  }, [buyingPrice, sellingPrice]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    await updateOrder(order.id, formData);
    
    setLoading(false);
    router.push("/orders");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Edit Order #{order.id}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent-base)", marginBottom: "-8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>Customer Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Input name="customerName" label="Customer Name" defaultValue={order.customer.name} required />
            <Input name="phone" label="Customer Number (Phone)" defaultValue={order.customer.phone || ""} />
            <Input name="email" label="Customer Email" type="email" defaultValue={order.customer.email || ""} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Reseller (Optional)
              </label>
              <select name="resellerId" className="input-base" defaultValue={order.resellerId || ""}>
                <option value="">-- Direct Customer --</option>
                {resellers.map((reseller) => (
                  <option key={reseller.id} value={reseller.id}>
                    {reseller.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent-base)", marginBottom: "-8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginTop: "8px" }}>Order Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Subscription Type
              </label>
              <select name="subscriptionType" className="input-base" defaultValue={order.subscriptionType}>
                <option value="Canva Pro">Canva Pro</option>
                <option value="CapCut Pro">CapCut Pro</option>
                <option value="Adobe Creative Cloud">Adobe Creative Cloud</option>
                <option value="ChatGPT Plus">ChatGPT Plus</option>
                <option value="VEO3">VEO3</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Order Status
              </label>
              <select name="orderStatus" className="input-base" defaultValue={order.status}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <Input 
              name="months" 
              label="Plan Duration (Months)" 
              type="number" 
              min="1" 
              value={months} 
              onChange={(e) => setMonths(parseInt(e.target.value) || 0)} 
              required 
            />
            
            <Input 
              name="startDate" 
              label="Start Date" 
              type="date" 
              required 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <div style={{ gridColumn: "span 2" }}>
              <div style={{ padding: "12px", background: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", border: "1px dashed var(--border-light)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Auto-calculated Expiry Date:</span>
                <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: 600, color: "var(--accent-base)" }}>{expiryDateFormatted}</span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent-base)", marginBottom: "-8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginTop: "8px" }}>Financials</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Input 
              name="buyingPrice" 
              label="Buying Price ($)" 
              type="number" 
              step="0.01" 
              value={buyingPrice}
              onChange={(e) => setBuyingPrice(parseFloat(e.target.value))}
              required 
            />
            
            <Input 
              name="sellingPrice" 
              label="Selling Price ($)" 
              type="number" 
              step="0.01" 
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value))}
              required 
            />

            <div style={{ gridColumn: "span 2" }}>
              <div style={{ padding: "12px", background: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", border: "1px dashed var(--border-light)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Auto-calculated Profit:</span>
                <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: 600, color: profit >= 0 ? "var(--accent-base)" : "#f87171" }}>
                  ${profit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

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
