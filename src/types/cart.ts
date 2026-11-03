import type { Product } from "./product";
import type { CartDeliverySettings } from "./delivery-settings";

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
  refreshDeliverySettings: () => Promise<void>;
}
