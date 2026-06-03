"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { placeOrder } from "../actions";
import { useRouter } from "next/navigation";

export type CartItem = {
  id: string; // generated client side just for list key
  productId: string;
  productName: string;
  orderedQuantity: number;
  orderedUnit: string;
  baseQuantity: number;
  pricePerBaseUnit: number;
  lineTotalInr: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
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

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("b2b-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("b2b-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
    setIsCartOpen(true);
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
      router.push("/dashboard/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
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
