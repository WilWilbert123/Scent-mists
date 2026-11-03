export interface Collection {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  image_url: string;
  is_published: boolean;
  product_slugs?: string[];
  created_at: string;
  updated_at: string;
}

export interface CollectionFormValues {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_published: boolean;
}

