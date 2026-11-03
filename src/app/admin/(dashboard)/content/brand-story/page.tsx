import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSiteContentOverviewAction } from "@/actions/content.actions";
import { BrandStoryEditor } from "@/components/admin/content/brand-story-editor";

export default async function AdminBrandStoryContentPage() {
  const overview = await getSiteContentOverviewAction();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Content Management</span>
        </Link>
      </div>

      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-3xl text-foreground">
          Brand Story &amp; Philosophy Editor
        </h1>
        <p className="text-xs text-muted-foreground">
          Edit the narrative and botanical transparency notes in <code className="font-mono">public.site_content</code> displayed on /about.
        </p>
      </div>

      <BrandStoryEditor
        initialStory={overview.brandStory.value}
        updatedAt={overview.brandStory.updatedAt}
      />
    </div>
  );
}

