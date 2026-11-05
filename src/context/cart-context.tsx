"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { CartItem, CartState } from "@/types/cart";
import type { Product } from "@/types/product";
import {
  type CartDeliverySettings,
  type FlashSaleCampaign,
  DEFAULT_CART_DELIVERY_SETTINGS,
  DEFAULT_FLASH_SALE_CAMPAIGN,
} from "@/types/delivery-settings";
import {
  getCartDeliverySettingsAction,
  getFlashSaleCampaignAction,
} from "@/actions/delivery-settings.actions";
import {
  getProductEffectivePrice,
  type EffectivePriceResult,
} from "@/lib/promotions";
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
  const [flashSaleCampaign, setFlashSaleCampaign] = useState<FlashSaleCampaign>(
    DEFAULT_FLASH_SALE_CAMPAIGN
  );

  const refreshSettings = useCallback(async () => {
    try {
      const [delRes, fsRes] = await Promise.all([
        getCartDeliverySettingsAction(),
        getFlashSaleCampaignAction(),
      ]);
      if (delRes) {
        setDeliverySettings(delRes);
      }
      if (fsRes) {
        setFlashSaleCampaign(fsRes);
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  // Load from localStorage & fetch settings on mount
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

    refreshSettings();
  }, [refreshSettings]);

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

  const getEffectivePrice = useCallback(
    (product: Product): EffectivePriceResult => {
      return getProductEffectivePrice(product, flashSaleCampaign);
    },
    [flashSaleCampaign]
  );

  const addItem = (product: Product, quantity = 1) => {
    if (
      product.status === "out_of_stock" ||
      (typeof product.stock === "number" && product.stock <= 0)
    ) {
      toast.error(`"${product.name}" is currently Out of Stock.`);
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id
      );
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
          const maxStock =
            typeof item.product.stock === "number" ? item.product.stock : 99;
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

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Subtotal dynamically calculated with active flash sale campaign effective price
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const effective = getEffectivePrice(item.product);
      return sum + effective.price * item.quantity;
    }, 0);
  }, [items, getEffectivePrice]);

  // Delivery fee dynamically computed based on admin's base fee and free delivery threshold
  const baseFee = deliverySettings.baseDeliveryFee ?? 60;
  const isFreeDeliveryQualified = Boolean(
    deliverySettings.freeDeliveryPromoEnabled &&
      subtotal >= (deliverySettings.threshold ?? 500)
  );
  const deliveryFee = isFreeDeliveryQualified ? 0 : baseFee;
  const grandTotal = subtotal + deliveryFee;

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
        flashSaleCampaign,
        getEffectivePrice,
        deliveryFee,
        isFreeDeliveryQualified,
        grandTotal,
        refreshDeliverySettings: refreshSettings,
        refreshSettings,
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
