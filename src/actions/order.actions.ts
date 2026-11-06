"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import type { Order, OrderStatus, CreateOrderInput } from "@/types/order";
import { getCartDeliverySettingsAction } from "./delivery-settings.actions";
import { getMasterCatalog, saveMasterCatalog } from "./product.actions";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

interface SupabaseContentClient {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { content_value: unknown } | null; error: unknown }>;
      };
    };
    upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ error: unknown }>;
    insert: (values: Record<string, unknown>) => Promise<{ error: unknown }>;
  };
}

function readLocalOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

function writeLocalOrders(orders: Order[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

/**
 * Retrieves all orders from Supabase site_content with local fallback
 */
export async function getOrdersAction(): Promise<Order[]> {
  const local = readLocalOrders();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        const client = supabase as unknown as SupabaseContentClient;
        const { data, error } = await client
          .from("site_content")
          .select("content_value")
          .eq("content_key", "orders_list")
          .maybeSingle();

        if (!error && data?.content_value && Array.isArray(data.content_value)) {
          const list = data.content_value as Order[];
          writeLocalOrders(list);
          return list;
        }
      }
    } catch {
      // fallback
    }
  }

  return local;
}

export async function saveOrders(orders: Order[]): Promise<void> {
  writeLocalOrders(orders);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        const client = supabase as unknown as SupabaseContentClient;
        const { error: upsertErr } = await client.from("site_content").upsert(
          {
            content_key: "orders_list",
            content_value: orders,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "content_key" }
        );
        if (upsertErr) {
          console.error("Failed to save orders to Supabase site_content:", upsertErr);
        }
      }
    } catch (e) {
      console.error("Failed to save orders to Supabase:", e);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    if (!input.customer_name?.trim()) {
      return { success: false, error: "Customer name is required." };
    }
    if (!input.phone?.trim()) {
      return { success: false, error: "Valid contact phone number is required." };
    }
    if (!input.delivery_address?.trim()) {
      return { success: false, error: "Delivery address is required." };
    }
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Your shopping cart is empty." };
    }

    const subtotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Dynamic Courier Delivery Fee & Threshold loaded from Admin Settings
    const deliverySettings = await getCartDeliverySettingsAction();
    const baseDeliveryFee = deliverySettings.baseDeliveryFee ?? 60;
    const isFreeEligible = Boolean(
      deliverySettings.freeDeliveryPromoEnabled &&
      subtotal >= (deliverySettings.threshold ?? 500)
    );
    const delivery_fee = isFreeEligible ? 0 : baseDeliveryFee;
    const discount_amount = isFreeEligible ? baseDeliveryFee : 0;
    const total_amount = subtotal + delivery_fee;

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const order_number = `SCENT-${new Date().getFullYear()}-${randomCode}`;

    const newOrder: Order = {
      id: orderId,
      order_number,
      customer_name: input.customer_name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      delivery_address: input.delivery_address.trim(),
      landmark: input.landmark?.trim() || "No landmark specified",
      delivery_location: {
        lat: input.delivery_location?.lat || 14.5995,
        lng: input.delivery_location?.lng || 120.9842,
        address_text: input.delivery_location?.address_text || input.delivery_address,
      },
      items: input.items,
      subtotal,
      delivery_fee,
      discount_amount,
      total_amount,
      payment_method: input.payment_method || "cod",
      notes: input.notes?.trim() || undefined,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Save into Orders list
    const existingOrders = await getOrdersAction();
    existingOrders.unshift(newOrder);
    await saveOrders(existingOrders);

    // 2. Decrement product stock in catalog
    try {
      const catalog = await getMasterCatalog();
      let catalogChanged = false;

      for (const orderedItem of input.items) {
        const productIndex = catalog.findIndex(
          (p) => p.id === orderedItem.product_id || p.sku === orderedItem.sku
        );
        if (productIndex !== -1) {
          const currentStock = catalog[productIndex].stock ?? 25;
          const newStock = Math.max(0, currentStock - orderedItem.quantity);
          catalog[productIndex].stock = newStock;
          catalog[productIndex].sold_count =
            (catalog[productIndex].sold_count ?? 0) + orderedItem.quantity;
          if (newStock === 0) {
            catalog[productIndex].status = "out_of_stock";
          } else if (newStock <= 10) {
            catalog[productIndex].status = "low_stock";
          }
          catalogChanged = true;
        }
      }

      if (catalogChanged) {
        await saveMasterCatalog(catalog);
      }
    } catch (stockErr) {
      console.warn("Could not auto-decrement stock:", stockErr);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    revalidatePath(`/orders/${newOrder.order_number}`);

    return { success: true, order: newOrder };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to place order.";
    return { success: false, error: message };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const orders = await getOrdersAction();
    const clean = (orderId || "").trim().toLowerCase();
    const index = orders.findIndex(
      (o) => o.id.toLowerCase() === clean || o.order_number.toLowerCase() === clean
    );
    if (index === -1) {
      return { success: false, error: "Order not found." };
    }

    orders[index].status = newStatus;
    orders[index].updated_at = new Date().toISOString();
    await saveOrders(orders);

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/products");
    revalidatePath("/orders");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath(`/orders/${orders[index].order_number}`);
    revalidatePath(`/orders/${orders[index].id}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status.";
    return { success: false, error: message };
  }
}

export async function bulkUpdateOrderStatusAction(
  orderIds: string[],
  newStatus: OrderStatus
): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  try {
    if (!orderIds || orderIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }
    const orders = await getOrdersAction();
    const idSet = new Set(orderIds.map((id) => (id || "").trim().toLowerCase()));

    let updatedCount = 0;
    const now = new Date().toISOString();
    for (const order of orders) {
      if (
        idSet.has(order.id.toLowerCase()) ||
        idSet.has(order.order_number.toLowerCase())
      ) {
        order.status = newStatus;
        order.updated_at = now;
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      await saveOrders(orders);
      revalidatePath("/admin");
      revalidatePath("/admin/orders");
      revalidatePath("/orders");
      for (const order of orders) {
        if (
          idSet.has(order.id.toLowerCase()) ||
          idSet.has(order.order_number.toLowerCase())
        ) {
          revalidatePath(`/orders/${order.order_number}`);
          revalidatePath(`/orders/${order.id}`);
        }
      }
    }

    return { success: true, updatedCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to bulk update orders.";
    return { success: false, updatedCount: 0, error: message };
  }
}

export async function getOrderByIdAction(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  const orders = await getOrdersAction();
  const clean = orderId.trim().toLowerCase();
  return (
    orders.find(
      (o) =>
        o.id.toLowerCase() === clean ||
        o.order_number.toLowerCase() === clean
    ) || null
  );
}

export async function getOrdersByNumbersAction(orderNumbers: string[]): Promise<Order[]> {
  if (!orderNumbers || orderNumbers.length === 0) return [];
  const orders = await getOrdersAction();
  const set = new Set(orderNumbers.map((n) => n.trim().toLowerCase()));
  return orders.filter(
    (o) => set.has(o.order_number.toLowerCase()) || set.has(o.id.toLowerCase())
  );
}

export async function searchOrdersAction(query: string): Promise<Order[]> {
  const clean = (query || "").trim().toLowerCase();
  if (!clean) return [];
  const orders = await getOrdersAction();
  return orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(clean) ||
      o.phone.includes(clean) ||
      o.customer_name.toLowerCase().includes(clean)
  );
}
