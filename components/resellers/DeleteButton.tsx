"use client";

import { deleteReseller } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export default function DeleteResellerButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this reseller?")) {
      await deleteReseller(id);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: "#f87171" }}>
      Delete
    </Button>
  );
}
