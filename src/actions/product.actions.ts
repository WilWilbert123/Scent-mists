"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { SAMPLE_PRODUCTS } from "@/data/products";
import type { Product, ProductFormValues } from "@/types/product";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const LOCAL_CATALOG_FILE = path.join(DATA_DIR, "catalog.json");

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

function readLocalCatalog(): Product[] | null {
  try {
    if (fs.existsSync(LOCAL_CATALOG_FILE)) {
      const data = fs.readFileSync(LOCAL_CATALOG_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

function writeLocalCatalog(products: Product[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CATALOG_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

function normalizeProduct(p: Partial<Product>): Product {
  const stock = typeof p.stock === "number" ? p.stock : 20;
  const status =
    p.status || (stock <= 0 ? "out_of_stock" : stock <= 10 ? "low_stock" : "in_stock");

  return {
    id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: p.name || "Untitled Fragrance",
    slug: p.slug || (p.name || "fragrance").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    brand: p.brand || "SCENTS & MISTS",
    sku: p.sku || "SCENT-01",
    volume: p.volume || "50ml",
    volume_display: p.volume_display || (p.volume === "85ml" ? "85 ml / 2.9 fl. oz." : "50 ml / 1.7 fl. oz."),
    category: p.category || (p.volume === "85ml" ? "perfume" : "mist"),
    gender: p.gender || "female",
    price: typeof p.price === "number" ? p.price : 199,
    original_price: typeof p.original_price === "number" ? p.original_price : (p.price ? Math.round(p.price * 1.25) : 250),
    stock,
    status,
    sold_count: typeof p.sold_count === "number" ? p.sold_count : 0,
    rating: typeof p.rating === "number" ? p.rating : 0,
    rating_count: typeof p.rating_count === "number" ? p.rating_count : 0,
    is_main_male: Boolean(p.is_main_male),
    is_main_female: Boolean(p.is_main_female),
    subtitle: p.subtitle || (p.volume === "85ml" ? "Eau de Parfum" : "Aroma Body Mist"),
    description: p.description || "",
    fragrance_family: p.fragrance_family || "Floral",
    scent_profile: p.scent_profile || "",
    top_notes: Array.isArray(p.top_notes) ? p.top_notes : [],
    heart_notes: Array.isArray(p.heart_notes) ? p.heart_notes : [],
    base_notes: Array.isArray(p.base_notes) ? p.base_notes : [],
    image_url: p.image_url || `/images/perfumes/${p.slug}.webp`,
    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : [p.image_url || `/images/perfumes/${p.slug}.webp`],
    collection_id: p.collection_id || null,
    collection_slug: p.collection_slug || "",
    concentration: p.concentration || (p.volume === "85ml" ? "Eau de Parfum" : "Aroma Body Mist"),
    is_featured: Boolean(p.is_featured),
    is_published: p.is_published !== false,
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString(),
  };
}

/**
 * Loads the complete master catalog from Supabase site_content, falling back to local file or SAMPLE_PRODUCTS
 */
export async function getMasterCatalog(): Promise<Product[]> {
  const local = readLocalCatalog();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        const client = supabase as unknown as SupabaseContentClient;
        const { data, error } = await client
          .from("site_content")
          .select("content_value")
          .eq("content_key", "catalog_products")
          .maybeSingle();

        if (!error && data?.content_value && Array.isArray(data.content_value) && data.content_value.length > 0) {
          const list = (data.content_value as Product[]).map(normalizeProduct);
          writeLocalCatalog(list);
          return list;
        }

        // If not initialized in Supabase yet, seed it with SAMPLE_PRODUCTS
        await client
          .from("site_content")
          .upsert({
            content_key: "catalog_products",
            content_value: SAMPLE_PRODUCTS,
            updated_at: new Date().toISOString(),
          });
      }
    } catch {
      // ignore
    }
  }

  if (local && local.length >= SAMPLE_PRODUCTS.length) {
    return local;
  }

  // Write default to local storage
  writeLocalCatalog(SAMPLE_PRODUCTS);
  return SAMPLE_PRODUCTS.map(normalizeProduct);
}

export async function saveMasterCatalog(products: Product[]): Promise<boolean> {
  const normalized = products.map(normalizeProduct);
  writeLocalCatalog(normalized);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        const client = supabase as unknown as SupabaseContentClient;
        await client
          .from("site_content")
          .upsert({
            content_key: "catalog_products",
            content_value: normalized,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (e) {
      console.error("Failed to save catalog to Supabase:", e);
    }
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return true;
}

export async function getPublicProductsAction(): Promise<Product[]> {
  const catalog = await getMasterCatalog();
  return catalog.filter((p) => p.is_published);
}

export async function getPublicProductBySlugAction(slug: string): Promise<Product | null> {
  const catalog = await getMasterCatalog();
  const found = catalog.find((p) => p.slug === slug);
  return found || null;
}

export async function getAdminProductsAction(): Promise<{
  products: Product[];
  isDatabaseConnected: boolean;
}> {
  const catalog = await getMasterCatalog();
  return {
    products: catalog,
    isDatabaseConnected: isSupabaseConfigured(),
  };
}

export async function getAdminProductByIdAction(id: string): Promise<{
  product: Product | null;
  isDatabaseConnected: boolean;
}> {
  const catalog = await getMasterCatalog();
  const product = catalog.find((p) => p.id === id) || null;
  return {
    product,
    isDatabaseConnected: isSupabaseConfigured(),
  };
}

export async function createProductAction(
  rawValues: ProductFormValues
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const catalog = await getMasterCatalog();
    const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newProduct = normalizeProduct({
      ...rawValues,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    catalog.unshift(newProduct);
    await saveMasterCatalog(catalog);

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return { success: false, error: message };
  }
}

export async function updateProductAction(
  id: string,
  rawValues: Partial<ProductFormValues>
): Promise<{ success: boolean; error?: string }> {
  try {
    const catalog = await getMasterCatalog();
    const index = catalog.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: "Product not found." };
    }

    catalog[index] = normalizeProduct({
      ...catalog[index],
      ...rawValues,
      updated_at: new Date().toISOString(),
    });

    await saveMasterCatalog(catalog);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return { success: false, error: message };
  }
}

export async function updateProductStockAction(
  id: string,
  stock: number,
  status?: "in_stock" | "low_stock" | "out_of_stock"
): Promise<{ success: boolean; error?: string }> {
  try {
    const catalog = await getMasterCatalog();
    const index = catalog.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: "Product not found." };
    }

    const calculatedStatus =
      status || (stock <= 0 ? "out_of_stock" : stock <= 15 ? "low_stock" : "in_stock");

    catalog[index] = {
      ...catalog[index],
      stock,
      status: calculatedStatus,
      updated_at: new Date().toISOString(),
    };

    await saveMasterCatalog(catalog);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update stock.";
    return { success: false, error: message };
  }
}

export async function deleteProductAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const catalog = await getMasterCatalog();
    const filtered = catalog.filter((p) => p.id !== id);
    await saveMasterCatalog(filtered);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return { success: false, error: message };
  }
}
