"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "../actions";

export function UpdateStatusButton({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpdate(newStatus: "pending" | "confirmed" | "fulfilled") {
    setLoading(true);
    await updateOrderStatus(id, newStatus);
    setLoading(false);
  }

  if (currentStatus === "pending") {
    return (
      <Button 
        onClick={() => handleUpdate("confirmed")} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Mark as Confirmed
      </Button>
    );
  }

  if (currentStatus === "confirmed") {
    return (
      <Button 
        onClick={() => handleUpdate("fulfilled")} 
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        Mark as Fulfilled
      </Button>
    );
  }

  return null;
}
