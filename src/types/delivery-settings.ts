export interface CartDeliverySettings {
  freeDeliveryPromoEnabled: boolean;
  threshold: number;
  promoText: string;
  successText: string;
}

export const DEFAULT_CART_DELIVERY_SETTINGS: CartDeliverySettings = {
  freeDeliveryPromoEnabled: false, // DISABLED BY DEFAULT (removed from cart unless admin enables)
  threshold: 500,
  promoText: "Add ₱{amount} more for FREE Delivery",
  successText: "🎉 Congratulations! You qualify for FREE Delivery!",
};

