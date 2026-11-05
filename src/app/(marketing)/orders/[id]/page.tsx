import React from "react";
import Link from "next/link";
import { ArrowLeft, Search, PackageX } from "lucide-react";
import { getOrderByIdAction } from "@/actions/order.actions";
import { OrderTrackingView } from "@/components/orders/order-tracking-view";

interface OrderTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id || "");
  const order = await getOrderByIdAction(decodedId);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-border text-muted-foreground">
          <PackageX className="h-8 w-8 text-amber-500" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Order Lookup
          </span>
          <h1 className="font-serif text-2xl text-foreground font-bold">
            Order Not Found
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We couldn&apos;t find an order with identifier{" "}
            <code className="font-mono text-accent">{decodedId}</code>. Please check
            the spelling of your order number (e.g. <strong className="text-foreground">SCENT-2026-XXXX</strong>).
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search by Phone or Code</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs hover:border-foreground/30 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  return <OrderTrackingView initialOrder={order} />;
}

