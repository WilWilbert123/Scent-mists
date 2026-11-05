"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  ArrowRight,
  MapPin,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { searchOrdersAction } from "@/actions/order.actions";
import type { Order } from "@/types/order";
import { toast } from "@/components/ui/toast";

export default function OrderSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Order[] | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("scent_mists_last_order");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.order_number) {
          setLastOrderNumber(parsed.order_number);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter your Order Number (e.g. SCENT-2026-1234) or phone number.");
      return;
    }

    setIsSearching(true);
    try {
      const found = await searchOrdersAction(query.trim());
      setResults(found);
      if (found.length === 1) {
        // Direct jump if exact match
        router.push(`/orders/${found[0].order_number}`);
      } else if (found.length === 0) {
        toast.error("No orders found matching that number.");
      }
    } catch {
      toast.error("Error searching orders.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">

        <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-bold">
          Track Your Fragrance Delivery
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Follow your parcel from fulfillment atelier to your door in real time with live courier status updates.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-border bg-surface-elevated p-4 sm:p-6 shadow-xl space-y-4"
      >
        <label className="block text-xs uppercase tracking-wider font-semibold text-foreground">
          Enter Order Number or Contact Phone Number
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. SCENT-2026-1234 or 09171234567"
              className="w-full pl-10 pr-4 py-3 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-xs tracking-wider uppercase hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-md"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span>Track Order</span>
          </button>
        </div>

        {/* Quick button to view recent order from localStorage */}
        {lastOrderNumber && (
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Recently placed order on this device:</span>
            <Link
              href={`/orders/${lastOrderNumber}`}
              className="inline-flex items-center gap-1 font-mono font-bold text-accent hover:underline"
            >
              <span>{lastOrderNumber}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </form>

      {/* Search Results List */}
      {results !== null && (
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-foreground">
            Search Results ({results.length})
          </h2>

          {results.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center space-y-2">
              <Package className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">No orders found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn&apos;t find an order matching &ldquo;{query}&rdquo;. Please verify your order number on your order receipt.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.order_number}`}
                  className="block rounded-xl border border-border bg-surface-elevated p-4 hover:border-accent transition-all duration-200 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-accent group-hover:underline">
                        {o.order_number}
                      </span>
                      <p className="text-xs font-semibold text-foreground pt-0.5">
                        {o.customer_name} • ₱{o.total_amount.toLocaleString()} ({o.payment_method.toUpperCase()})
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-xs">{o.delivery_address}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-1 shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border">
                        {o.status.replace(/_/g, " ")}
                      </span>
                      <span className="block text-[10px] text-muted-foreground font-mono">
                        {new Date(o.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
