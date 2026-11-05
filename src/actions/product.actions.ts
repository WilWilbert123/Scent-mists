"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { SAMPLE_PRODUCTS } from "@/data/products";
import type { Product, ProductFormValues } from "@/types/product";
import { validateImageUpload } from "@/lib/validations";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const LOCAL_CATALOG_FILE = path.join(DATA_DIR, "catalog.json");

interface SupabaseContentClient {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { content_value: unknown } | null; error: unknown }>;
      };
    };
    upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ error: unknown }>;
  };
}

interface DbTableQueryClient {
  insert: (values: Record<string, unknown>) => Promise<{ data?: unknown; error?: { message: string } | null }>;
  update: (values: Record<string, unknown>) => {
    eq: (col: string, val: string) => Promise<{ data?: unknown; error?: { message: string } | null }>;
  };
  delete: () => {
    eq: (col: string, val: string) => Promise<{ data?: unknown; error?: { message: string } | null }>;
  };
  upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ data?: unknown; error?: { message: string } | null }>;
}

function getDbProductsTable(supabase: unknown): DbTableQueryClient {
  return (supabase as { from: (table: string) => DbTableQueryClient }).from("products");
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
    price: typeof p.price === "number" ? p.price : (p.volume === "85ml" ? 200 : 135),
    original_price: typeof p.original_price === "number" ? p.original_price : (p.volume === "85ml" ? 250 : 180),
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
    image_url: p.image_url || "/images/products/sakura-mountain-mist.webp",
    gallery:
      Array.isArray(p.gallery) && p.gallery.length > 0
        ? p.gallery
        : [p.image_url || "/images/products/sakura-mountain-mist.webp"],
    collection_id: p.collection_id || null,
    collection_slug: p.collection_slug || "",
    concentration: p.concentration || (p.volume === "85ml" ? "Eau de Parfum" : "Aroma Body Mist"),
    is_featured: Boolean(p.is_featured),
    is_published: p.is_published !== false,
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString(),
  };
}

interface DbProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  fragrance_family: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  image_url: string;
  gallery: string[];
  collection_id: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Loads the complete master catalog directly from the Supabase public.products table,
 * merging store attributes (price, stock, volume, sku, brand) and falling back to local file.
 */
export async function getMasterCatalog(): Promise<Product[]> {
  const local = readLocalCatalog();

  if (isSupabaseConfigured()) {
    try {
      const supabase =
        createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        // 1. Query Supabase public.products table
        const { data: rawDbProducts, error: dbError } = await (
          supabase.from("products") as unknown as {
            select: (cols: string) => {
              order: (
                col: string,
                opts?: { ascending: boolean }
              ) => Promise<{ data: DbProductRow[] | null; error: unknown }>;
            };
          }
        )
          .select("*")
          .order("created_at", { ascending: false });

        if (!dbError && rawDbProducts && rawDbProducts.length > 0) {
          const list = rawDbProducts.map((dbp) => {
            const matchingLocal = local?.find(
              (lp) =>
                lp.id === dbp.id ||
                lp.slug === dbp.slug ||
                lp.name.toLowerCase().trim() === dbp.name.toLowerCase().trim()
            );

            return normalizeProduct({
              ...matchingLocal,
              id: dbp.id,
              name: dbp.name,
              slug: dbp.slug,
              description: dbp.description,
              fragrance_family: dbp.fragrance_family,
              top_notes: dbp.top_notes,
              heart_notes: dbp.heart_notes,
              base_notes: dbp.base_notes,
              image_url: dbp.image_url,
              gallery: dbp.gallery,
              collection_id: dbp.collection_id,
              is_featured: dbp.is_featured,
              is_published: dbp.is_published,
              created_at: dbp.created_at,
              updated_at: dbp.updated_at,
            });
          });

          writeLocalCatalog(list);
          return list;
        }

        // 2. Fallback to site_content if products table has not returned data
        const client = supabase as unknown as SupabaseContentClient;
        const { data, error } = await client
          .from("site_content")
          .select("content_value")
          .eq("content_key", "catalog_products")
          .maybeSingle();

        if (
          !error &&
          data?.content_value &&
          Array.isArray(data.content_value) &&
          data.content_value.length > 0
        ) {
          const list = (data.content_value as Product[]).map(normalizeProduct);
          writeLocalCatalog(list);
          return list;
        }
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
      const supabase =
        createSupabaseServiceClient() ?? (await createSupabaseServerClient());
      if (supabase) {
        // 1. Sync directly to public.products table in Supabase
        const dbClient = supabase as unknown as {
          from: (table: string) => {
            upsert: (
              values: Record<string, unknown>,
              opts?: { onConflict?: string }
            ) => Promise<unknown>;
          };
        };

        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        for (const p of normalized) {
          try {
            const rowData: Record<string, unknown> = {
              name: p.name,
              slug: p.slug,
              description: p.description,
              fragrance_family: p.fragrance_family,
              top_notes: p.top_notes,
              heart_notes: p.heart_notes,
              base_notes: p.base_notes,
              image_url: p.image_url,
              gallery: p.gallery,
              collection_id: p.collection_id || null,
              is_featured: p.is_featured,
              is_published: p.is_published,
              updated_at: new Date().toISOString(),
            };

            // Only send id if it is a valid UUID, otherwise let Postgres default gen_random_uuid() handle it
            if (p.id && UUID_REGEX.test(p.id)) {
              rowData.id = p.id;
            }

            await dbClient.from("products").upsert(rowData, { onConflict: "slug" });
          } catch {
            // ignore individual upsert errors
          }
        }

        // 2. Also keep site_content in sync
        const client = supabase as unknown as SupabaseContentClient;
        await client.from("site_content").upsert(
          {
            content_key: "catalog_products",
            content_value: normalized,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "content_key" }
        );
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
  const product = catalog.find((p) => p.id === id || p.slug === id) || null;
  return {
    product,
    isDatabaseConnected: isSupabaseConfigured(),
  };
}

/**
 * Uploads an image file to Supabase Storage via Service Role client (bypasses RLS).
 * Supports product-images, collection-images, or site-assets buckets.
 */
export async function uploadProductImageAction(
  formData: FormData
): Promise<{
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "product-images";

    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "No image file provided." };
    }

    const validation = validateImageUpload({
      type: file.type,
      size: file.size,
      name: file.name,
    });

    if (!validation.valid || !validation.safeFilename) {
      return { success: false, error: validation.error || "Invalid image file format or size." };
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase service role is not configured on the server. Please check .env.local.",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = `uploads/${validation.safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      filename: validation.safeFilename,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload image.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves list of images uploaded to Supabase Storage in the specified bucket.
 * Allows admin to select from previously uploaded images with one click.
 */
export async function getUploadedStorageImagesAction(
  bucket: string = "product-images"
): Promise<{
  success: boolean;
  images: Array<{ name: string; url: string; created_at?: string; size?: number }>;
  error?: string;
}> {
  try {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return { success: false, images: [], error: "Supabase Service Role not available." };
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .list("uploads", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return { success: false, images: [], error: error.message };
    }

    const images = (data || [])
      .filter((item) => item.name && !item.name.startsWith("."))
      .map((item) => {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(`uploads/${item.name}`);

        return {
          name: item.name,
          url: urlData.publicUrl,
          created_at: item.created_at || (item.metadata as { lastModified?: string })?.lastModified,
          size: (item.metadata as { size?: number })?.size,
        };
      });

    return { success: true, images };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list storage assets.";
    return { success: false, images: [], error: message };
  }
}

export async function createProductAction(
  rawValues: ProductFormValues
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const catalog = await getMasterCatalog();
    // Generate valid RFC4122 UUID for Postgres UUID column
    const id = crypto.randomUUID();
    const newProduct = normalizeProduct({
      ...rawValues,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServiceClient();
      if (supabase) {
        const dbTable = getDbProductsTable(supabase);
        const { error: insertErr } = await dbTable.insert({
          id,
          name: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description,
          fragrance_family: newProduct.fragrance_family,
          top_notes: newProduct.top_notes,
          heart_notes: newProduct.heart_notes,
          base_notes: newProduct.base_notes,
          image_url: newProduct.image_url,
          gallery: newProduct.gallery,
          collection_id: newProduct.collection_id || null,
          is_featured: newProduct.is_featured,
          is_published: newProduct.is_published,
          created_at: newProduct.created_at,
          updated_at: newProduct.updated_at,
        });

        if (insertErr) {
          console.error("Supabase product insert error:", insertErr);
          return { success: false, error: `Database insert failed: ${insertErr.message}` };
        }
      }
    }

    catalog.unshift(newProduct);
    writeLocalCatalog(catalog);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseServiceClient();
        if (supabase) {
          const client = supabase as unknown as SupabaseContentClient;
          await client.from("site_content").upsert(
            {
              content_key: "catalog_products",
              content_value: catalog,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "content_key" }
          );
        }
      } catch (e) {
        console.error("Failed to sync site_content:", e);
      }
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath("/admin/products");

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
    const index = catalog.findIndex((p) => p.id === id || p.slug === id);

    let updatedProduct: Product;
    if (index !== -1) {
      updatedProduct = normalizeProduct({
        ...catalog[index],
        ...rawValues,
        updated_at: new Date().toISOString(),
      });
      catalog[index] = updatedProduct;
    } else {
      updatedProduct = normalizeProduct({
        id,
        ...rawValues,
        updated_at: new Date().toISOString(),
      });
      catalog.unshift(updatedProduct);
    }

    // 1. Direct update to Supabase public.products table
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServiceClient();
      if (supabase) {
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUuid = UUID_REGEX.test(id) || UUID_REGEX.test(updatedProduct.id);
        const targetId = UUID_REGEX.test(id) ? id : updatedProduct.id;

        const dbFields: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (rawValues.name !== undefined) dbFields.name = rawValues.name;
        if (rawValues.slug !== undefined) dbFields.slug = rawValues.slug;
        if (rawValues.description !== undefined) dbFields.description = rawValues.description;
        if (rawValues.fragrance_family !== undefined) dbFields.fragrance_family = rawValues.fragrance_family;
        if (rawValues.top_notes !== undefined) dbFields.top_notes = rawValues.top_notes;
        if (rawValues.heart_notes !== undefined) dbFields.heart_notes = rawValues.heart_notes;
        if (rawValues.base_notes !== undefined) dbFields.base_notes = rawValues.base_notes;
        if (rawValues.image_url !== undefined) {
          dbFields.image_url = rawValues.image_url;
          dbFields.gallery =
            rawValues.gallery && rawValues.gallery.length > 0
              ? rawValues.gallery
              : [rawValues.image_url];
        }
        if (rawValues.gallery !== undefined && !rawValues.image_url) {
          dbFields.gallery = rawValues.gallery;
        }
        if (rawValues.collection_id !== undefined) dbFields.collection_id = rawValues.collection_id || null;
        if (rawValues.is_featured !== undefined) dbFields.is_featured = rawValues.is_featured;
        if (rawValues.is_published !== undefined) dbFields.is_published = rawValues.is_published;

        const dbTable = getDbProductsTable(supabase);
        let dbRes = isUuid
          ? await dbTable.update(dbFields).eq("id", targetId)
          : await dbTable.update(dbFields).eq("slug", rawValues.slug || id);

        // If not found by slug or id, fallback to upsert
        if (dbRes.error) {
          console.error("Direct update failed, attempting upsert:", dbRes.error);
          const upsertData: Record<string, unknown> = {
            ...dbFields,
            name: updatedProduct.name,
            slug: updatedProduct.slug,
            description: updatedProduct.description,
            fragrance_family: updatedProduct.fragrance_family,
            top_notes: updatedProduct.top_notes,
            heart_notes: updatedProduct.heart_notes,
            base_notes: updatedProduct.base_notes,
            image_url: updatedProduct.image_url,
            gallery: updatedProduct.gallery,
          };
          if (isUuid) {
            upsertData.id = targetId;
          }
          dbRes = await dbTable.upsert(upsertData, { onConflict: "slug" });
        }

        if (dbRes.error) {
          return { success: false, error: `Supabase database error: ${dbRes.error.message}` };
        }
      }
    }

    // 2. Persist to local catalog and site_content
    writeLocalCatalog(catalog);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseServiceClient();
        if (supabase) {
          const client = supabase as unknown as SupabaseContentClient;
          await client.from("site_content").upsert(
            {
              content_key: "catalog_products",
              content_value: catalog,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "content_key" }
          );
        }
      } catch (e) {
        console.error("Failed to sync site_content:", e);
      }
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    if (updatedProduct.slug) {
      revalidatePath(`/products/${updatedProduct.slug}`);
    }

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
    const index = catalog.findIndex((p) => p.id === id || p.slug === id);
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
    const filtered = catalog.filter((p) => p.id !== id && p.slug !== id);

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServiceClient();
      if (supabase) {
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUuid = UUID_REGEX.test(id);
        const dbTable = getDbProductsTable(supabase);
        const { error: delErr } = await dbTable
          .delete()
          .eq(isUuid ? "id" : "slug", id);

        if (delErr) {
          console.error("Supabase delete failed:", delErr);
          return { success: false, error: `Supabase delete failed: ${delErr.message}` };
        }
      }
    }

    await saveMasterCatalog(filtered);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return { success: false, error: message };
  }
}

export interface MassUploadProductRow {
  sku?: string;
  name: string;
  brand?: string;
  volume?: "50ml" | "85ml" | "100ml";
  price: number;
  stock: number;
  original_price?: number;
  gender?: "female" | "male" | "unisex";
  status?: "in_stock" | "low_stock" | "out_of_stock";
  fragrance_family?: string;
  description?: string;
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  is_featured?: boolean;
}

export async function massUploadProductsAction(
  rows: MassUploadProductRow[]
): Promise<{
  success: boolean;
  createdCount: number;
  updatedCount: number;
  error?: string;
}> {
  try {
    const catalog = await getMasterCatalog();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const cleanSku = (row.sku || "").trim().toUpperCase();
      const cleanName = (row.name || "").trim().toLowerCase();

      // Match by exact SKU first, then by exact Product Name fallback
      const existingIndex = catalog.findIndex((p) => {
        const itemSku = (p.sku || "").trim().toUpperCase();
        if (cleanSku && itemSku === cleanSku) return true;
        const itemName = (p.name || "").trim().toLowerCase();
        return cleanName && itemName === cleanName;
      });

      const calculatedStatus =
        row.status ||
        (row.stock <= 0 ? "out_of_stock" : row.stock <= 10 ? "low_stock" : "in_stock");

      const vol = row.volume || "50ml";

      if (existingIndex !== -1) {
        // Update existing item
        const existing = catalog[existingIndex];
        catalog[existingIndex] = normalizeProduct({
          ...existing,
          name: row.name.trim() || existing.name,
          brand: row.brand?.trim() || existing.brand,
          volume: vol,
          volume_display:
            vol === "85ml"
              ? "85 ml / 2.9 fl. oz."
              : vol === "100ml"
              ? "100 ml / 3.4 fl. oz."
              : "50 ml / 1.7 fl. oz.",
          category: vol === "85ml" ? "perfume" : "mist",
          price: typeof row.price === "number" ? row.price : existing.price,
          original_price:
            typeof row.original_price === "number" && row.original_price > 0
              ? row.original_price
              : existing.original_price,
          stock: typeof row.stock === "number" ? row.stock : existing.stock,
          status: calculatedStatus,
          gender: row.gender || existing.gender,
          fragrance_family: row.fragrance_family?.trim() || existing.fragrance_family,
          description: row.description?.trim() || existing.description,
          top_notes:
            Array.isArray(row.top_notes) && row.top_notes.length > 0
              ? row.top_notes
              : existing.top_notes,
          heart_notes:
            Array.isArray(row.heart_notes) && row.heart_notes.length > 0
              ? row.heart_notes
              : existing.heart_notes,
          base_notes:
            Array.isArray(row.base_notes) && row.base_notes.length > 0
              ? row.base_notes
              : existing.base_notes,
          is_featured:
            typeof row.is_featured === "boolean" ? row.is_featured : existing.is_featured,
          updated_at: new Date().toISOString(),
        });
        updatedCount++;
      } else {
        // Create new item
        const slug = (row.name || "fragrance")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const newProd = normalizeProduct({
          id,
          sku: cleanSku || `SCENT-${Date.now().toString().slice(-4)}`,
          name: row.name.trim(),
          slug,
          brand: row.brand?.trim() || "SCENTS & MISTS",
          volume: vol,
          volume_display:
            vol === "85ml"
              ? "85 ml / 2.9 fl. oz."
              : vol === "100ml"
              ? "100 ml / 3.4 fl. oz."
              : "50 ml / 1.7 fl. oz.",
          category: vol === "85ml" ? "perfume" : "mist",
          price: typeof row.price === "number" ? row.price : 135,
          original_price:
            typeof row.original_price === "number" && row.original_price > 0
              ? row.original_price
              : 180,
          stock: typeof row.stock === "number" ? row.stock : 20,
          status: calculatedStatus,
          gender: row.gender || "female",
          fragrance_family: row.fragrance_family?.trim() || "Floral",
          description: row.description?.trim() || "",
          top_notes: row.top_notes || [],
          heart_notes: row.heart_notes || [],
          base_notes: row.base_notes || [],
          is_featured: Boolean(row.is_featured),
          image_url:
            (row as unknown as { image_url?: string }).image_url ||
            "/images/products/sakura-mountain-mist.webp",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        catalog.unshift(newProd);
        createdCount++;
      }
    }

    await saveMasterCatalog(catalog);
    return { success: true, createdCount, updatedCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to mass import products.";
    return { success: false, createdCount: 0, updatedCount: 0, error: message };
  }
}
