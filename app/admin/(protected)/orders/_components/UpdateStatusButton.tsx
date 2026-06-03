"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "../actions";

export function UpdateStatusButton({
  id,
  currentStatus,
  isBuyerQuotationPending = false,
}: {
  id: string;
  currentStatus: string;
  isBuyerQuotationPending?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(newStatus: "pending" | "confirmed" | "fulfilled") {
    setLoading(true);
    setError("");
    try {
      await updateOrderStatus(id, newStatus);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "pending") {
    if (isBuyerQuotationPending) {
      return (
        <p className="text-xs text-zinc-500 max-w-[200px] text-right">
          Use the pricing form below to confirm this quotation.
        </p>
      );
    }

    return (
      <div className="flex flex-col items-end gap-2">
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button
          onClick={() => handleUpdate("confirmed")}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Mark as Confirmed"}
        </Button>
      </div>
    );
  }

  if (currentStatus === "confirmed") {
    return (
      <div className="flex flex-col items-end gap-2">
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button
          onClick={() => handleUpdate("fulfilled")}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? "Updating..." : "Mark as Fulfilled"}
        </Button>
      </div>
    );
  }

  return null;
}
