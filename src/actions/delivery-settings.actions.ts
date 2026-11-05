"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient, recordAuditLog, verifyServerAdmin } from "@/lib/supabase/admin";
import {
  type CartDeliverySettings,
  type FlashSaleCampaign,
  type StorePromoAndDeliverySettings,
  DEFAULT_CART_DELIVERY_SETTINGS,
  DEFAULT_FLASH_SALE_CAMPAIGN,
} from "@/types/delivery-settings";

const DATA_DIR = path.resolve(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

interface SupabaseContentClient {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { content_value: unknown } | null; error: unknown }>;
      };
    };
    upsert: (values: Record<string, unknown>) => Promise<{ error: unknown }>;
  };
}

interface LocalSettingsFileFormat {
  baseDeliveryFee?: number;
  freeDeliveryPromoEnabled?: boolean;
  threshold?: number;
  promoText?: string;
  successText?: string;
  flashSale?: Partial<FlashSaleCampaign>;
}

function readLocalFullSettings(): {
  delivery: CartDeliverySettings;
  flashSale: FlashSaleCampaign;
} {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw) as LocalSettingsFileFormat;
      if (parsed && typeof parsed === "object") {
        const delivery: CartDeliverySettings = {
          baseDeliveryFee:
            typeof parsed.baseDeliveryFee === "number" && parsed.baseDeliveryFee >= 0
              ? parsed.baseDeliveryFee
              : DEFAULT_CART_DELIVERY_SETTINGS.baseDeliveryFee,
          freeDeliveryPromoEnabled: Boolean(parsed.freeDeliveryPromoEnabled),
          threshold:
            typeof parsed.threshold === "number" && parsed.threshold >= 0
              ? parsed.threshold
              : DEFAULT_CART_DELIVERY_SETTINGS.threshold,
          promoText: parsed.promoText || DEFAULT_CART_DELIVERY_SETTINGS.promoText,
          successText: parsed.successText || DEFAULT_CART_DELIVERY_SETTINGS.successText,
        };

        const rawFs = parsed.flashSale;
        const flashSale: FlashSaleCampaign = {
          enabled: Boolean(rawFs?.enabled),
          name: rawFs?.name || DEFAULT_FLASH_SALE_CAMPAIGN.name,
          discountType:
            rawFs?.discountType === "fixed" ? "fixed" : "percentage",
          discountValue:
            typeof rawFs?.discountValue === "number"
              ? rawFs.discountValue
              : DEFAULT_FLASH_SALE_CAMPAIGN.discountValue,
          startDate: rawFs?.startDate || "",
          endDate: rawFs?.endDate || "",
          scope:
            rawFs?.scope === "volume_50ml" || rawFs?.scope === "volume_85ml"
              ? rawFs.scope
              : "all",
          bannerText:
            rawFs?.bannerText || DEFAULT_FLASH_SALE_CAMPAIGN.bannerText,
        };

        return { delivery, flashSale };
      }
    }
  } catch {
    // fallback
  }

  return {
    delivery: DEFAULT_CART_DELIVERY_SETTINGS,
    flashSale: DEFAULT_FLASH_SALE_CAMPAIGN,
  };
}

function writeLocalFullSettings(data: {
  delivery: CartDeliverySettings;
  flashSale: FlashSaleCampaign;
}) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = {
      baseDeliveryFee: data.delivery.baseDeliveryFee,
      freeDeliveryPromoEnabled: data.delivery.freeDeliveryPromoEnabled,
      threshold: data.delivery.threshold,
      promoText: data.delivery.promoText,
      successText: data.delivery.successText,
      flashSale: data.flashSale,
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

/**
 * Returns current cart free delivery promo and courier base fee settings
 */
export async function getCartDeliverySettingsAction(): Promise<CartDeliverySettings> {
  const local = readLocalFullSettings().delivery;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        const client = supabase as unknown as SupabaseContentClient;
        const { data, error } = await client
          .from("site_content")
          .select("content_value")
          .eq("content_key", "cart_delivery_settings")
          .maybeSingle();

        if (!error && data?.content_value && typeof data.content_value === "object") {
          const val = data.content_value as Partial<CartDeliverySettings>;
          const merged: CartDeliverySettings = {
            baseDeliveryFee:
              typeof val.baseDeliveryFee === "number" && val.baseDeliveryFee >= 0
                ? val.baseDeliveryFee
                : local.baseDeliveryFee,
            freeDeliveryPromoEnabled:
              typeof val.freeDeliveryPromoEnabled === "boolean"
                ? val.freeDeliveryPromoEnabled
                : local.freeDeliveryPromoEnabled,
            threshold:
              typeof val.threshold === "number" && val.threshold >= 0
                ? val.threshold
                : local.threshold,
            promoText: val.promoText || local.promoText,
            successText: val.successText || local.successText,
          };
          const full = readLocalFullSettings();
          writeLocalFullSettings({ ...full, delivery: merged });
          return merged;
        }
      }
    } catch {
      // ignore
    }
  }

  return local;
}

/**
 * Updates cart delivery settings from admin dashboard
 */
export async function updateCartDeliverySettingsAction(
  updates: Partial<CartDeliverySettings>
): Promise<{ success: boolean; data?: CartDeliverySettings; error?: string }> {
  try {
    const current = await getCartDeliverySettingsAction();
    const updated: CartDeliverySettings = {
      baseDeliveryFee:
        typeof updates.baseDeliveryFee === "number" && updates.baseDeliveryFee >= 0
          ? updates.baseDeliveryFee
          : current.baseDeliveryFee,
      freeDeliveryPromoEnabled:
        typeof updates.freeDeliveryPromoEnabled === "boolean"
          ? updates.freeDeliveryPromoEnabled
          : current.freeDeliveryPromoEnabled,
      threshold:
        typeof updates.threshold === "number" && updates.threshold >= 0
          ? updates.threshold
          : current.threshold,
      promoText: updates.promoText?.trim() || current.promoText,
      successText: updates.successText?.trim() || current.successText,
    };

    const full = readLocalFullSettings();
    writeLocalFullSettings({ ...full, delivery: updated });

    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
        if (supabase) {
          const client = supabase as unknown as SupabaseContentClient;
          await client.from("site_content").upsert({
            content_key: "cart_delivery_settings",
            content_value: updated,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        // ignore
      }
    }

    try {
      const auth = await verifyServerAdmin();
      if (auth.authorized && auth.admin) {
        await recordAuditLog({
          adminUserId: auth.admin.id,
          action: "DELIVERY_SETTINGS_UPDATED",
          resourceType: "settings",
          resourceId: "cart_delivery_settings",
          metadata: updated as unknown as Record<string, unknown>,
        });
      }
    } catch {
      // ignore
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/checkout");
    revalidatePath("/admin/settings");

    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update delivery promo settings",
    };
  }
}

/**
 * Returns current flash sale campaign settings
 */
export async function getFlashSaleCampaignAction(): Promise<FlashSaleCampaign> {
  const local = readLocalFullSettings().flashSale;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        const client = supabase as unknown as SupabaseContentClient;
        const { data, error } = await client
          .from("site_content")
          .select("content_value")
          .eq("content_key", "flash_sale_campaign")
          .maybeSingle();

        if (!error && data?.content_value && typeof data.content_value === "object") {
          const val = data.content_value as Partial<FlashSaleCampaign>;
          const merged: FlashSaleCampaign = {
            enabled: Boolean(val.enabled),
            name: val.name?.trim() || local.name,
            discountType: val.discountType === "fixed" ? "fixed" : "percentage",
            discountValue:
              typeof val.discountValue === "number" && val.discountValue >= 0
                ? val.discountValue
                : local.discountValue,
            startDate: val.startDate || local.startDate,
            endDate: val.endDate || local.endDate,
            scope:
              val.scope === "volume_50ml" || val.scope === "volume_85ml"
                ? val.scope
                : "all",
            bannerText: val.bannerText?.trim() || local.bannerText,
          };
          const full = readLocalFullSettings();
          writeLocalFullSettings({ ...full, flashSale: merged });
          return merged;
        }
      }
    } catch {
      // ignore
    }
  }

  return local;
}

/**
 * Updates flash sale campaign settings from admin dashboard
 */
export async function updateFlashSaleCampaignAction(
  updates: Partial<FlashSaleCampaign>
): Promise<{ success: boolean; data?: FlashSaleCampaign; error?: string }> {
  try {
    const current = await getFlashSaleCampaignAction();
    const updated: FlashSaleCampaign = {
      enabled:
        typeof updates.enabled === "boolean" ? updates.enabled : current.enabled,
      name: updates.name?.trim() || current.name,
      discountType:
        updates.discountType === "fixed" ? "fixed" : "percentage",
      discountValue:
        typeof updates.discountValue === "number" && updates.discountValue >= 0
          ? updates.discountValue
          : current.discountValue,
      startDate: updates.startDate !== undefined ? updates.startDate : current.startDate,
      endDate: updates.endDate !== undefined ? updates.endDate : current.endDate,
      scope:
        updates.scope === "volume_50ml" || updates.scope === "volume_85ml"
          ? updates.scope
          : "all",
      bannerText: updates.bannerText?.trim() || current.bannerText,
    };

    const full = readLocalFullSettings();
    writeLocalFullSettings({ ...full, flashSale: updated });

    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
        if (supabase) {
          const client = supabase as unknown as SupabaseContentClient;
          await client.from("site_content").upsert({
            content_key: "flash_sale_campaign",
            content_value: updated,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        // ignore
      }
    }

    try {
      const auth = await verifyServerAdmin();
      if (auth.authorized && auth.admin) {
        await recordAuditLog({
          adminUserId: auth.admin.id,
          action: "FLASH_SALE_CAMPAIGN_UPDATED",
          resourceType: "promotions",
          resourceId: "flash_sale_campaign",
          metadata: updated as unknown as Record<string, unknown>,
        });
      }
    } catch {
      // ignore
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/collections");
    revalidatePath("/checkout");
    revalidatePath("/admin/settings");

    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update flash sale campaign",
    };
  }
}

/**
 * Returns full store promo and delivery settings
 */
export async function getStorePromoAndDeliverySettingsAction(): Promise<StorePromoAndDeliverySettings> {
  const [delivery, flashSale] = await Promise.all([
    getCartDeliverySettingsAction(),
    getFlashSaleCampaignAction(),
  ]);
  return { delivery, flashSale };
}
