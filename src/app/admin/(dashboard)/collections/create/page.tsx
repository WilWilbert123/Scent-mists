import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CollectionForm } from "@/components/admin/collections/collection-form";

export default function AdminCreateCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/collections"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Collections</span>
        </Link>
      </div>

      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-3xl text-foreground">
          Create Fragrance Collection
        </h1>
        <p className="text-xs text-muted-foreground">
          Establish a new thematic collection for the SCENTS &amp; MISTS showcase.
        </p>
      </div>

      <CollectionForm />
    </div>
  );
}

