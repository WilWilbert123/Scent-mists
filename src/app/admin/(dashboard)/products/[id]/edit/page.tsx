import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminProductByIdAction } from "@/actions/product.actions";
import { ProductEditor } from "@/components/admin/products/product-editor";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;
  const { product } = await getAdminProductByIdAction(id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Fragrances</span>
        </Link>
      </div>

      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-3xl text-foreground">
          Edit Fragrance Showcase Entry
        </h1>
        <p className="text-xs text-muted-foreground">
          Modify olfactory notes, imagery, and publication settings.
        </p>
      </div>

      {!product ? (
        <EmptyState
          title="Fragrance Entry Not Found"
          description="The requested fragrance showcase entry could not be found."
        />
      ) : (
        <ProductEditor product={product} />
      )}
    </div>
  );
}

