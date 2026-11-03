import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface PopularProductsProps {
  fragrances: {
    slug: string;
    name: string;
    family?: string;
    views: number;
    uniqueVisitors?: number;
  }[];
}

export function PopularProducts({ fragrances }: PopularProductsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fragrance Showcase Performance</CardTitle>
          <CardDescription>
            Live Supabase catalog fragrances ranked by recorded page views
          </CardDescription>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-accent hover:underline"
        >
          <span>Manage</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent>
        {fragrances.length === 0 ? (
          <EmptyState
            title="No Fragrances in Database"
            description="Add fragrances in the Products section to track their live page view performance."
          />
        ) : (
          <ul className="divide-y divide-border">
            {fragrances.map((item, idx) => (
              <li
                key={item.slug}
                className="flex items-center justify-between gap-4 py-3.5 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-serif text-sm text-muted-foreground w-5 shrink-0">
                    0{idx + 1}
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate font-medium text-foreground hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    {item.family && (
                      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {item.family}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-xs text-muted-foreground">
                    <strong className="font-semibold text-foreground">{item.views}</strong>{" "}
                    {item.views === 1 ? "view" : "views"}
                  </span>
                  {typeof item.uniqueVisitors === "number" && (
                    <span className="block text-[11px] text-muted-foreground">
                      {item.uniqueVisitors}{" "}
                      {item.uniqueVisitors === 1 ? "visitor" : "visitors"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

