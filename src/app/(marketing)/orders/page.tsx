"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  ArrowRight,
  MapPin,
  Loader2,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  Truck,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import {
  searchOrdersAction,
  getOrdersByNumbersAction,
} from "@/actions/order.actions";
import type { Order, OrderStatus } from "@/types/order";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const STEP_DEFINITIONS = [
  { key: "pending" as OrderStatus, label: "Placed", icon: ShoppingBag },
  { key: "confirmed" as OrderStatus, label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing" as OrderStatus, label: "Preparing", icon: Package },
  { key: "out_for_delivery" as OrderStatus, label: "On The Way", icon: Truck },
  { key: "delivered" as OrderStatus, label: "Delivered", icon: CheckCheck },
];

const STATUS_INDEX_MAP: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

function getStatusBadgeConfig(status: OrderStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending Review",
        sublabel: "Order received & queued for atelier confirmation",
        className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        pulse: true,
      };
    case "confirmed":
      return {
        label: "Confirmed",
        sublabel: "Verified by atelier • batch bottling scheduled",
        className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        pulse: true,
      };
    case "preparing":
      return {
        label: "Preparing / Packed",
        sublabel: "Packed securely in luxury flacon box",
        className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        pulse: true,
      };
    case "out_for_delivery":
      return {
        label: "Out for Delivery",
        sublabel: "Courier rider is on the way to your pinned address",
        className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
        pulse: true,
      };
    case "delivered":
      return {
        label: "Delivered",
        sublabel: "Parcel safely delivered & received",
        className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        pulse: false,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        sublabel: "Order has been cancelled",
        className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        pulse: false,
      };
    default:
      return {
        label: status,
        sublabel: "",
        className: "bg-surface text-foreground border-border",
        pulse: false,
      };
  }
}

export default function OrderSearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Order[] | null>(null);

  // Customer orders on this device
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoadingCustomerOrders, setIsLoadingCustomerOrders] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);

  // Load customer orders from localStorage
  const loadDeviceOrders = useCallback(async (showToast = false) => {
    try {
      const stored = localStorage.getItem("scent_mists_customer_orders");
      const lastOrder = localStorage.getItem("scent_mists_last_order");
      const numbers: string[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          numbers.push(...parsed);
        }
      }
      if (lastOrder) {
        const parsed = JSON.parse(lastOrder);
        if (parsed?.order_number && !numbers.includes(parsed.order_number)) {
          numbers.push(parsed.order_number);
        }
      }

      if (numbers.length > 0) {
        const fetched = await getOrdersByNumbersAction(numbers);
        setCustomerOrders(fetched);
        if (showToast) {
          toast.success("Order status synchronized with live atelier database!");
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingCustomerOrders(false);
    }
  }, []);

  useEffect(() => {
    loadDeviceOrders();
    // Realtime polling every 6s to update order status automatically
    const timer = setInterval(() => {
      loadDeviceOrders();
    }, 6000);
    return () => clearInterval(timer);
  }, [loadDeviceOrders]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadDeviceOrders(true);
    setIsRefreshing(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter your Order Number (e.g. SCENT-2026-1234) or phone number.");
      return;
    }

    setIsSearching(true);
    try {
      const found = await searchOrdersAction(query.trim());
      setSearchResults(found);

      if (found.length > 0) {
        // Automatically save found orders to customer device list
        try {
          const stored = localStorage.getItem("scent_mists_customer_orders");
          const existingList: string[] = stored ? JSON.parse(stored) : [];
          const newNumbers = found.map((o) => o.order_number);
          const merged = Array.from(new Set([...newNumbers, ...existingList]));
          localStorage.setItem("scent_mists_customer_orders", JSON.stringify(merged));
          setCustomerOrders((prev) => {
            const map = new Map(prev.map((o) => [o.order_number, o]));
            for (const o of found) map.set(o.order_number, o);
            return Array.from(map.values());
          });
        } catch {
          // ignore
        }
      } else {
        toast.error("No orders found matching that query.");
      }
    } catch {
      toast.error("Error searching orders.");
    } finally {
      setIsSearching(false);
    }
  };

  const activeInProcessOrders = customerOrders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "confirmed" ||
      o.status === "preparing" ||
      o.status === "out_for_delivery"
  );

  const completedOrders = customerOrders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled"
  );

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 py-4 sm:py-12 space-y-4 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 sm:pb-5">
        <div>
          <span className="font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider text-accent">
            Fulfillment Concierge
          </span>
          <h1 className="font-serif text-lg sm:text-3xl text-foreground font-bold pt-0.5">
            My Orders &amp; Live Tracking
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Real-time fulfillment workflow, ordered perfumes inspection, and courier GPS tracking.
          </p>
        </div>

        {customerOrders.length > 0 && (
          <button
            type="button"
            disabled={isRefreshing}
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] sm:text-xs text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={cn("h-3 w-3 text-accent", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoadingCustomerOrders && (
        <div className="rounded-2xl border border-border bg-surface-elevated p-8 text-center space-y-3">
          <Loader2 className="h-6 w-6 text-accent animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-mono">
            Checking recent orders placed on this device...
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: ACTIVE / IN-PROCESS ORDERS (Prominently displayed) */}
      {/* ========================================================================= */}
      {!isLoadingCustomerOrders && activeInProcessOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>In-Process Orders ({activeInProcessOrders.length})</span>
            </h2>
            <span className="text-[11px] text-muted-foreground font-mono">
              Live Realtime Feed
            </span>
          </div>

          <div className="space-y-4">
            {activeInProcessOrders.map((order) => {
              const badge = getStatusBadgeConfig(order.status);
              const currentStepIdx = STATUS_INDEX_MAP[order.status];

              return (
                <div
                  key={order.id}
                  className="rounded-xl sm:rounded-2xl border border-border bg-surface-elevated p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-5 transition-all hover:border-accent/40"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-border/80 pb-3 sm:pb-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-mono text-xs sm:text-base font-bold text-accent">
                          {order.order_number}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider font-mono",
                            badge.className
                          )}
                        >
                          {badge.pulse && (
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                          )}
                          <span>{badge.label}</span>
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                        Placed on {new Date(order.created_at).toLocaleString()} • {badge.sublabel}
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.order_number}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
                    >
                      <Truck className="h-3 w-3" />
                      <span>Live GPS Map</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* 5-Step Delivery Workflow Timeline (Shopee / Lazada Style) */}
                  <div className="py-2">
                    <div className="relative">
                      {/* Connecting Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-0" />
                      <div
                        className="absolute top-4 left-6 h-0.5 bg-accent transition-all duration-700 -z-0"
                        style={{
                          width: `${Math.max(0, Math.min(100, (currentStepIdx / 4) * 100))}%`,
                        }}
                      />

                      {/* Step Icons */}
                      <div className="relative flex justify-between z-10">
                        {STEP_DEFINITIONS.map((step, idx) => {
                          const Icon = step.icon;
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;

                          return (
                            <div
                              key={step.key}
                              className="flex flex-col items-center text-center space-y-1.5"
                            >
                              <div
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-all shadow-xs",
                                  isCurrent
                                    ? "border-accent bg-accent text-accent-foreground font-bold ring-4 ring-accent/20 scale-110"
                                    : isDone
                                      ? "border-accent bg-accent/20 text-accent font-semibold"
                                      : "border-border bg-surface text-muted-foreground"
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span
                                className={cn(
                                  "text-[9px] sm:text-[10px] font-mono tracking-tight",
                                  isCurrent
                                    ? "text-accent font-bold"
                                    : isDone
                                      ? "text-foreground font-medium"
                                      : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items Breakdown (Exact Perfumes, Quantities, & Thumbnails) */}
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                      Ordered Perfumes ({order.items.reduce((s, i) => s + i.quantity, 0)})
                    </span>

                    <div className="divide-y divide-border/60">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${item.product_id}-${idx}`}
                          className="pt-2.5 first:pt-0 flex items-center gap-3"
                        >
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-medium text-foreground truncate">
                              {item.name}
                            </h4>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {item.volume || "50ml"} • {item.quantity}x @ ₱{item.price.toLocaleString()}
                            </p>
                          </div>

                          <span className="font-mono text-xs font-semibold text-foreground">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Financials & Delivery Drop-off Details */}
                    <div className="border-t border-border/80 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span className="truncate max-w-xs">
                          {order.delivery_address}
                          {order.landmark && order.landmark !== "None"
                            ? ` (${order.landmark})`
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 font-mono sm:self-auto self-end">
                        <span className="text-[11px] text-muted-foreground">
                          Delivery: {order.delivery_fee === 0 ? "FREE" : `₱${order.delivery_fee}`} •
                        </span>
                        <span className="text-sm font-bold text-accent">
                          Total: ₱{order.total_amount.toLocaleString()} ({order.payment_method.toUpperCase()})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: COMPLETED / DELIVERED ORDERS */}
      {/* ========================================================================= */}
      {!isLoadingCustomerOrders && completedOrders.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Completed Orders ({completedOrders.length})
          </h2>

          <div className="space-y-3">
            {completedOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.order_number}`}
                className="block rounded-xl border border-border bg-surface-elevated p-4 hover:border-accent transition-all group shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent group-hover:underline">
                        {order.order_number}
                      </span>
                      <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold font-mono">
                        DELIVERED
                      </span>
                    </div>
                    <p className="text-xs text-foreground truncate pt-0.5">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono pt-0.5">
                      ₱{order.total_amount.toLocaleString()} • Delivered to {order.delivery_address}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: EMPTY STATE (If no orders on device yet) */}
      {/* ========================================================================= */}
      {!isLoadingCustomerOrders && customerOrders.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface-elevated p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface border border-border mx-auto text-accent">
            <Package className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-foreground">
              No Orders Found On This Device Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When you checkout with Cash on Delivery, your live order tracker and courier timeline will appear here automatically.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors shadow-xs"
            >

              <span>Explore Fragrances</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowSearchBox(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-accent" />
              <span>Lookup by Phone Number</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: LOOKUP ANOTHER ORDER (Search box by Order # or Phone) */}
      {/* ========================================================================= */}
      <div className="pt-4 border-t border-border">
        {(!showSearchBox && customerOrders.length > 0) ? (
          <button
            type="button"
            onClick={() => setShowSearchBox(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-surface p-3.5 text-xs text-muted-foreground hover:text-foreground hover:border-accent transition-colors cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-accent" />
            <span>Track an order placed from another phone or device</span>
          </button>
        ) : (
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-border bg-surface-elevated p-4 sm:p-6 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-accent" />
                <span>Track By Order # or Mobile Phone</span>
              </label>
              {customerOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSearchBox(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Hide Search
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. SCENT-2026-9039 or 09388837432"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs tracking-wider uppercase hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
              >
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                <span>Track</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Searching by your 11-digit phone number will pull up all orders associated with your mobile number.
            </p>
          </form>
        )}
      </div>

      {/* Search Results Display */}
      {searchResults !== null && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground">
            Search Results ({searchResults.length})
          </h3>

          {searchResults.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-6 text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">No orders found</p>
              <p className="text-[11px] text-muted-foreground">
                No orders match &ldquo;{query}&rdquo;. Please verify your order receipt.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.order_number}`}
                  className="block rounded-xl border border-border bg-surface-elevated p-4 hover:border-accent transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-accent group-hover:underline">
                        {o.order_number}
                      </span>
                      <p className="text-xs text-foreground font-medium pt-0.5">
                        {o.customer_name} • ₱{o.total_amount.toLocaleString()} ({o.payment_method.toUpperCase()})
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>

                    <div className="text-right space-y-1 shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border font-mono">
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
