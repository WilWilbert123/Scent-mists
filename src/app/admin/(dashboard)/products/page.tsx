import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProductsAction } from "@/actions/product.actions";
import { ProductTable } from "@/components/admin/products/product-table";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
  const { products } = await getAdminProductsAction();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">
            Fragrance Showcase Entries
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage perfume showcase presentations, olfactory notes, and
            publication status.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/create">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create Fragrance Entry</span>
          </Link>
        </Button>
      </div>

      <ProductTable initialProducts={products} />
    </div>
  );
}

