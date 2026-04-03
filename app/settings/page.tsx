import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Settings</h2>
      </div>

      <Card>
        <h3 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "20px" }}>Profile Configuration</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input label="Admin Name" defaultValue="Super Admin" />
          <Input label="Email Address" defaultValue="admin@example.com" />
          <Button variant="primary" style={{ marginTop: "16px", alignSelf: "flex-start" }}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
