import type { Product } from "./product";
import type { CartDeliverySettings, FlashSaleCampaign } from "./delivery-settings";
import type { EffectivePriceResult } from "@/lib/promotions";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliverySettings: CartDeliverySettings;
  flashSaleCampaign: FlashSaleCampaign;
  getEffectivePrice: (product: Product) => EffectivePriceResult;
  deliveryFee: number;
  isFreeDeliveryQualified: boolean;
  grandTotal: number;
  refreshDeliverySettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}
