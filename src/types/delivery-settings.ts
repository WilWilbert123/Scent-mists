export interface CartDeliverySettings {
  baseDeliveryFee: number;
  freeDeliveryPromoEnabled: boolean;
  threshold: number;
  promoText: string;
  successText: string;
}

export interface FlashSaleCampaign {
  enabled: boolean;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string; // ISO string or datetime-local string (e.g., "2026-11-15T00:00")
  endDate: string; // ISO string or datetime-local string (e.g., "2026-11-15T23:59")
  scope: "all" | "volume_50ml" | "volume_85ml";
  bannerText: string;
}

export interface StorePromoAndDeliverySettings {
  delivery: CartDeliverySettings;
  flashSale: FlashSaleCampaign;
}

export const DEFAULT_CART_DELIVERY_SETTINGS: CartDeliverySettings = {
  baseDeliveryFee: 60, // Default base courier delivery fee in Pesos
  freeDeliveryPromoEnabled: false, // DISABLED BY DEFAULT (removed from cart unless admin enables)
  threshold: 500,
  promoText: "Add ₱{amount} more for FREE Delivery",
  successText: "🎉 Congratulations! You qualify for FREE Delivery!",
};

export const DEFAULT_FLASH_SALE_CAMPAIGN: FlashSaleCampaign = {
  enabled: false,
  name: "Exclusive Flash Sale",
  discountType: "percentage",
  discountValue: 20,
  startDate: "",
  endDate: "",
  scope: "all",
  bannerText: "⚡ FLASH SALE LIVE: Special promotional prices applied to our signature collection!",
};
