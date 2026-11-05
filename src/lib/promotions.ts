import type { FlashSaleCampaign } from "@/types/delivery-settings";

export type FlashSaleStatus = "active" | "upcoming" | "expired" | "disabled";

export interface EffectivePriceResult {
  price: number;
  originalPrice: number;
  discountPercent: number;
  discountBadge: string;
  isFlashSale: boolean;
  savings: number;
  campaignName?: string;
}

/**
 * Checks if a given flash sale campaign is currently running based on the current time and its scheduled start/end dates.
 */
export function isFlashSaleActive(
  campaign?: FlashSaleCampaign | null,
  now = new Date()
): boolean {
  if (!campaign || !campaign.enabled) return false;
  if (!campaign.startDate || !campaign.endDate) return false;

  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  const current = now.getTime();

  if (isNaN(start) || isNaN(end)) return false;
  return current >= start && current <= end;
}

/**
 * Returns human-readable lifecycle state of the campaign:
 * - "disabled": switched off by admin
 * - "upcoming": scheduled in the future (not yet started)
 * - "active": currently live within date window
 * - "expired": ended (past end date)
 */
export function getFlashSaleStatus(
  campaign?: FlashSaleCampaign | null,
  now = new Date()
): FlashSaleStatus {
  if (!campaign || !campaign.enabled) return "disabled";
  if (!campaign.startDate || !campaign.endDate) return "disabled";

  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  const current = now.getTime();

  if (isNaN(start) || isNaN(end)) return "disabled";
  if (current < start) return "upcoming";
  if (current > end) return "expired";
  return "active";
}

/**
 * Validates if the campaign scope applies to a given product.
 */
export function doesCampaignApplyToProduct(
  product: { volume?: string; volume_display?: string; category?: string },
  scope: FlashSaleCampaign["scope"] = "all"
): boolean {
  if (scope === "all") return true;

  const vol = (product.volume || "").toLowerCase();
  const volDisplay = (product.volume_display || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();

  if (scope === "volume_50ml") {
    return (
      vol.includes("50") ||
      volDisplay.includes("50") ||
      cat.includes("mist") ||
      vol === "50ml"
    );
  }

  if (scope === "volume_85ml") {
    return (
      vol.includes("85") ||
      volDisplay.includes("85") ||
      cat.includes("perfume") ||
      vol === "85ml"
    );
  }

  return true;
}

/**
 * Computes the real effective selling price and savings for a fragrance entry.
 * When a scheduled campaign is active and applies to the product, automatically
 * returns the discounted price and badges.
 * When the campaign expires or is inactive, automatically restores regular price.
 */
export function getProductEffectivePrice(
  product: {
    price?: number;
    original_price?: number;
    volume?: string;
    volume_display?: string;
    category?: string;
  },
  campaign?: FlashSaleCampaign | null,
  now = new Date()
): EffectivePriceResult {
  const regularPrice =
    typeof product.price === "number" && product.price > 0 ? product.price : 199;

  const isActive = isFlashSaleActive(campaign, now);
  const applies =
    isActive && doesCampaignApplyToProduct(product, campaign?.scope ?? "all");

  if (applies && campaign) {
    let discountAmount = 0;

    if (campaign.discountType === "percentage") {
      const pct = Math.max(0, Math.min(99, campaign.discountValue));
      discountAmount = Math.round(regularPrice * (pct / 100));
    } else {
      // Fixed amount discount (in Pesos)
      discountAmount = Math.max(
        0,
        Math.min(regularPrice - 1, campaign.discountValue)
      );
    }

    const effectivePrice = Math.max(1, regularPrice - discountAmount);
    const discountPercent = Math.max(
      1,
      Math.round((discountAmount / regularPrice) * 100)
    );
    const discountBadge =
      campaign.discountType === "percentage"
        ? `-${discountPercent}%`
        : `-₱${discountAmount}`;

    return {
      price: effectivePrice,
      originalPrice: regularPrice,
      discountPercent,
      discountBadge,
      isFlashSale: true,
      savings: discountAmount,
      campaignName: campaign.name,
    };
  }

  // Fallback to standard catalog price & original catalog price
  const originalPrice =
    product.original_price && product.original_price > regularPrice
      ? product.original_price
      : Math.round(regularPrice * 1.25);

  const discountPercent =
    originalPrice > regularPrice
      ? Math.round(((originalPrice - regularPrice) / originalPrice) * 100)
      : 0;

  return {
    price: regularPrice,
    originalPrice,
    discountPercent,
    discountBadge: discountPercent > 0 ? `-${discountPercent}%` : "",
    isFlashSale: false,
    savings: 0,
  };
}

/**
 * Formats a Date object to "YYYY-MM-DDTHH:mm" for HTML datetime-local inputs in local timezone.
 */
export function toDateTimeLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

