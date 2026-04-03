"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateReseller } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Reseller } from "@prisma/client";

export default function EditResellerForm({ reseller }: { reseller: Reseller }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    await updateReseller(reseller.id, formData);
    
    setLoading(false);
    router.push("/resellers");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Card>
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Edit Reseller</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Input name="name" label="Reseller Name" defaultValue={reseller.name} required />
          <Input name="whatsappNumber" label="WhatsApp Number" defaultValue={reseller.whatsappNumber || ""} />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
              Notes
            </label>
            <textarea 
              name="notes" 
              className="input-base" 
              rows={4}
              defaultValue={reseller.notes || ""}
            ></textarea>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Reseller"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
