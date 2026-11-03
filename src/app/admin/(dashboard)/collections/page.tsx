import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCollectionsAction } from "@/actions/collection.actions";
import { CollectionTable } from "@/components/admin/collections/collection-table";
import { Button } from "@/components/ui/button";

export default async function AdminCollectionsPage() {
  const { collections } = await getAdminCollectionsAction();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">
            Fragrance Collections
          </h1>
          <p className="text-xs text-muted-foreground">
            Curate thematic fragrance chapters and manage collection visibility.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/collections/create">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create Collection</span>
          </Link>
        </Button>
      </div>

      <CollectionTable initialCollections={collections} />
    </div>
  );
}

