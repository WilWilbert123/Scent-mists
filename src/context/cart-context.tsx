"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartItem, CartState } from "@/types/cart";
import type { Product } from "@/types/product";
import {
  type CartDeliverySettings,
  DEFAULT_CART_DELIVERY_SETTINGS,
} from "@/types/delivery-settings";
import { getCartDeliverySettingsAction } from "@/actions/delivery-settings.actions";
import { toast } from "@/components/ui/toast";

const CartContext = createContext<CartState | undefined>(undefined);

const CART_STORAGE_KEY = "scent_mists_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState<CartDeliverySettings>(
    DEFAULT_CART_DELIVERY_SETTINGS
  );

  const refreshDeliverySettings = useCallback(async () => {
    try {
      const res = await getCartDeliverySettingsAction();
      if (res) {
        setDeliverySettings(res);
      }
    } catch {
      // fallback
    }
  }, []);

  // Load from localStorage & fetch delivery settings on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore
    }

    refreshDeliverySettings();
  }, [refreshDeliverySettings]);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, isMounted]);

  const addItem = (product: Product, quantity = 1) => {
    if (product.status === "out_of_stock" || (typeof product.stock === "number" && product.stock <= 0)) {
      toast.error(`"${product.name}" is currently Out of Stock.`);
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      const maxStock = typeof product.stock === "number" ? product.stock : 99;

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, maxStock);
        if (newQty === currentQty) {
          toast.warning(`Maximum available stock reached (${maxStock} items).`);
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        toast.success(`Updated "${product.name}" quantity (${newQty} in cart).`);
        return updated;
      } else {
        const initialQty = Math.min(quantity, maxStock);
        const newItem: CartItem = {
          product,
          quantity: initialQty,
          selectedSize: product.volume,
        };
        toast.success(`Added "${product.name}" to cart.`);
        setIsCartOpen(true);
        return [...prev, newItem];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info("Item removed from cart.");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = typeof item.product.stock === "number" ? item.product.stock : 99;
          const cappedQty = Math.min(quantity, maxStock);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price || 199) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        deliverySettings,
        refreshDeliverySettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
