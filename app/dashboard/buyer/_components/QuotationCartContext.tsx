"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { requestQuotation } from "../actions";
import { useRouter } from "next/navigation";
import { toBaseQuantity } from "@/lib/units";

export type QuotationCartItem = {
  id: string; 
  productId: string;
  productName: string;
  baseUnit: string;
  orderedQuantity: number;
  orderedUnit: string;
  baseQuantity: number;
};

type QuotationCartContextType = {
  items: QuotationCartItem[];
  addItem: (item: Omit<QuotationCartItem, "id">) => void;
  updateItem: (id: string, updates: Partial<QuotationCartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  submitQuotation: () => Promise<void>;
  isSubmitting: boolean;
};

const QuotationCartContext = createContext<QuotationCartContextType | undefined>(undefined);

export function QuotationCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuotationCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("buyer-quotation-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("buyer-quotation-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<QuotationCartItem, "id">) => {
    const exists = items.find(i => i.productId === item.productId);
    if (!exists) {
      setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
    }
    setIsCartOpen(true);
  };

  const updateItem = (id: string, updates: Partial<QuotationCartItem>) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        
        if (updates.orderedQuantity !== undefined || updates.orderedUnit !== undefined) {
          try {
            updated.baseQuantity = toBaseQuantity(updated.orderedQuantity, updated.orderedUnit);
          } catch (e) {}
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const submitQuotation = async () => {
    if (items.length === 0) return;

    const invalidQty = items.find((i) => !i.orderedQuantity || i.orderedQuantity <= 0);
    if (invalidQty) {
      alert(`Enter a valid quantity for ${invalidQty.productName}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await requestQuotation(items);
      clearCart();
      setIsCartOpen(false);
      router.push("/dashboard/buyer/quotations");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to submit quotation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <QuotationCartContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        submitQuotation,
        isSubmitting,
      }}
    >
      {children}
    </QuotationCartContext.Provider>
  );
}

export function useQuotationCart() {
  const context = useContext(QuotationCartContext);
  if (context === undefined) {
    throw new Error("useQuotationCart must be used within a QuotationCartProvider");
  }
  return context;
}
