"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { placeOrder } from "../actions";
import { useRouter } from "next/navigation";
import { toBaseQuantity, calcLineTotal } from "@/lib/units";

export type CartItem = {
  id: string; 
  productId: string;
  productName: string;
  baseUnit: string;
  pricePerBaseUnit: number;
  stockQuantity: number; // for validation
  orderedQuantity: number;
  orderedUnit: string;
  baseQuantity: number;
  lineTotalInr: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  submitOrder: () => Promise<void>;
  isSubmitting: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("seller-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("seller-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "id">) => {
    // If it already exists, just open the cart
    const exists = items.find(i => i.productId === item.productId);
    if (!exists) {
      setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
    }
    setIsCartOpen(true);
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        
        // Recalculate if qty or unit changes
        if (updates.orderedQuantity !== undefined || updates.orderedUnit !== undefined) {
          try {
            updated.baseQuantity = toBaseQuantity(updated.orderedQuantity, updated.orderedUnit);
            updated.lineTotalInr = calcLineTotal(updated.baseQuantity, updated.pricePerBaseUnit);
          } catch (e) {
            // invalid unit or qty
          }
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

  const submitOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      await placeOrder(items);
      clearCart();
      setIsCartOpen(false);
      router.push("/dashboard/seller/orders");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        submitOrder,
        isSubmitting,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
