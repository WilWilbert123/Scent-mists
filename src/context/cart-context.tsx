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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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

  // Real-time schedule ticker: keeps promotion windows accurate down to the exact second
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 3000);
    return () => clearInterval(timer);
  }, []);

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

  // Real-time synchronization across Supabase, browser tabs, and window focus
  useEffect(() => {
    // 1. Supabase Postgres changes subscription
    const supabase = createSupabaseBrowserClient();
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    if (supabase) {
      channel = supabase
        .channel("promotions-and-settings-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "site_content",
          },
          (payload) => {
            const row = payload.new as
              | { content_key?: string; content_value?: unknown }
              | undefined;
            if (!row || !row.content_key) return;

            if (
              row.content_key === "flash_sale_campaign" &&
              row.content_value &&
              typeof row.content_value === "object"
            ) {
              setFlashSaleCampaign(row.content_value as FlashSaleCampaign);
            } else if (
              row.content_key === "cart_delivery_settings" &&
              row.content_value &&
              typeof row.content_value === "object"
            ) {
              setDeliverySettings(row.content_value as CartDeliverySettings);
            }
          }
        )
        .subscribe();
    }

    // 2. Cross-tab BroadcastChannel for 0ms multi-tab sync
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("scent_mists_promotions_channel");
        bc.onmessage = (event) => {
          if (event.data?.type === "FLASH_SALE_UPDATED" && event.data.payload) {
            setFlashSaleCampaign(event.data.payload);
          } else if (event.data?.type === "DELIVERY_UPDATED" && event.data.payload) {
            setDeliverySettings(event.data.payload);
          } else if (event.data?.type === "SETTINGS_SYNC") {
            void refreshSettings();
          }
        };
      }
    } catch {
      // ignore
    }

    // 3. Storage event listener (fallback cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "scent_mists_promo_sync_timestamp") {
        void refreshSettings();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Custom window event (for same-window instant dispatch from admin actions)
    const handleCustomSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ flashSale?: FlashSaleCampaign; delivery?: CartDeliverySettings }>;
      if (customEvent.detail?.flashSale) {
        setFlashSaleCampaign(customEvent.detail.flashSale);
      } else if (customEvent.detail?.delivery) {
        setDeliverySettings(customEvent.detail.delivery);
      } else {
        void refreshSettings();
      }
    };
    window.addEventListener("scent_mists_flash_sale_updated", handleCustomSync);

    // 5. Window focus and visibility change (auto-refresh when customer returns to tab)
    const handleFocus = () => {
      void refreshSettings();
    };
    window.addEventListener("focus", handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshSettings();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (supabase && channel) {
        void supabase.removeChannel(channel);
      }
      if (bc) {
        bc.close();
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("scent_mists_flash_sale_updated", handleCustomSync);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshSettings]);

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
      return getProductEffectivePrice(product, flashSaleCampaign, currentTime);
    },
    [flashSaleCampaign, currentTime]
  );

  const addItem = (product: Product, quantity = 1) => {
    if (
      product.status === "out_of_stock" ||
      (typeof product.stock === "number" && product.stock <= 0)
    ) {
      toast.error(`"${product.name}" is currently Out of Stock.`, {
        id: `cart-stock-${product.id}`,
      });
      return;
    }

    const maxStock = typeof product.stock === "number" ? product.stock : 99;
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      const currentQty = existingItem.quantity;
      const newQty = Math.min(currentQty + quantity, maxStock);
      if (newQty === currentQty) {
        toast.warning(`Maximum available stock reached (${maxStock} items).`, {
          id: `cart-max-${product.id}`,
        });
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        )
      );
      toast.success(`Updated "${product.name}" quantity (${newQty} in cart).`, {
        id: `cart-${product.id}`,
      });
    } else {
      const initialQty = Math.min(quantity, maxStock);
      const newItem: CartItem = {
        product,
        quantity: initialQty,
        selectedSize: product.volume,
      };

      setItems((prev) => [...prev, newItem]);
      toast.success(`Added "${product.name}" to cart.`, {
        id: `cart-${product.id}`,
      });
    }
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info("Item removed from cart.", {
      id: `cart-remove-${productId}`,
    });
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
