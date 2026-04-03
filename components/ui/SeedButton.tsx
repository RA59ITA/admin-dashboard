"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { seedDatabase } from "@/app/seedActions";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    if (confirm("Are you sure you want to COMPLETELY wipe and seed the database with test data?")) {
      setLoading(true);
      await seedDatabase();
      setLoading(false);
      alert("Database successfully populated with realistic Test Data! Please refresh or navigate to verify.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSeed} disabled={loading} style={{ borderColor: "#f87171", color: "#f87171" }}>
      {loading ? "Seeding Data..." : "Load Demo Data"}
    </Button>
  );
}
