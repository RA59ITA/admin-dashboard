"use client";

import { deleteOrder } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export default function OrderDeleteButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: "#f87171" }}>
      Delete
    </Button>
  );
}
