"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "../actions";

export function DeleteProductButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button 
      variant="destructive" 
      size="sm"
      disabled={loading}
      onClick={async () => {
        if (confirm("Are you sure you want to delete this product?")) {
          setLoading(true);
          await deleteProduct(id);
          setLoading(false);
        }
      }}
    >
      Delete
    </Button>
  );
}
