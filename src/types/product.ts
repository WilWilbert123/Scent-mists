export interface FragranceNoteItem {
  name: string;
  botanicalOrigin?: string;
  facet?: string;
  description: string;
  tier: "top" | "heart" | "base";
  isSampleContent?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
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
  volume_display?: string;
  concentration?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  fragrance_family: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  image_url: string;
  gallery: string[];
  collection_id?: string | null;
  is_featured: boolean;
  is_published: boolean;
}

