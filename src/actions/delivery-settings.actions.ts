"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import {
  type CartDeliverySettings,
  DEFAULT_CART_DELIVERY_SETTINGS,
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

function readLocalSettings(): CartDeliverySettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          freeDeliveryPromoEnabled: Boolean(parsed.freeDeliveryPromoEnabled),
          threshold: typeof parsed.threshold === "number" ? parsed.threshold : DEFAULT_CART_DELIVERY_SETTINGS.threshold,
          promoText: parsed.promoText || DEFAULT_CART_DELIVERY_SETTINGS.promoText,
          successText: parsed.successText || DEFAULT_CART_DELIVERY_SETTINGS.successText,
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CART_DELIVERY_SETTINGS;
}

function writeLocalSettings(settings: CartDeliverySettings) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

/**
 * Returns current cart free delivery promo settings
 */
export async function getCartDeliverySettingsAction(): Promise<CartDeliverySettings> {
  const local = readLocalSettings();

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
            freeDeliveryPromoEnabled: Boolean(val.freeDeliveryPromoEnabled),
            threshold: typeof val.threshold === "number" ? val.threshold : DEFAULT_CART_DELIVERY_SETTINGS.threshold,
            promoText: val.promoText || DEFAULT_CART_DELIVERY_SETTINGS.promoText,
            successText: val.successText || DEFAULT_CART_DELIVERY_SETTINGS.successText,
          };
          writeLocalSettings(merged);
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

    writeLocalSettings(updated);

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

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/settings");

    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update delivery promo settings",
    };
  }
}

