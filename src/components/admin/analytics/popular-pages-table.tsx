import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface PopularPagesTableProps {
  pages: { page_path: string; views: number; unique_visitors: number }[];
}

function getReadableRouteLabel(path: string): string {
  if (path === "/") return "Homepage Showcase";
  if (path === "/collections") return "Collections Index";
  if (path === "/shop") return "Complete Fragrance Showcase";
  if (path === "/about") return "Our House Story";
  if (path === "/fragrance-guide") return "Olfactory Fragrance Guide";
  if (path === "/contact") return "Client Concierge & Enquiries";
  if (path.startsWith("/products/")) {
    const slug = path.replace("/products/", "");
    if (slug === "sakura-and-mountain-mist" || slug === "himalayan-cherry-blossom-air") {
      return "Product • Sakura & Mountain Mist";
    }
    const title = slug
      .split("-")
      .map((w) => (w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(" ");
    return `Product • ${title}`;
  }
  if (path.startsWith("/collections/")) {
    const slug = path.replace("/collections/", "");
    const title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return `Collection • ${title}`;
  }
  return path;
}

export function PopularPagesTable({ pages }: PopularPagesTableProps) {
  const totalViewsAcrossPages = pages.reduce((acc, p) => acc + p.views, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Viewed Pages</CardTitle>
        <CardDescription>
          Live Supabase route breakdown of total page views, traffic share, and distinct anonymous visitors
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <EmptyState
            title="No Page Views Recorded Yet"
            description="Public page views will be aggregated here once visitors browse the website."
          />
        ) : (
          <Table ariaLabel="Most viewed pages">
            <TableHeader>
              <TableRow>
                <TableHead>Page &amp; Route Path</TableHead>
                <TableHead>Total Page Views</TableHead>
                <TableHead>Traffic Share</TableHead>
                <TableHead>Unique Visitors</TableHead>
                <TableHead>Avg. Views / Visitor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => {
                const sharePct =
                  totalViewsAcrossPages > 0
                    ? Math.round((page.views / totalViewsAcrossPages) * 100)
                    : 0;
                const avgPerVisitor =
                  page.unique_visitors > 0
                    ? (page.views / page.unique_visitors).toFixed(1)
                    : "1.0";

                return (
                  <TableRow key={page.page_path}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-medium text-foreground">
                          {getReadableRouteLabel(page.page_path)}
                        </span>
                        <Link
                          href={page.page_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
                        >
                          <span>{page.page_path}</span>
                          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {page.views}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-20 bg-surface overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${Math.max(6, sharePct)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {sharePct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {page.unique_visitors}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {avgPerVisitor}x
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

