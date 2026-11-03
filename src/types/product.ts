export interface FragranceNoteItem {
  name: string;
  botanicalOrigin?: string;
  facet?: string;
  description: string;
  tier: "top" | "heart" | "base";
  isSampleContent?: boolean;
}

export type ProductGender = "male" | "female" | "unisex";
export type ProductVolume = "50ml" | "85ml" | "100ml";
export type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  sku?: string;
  volume?: ProductVolume;
  volume_display?: string;
  category?: "mist" | "perfume" | string;
  gender?: ProductGender;
  price?: number;
  original_price?: number;
  stock?: number;
  status?: ProductStatus;
  sold_count?: number;
  rating?: number;
  rating_count?: number;
  is_main_male?: boolean;
  is_main_female?: boolean;
  subtitle?: string;
  description: string;
  fragrance_family: string;
  scent_profile?: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  image_url: string;
  gallery: string[];
  collection_id?: string | null;
  collection_slug?: string;
  concentration?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  brand?: string;
  sku?: string;
  volume?: ProductVolume;
  gender?: ProductGender;
  price?: number;
  original_price?: number;
  stock?: number;
  status?: ProductStatus;
  description: string;
  fragrance_family: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  image_url: string;
  gallery: string[];
  collection_id?: string | null;
  is_main_male?: boolean;
  is_main_female?: boolean;
  is_featured: boolean;
  is_published: boolean;
}
