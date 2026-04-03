"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createOrder } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Reseller } from "@prisma/client";
import { Send, Copy, Check } from "lucide-react";

export default function NewOrderForm({ resellers }: { resellers: Reseller[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // States for frontend auto-calculations & WhatsApp generation
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("Canva Pro");
  const [resellerId, setResellerId] = useState("");
  const [orderStatus, setOrderStatus] = useState("Active");

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [months, setMonths] = useState<number>(1);
  const [buyingPrice, setBuyingPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");

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

  // WhatsApp Logic
  const selectedReseller = useMemo(() => {
    return resellers.find(r => r.id.toString() === resellerId);
  }, [resellerId, resellers]);

  const generateWhatsAppText = () => {
    return `Hello, I need a ${months}-month ${subscriptionType} plan.

Customer Name: ${customerName || "[Name]"}
Customer Number: ${phone || "N/A"}
Customer Email: ${email || "N/A"}

Please process this order.`;
  };

  const handleSendWhatsApp = () => {
    if (!selectedReseller || !selectedReseller.whatsappNumber) {
      alert("Selected reseller does not have a valid WhatsApp number.");
      return;
    }
    const text = encodeURIComponent(generateWhatsAppText());
    const cleanNumber = selectedReseller.whatsappNumber.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(generateWhatsAppText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    await createOrder(formData);
    
    setLoading(false);
    router.push("/orders");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Create New Order</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent-base)", marginBottom: "-8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>Customer Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Input name="customerName" label="Customer Name" placeholder="e.g. John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
            <Input name="phone" label="Customer Number (Phone)" placeholder="+1 234 567 890" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input name="email" label="Customer Email" type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Reseller (Optional)
              </label>
              <select name="resellerId" className="input-base" value={resellerId} onChange={e => setResellerId(e.target.value)}>
                <option value="">-- Direct Customer --</option>
                {resellers.map((reseller) => (
                  <option key={reseller.id} value={reseller.id}>
                    {reseller.name} {reseller.whatsappNumber ? "📱" : ""}
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
              <select name="subscriptionType" className="input-base" value={subscriptionType} onChange={e => setSubscriptionType(e.target.value)}>
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
              <select name="orderStatus" className="input-base" value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
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

          {selectedReseller && (
            <div style={{ padding: "16px", background: "rgba(0, 255, 136, 0.05)", border: "1px solid rgba(0, 255, 136, 0.2)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--accent-base)" }}>Reseller Communication: {selectedReseller.name}</div>
              <pre style={{ fontSize: "13px", color: "var(--text-secondary)", background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", fontFamily: "inherit" }}>
                {generateWhatsAppText()}
              </pre>
              <div style={{ display: "flex", gap: "12px" }}>
                <Button variant="outline" type="button" onClick={handleCopyMessage}>
                  {copied ? <Check size={16} /> : <Copy size={16} />} 
                  {copied ? "Copied!" : "Copy Message"}
                </Button>
                <Button variant="primary" type="button" onClick={handleSendWhatsApp} disabled={!selectedReseller.whatsappNumber}>
                  <Send size={16} /> Send to Reseller
                </Button>
              </div>
              {!selectedReseller.whatsappNumber && (
                <div style={{ fontSize: "12px", color: "#f87171" }}>* This reseller has no associated WhatsApp number.</div>
              )}
            </div>
          )}

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
              {loading ? "Creating Order..." : "Create Order"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
