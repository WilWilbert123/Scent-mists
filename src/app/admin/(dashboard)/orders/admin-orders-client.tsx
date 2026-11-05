"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  ExternalLink,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";
import { getOrdersAction, updateOrderStatusAction } from "@/actions/order.actions";
import { ExportButton } from "@/components/admin/shared/export-button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending Review",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  preparing: {
    label: "Preparing / Packed",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
};

function OrderItemThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(
    src || "/images/products/sakura-mountain-mist.webp"
  );

  return (
    <div className="relative h-8 w-7 shrink-0 rounded overflow-hidden border border-border bg-background">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="32px"
        className="object-cover"
        onError={() =>
          setImgSrc("/images/products/sakura-mountain-mist.webp")
        }
      />
    </div>
  );
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // Real-time synchronization with Supabase and local data
  const refreshOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const fresh = await getOrdersAction();
      setOrders(fresh);
      setLastSynced(new Date());
      if (!silent) {
        toast.success("Orders synchronized with live database.");
      }
    } catch {
      if (!silent) toast.error("Failed to refresh orders.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // Poll for new customer orders every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshOrders(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [refreshOrders]);

  // Status Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeDeliveries = orders.filter((o) => o.status === "out_for_delivery").length;
  const totalRevenue = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.total_amount : sum), 0);

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ? true : order.status === statusFilter;
    const matchesSearch =
      search.trim() === ""
        ? true
        : order.order_number.toLowerCase().includes(search.toLowerCase()) ||
          order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
          order.phone.includes(search) ||
          order.delivery_address.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(`Order status updated to "${STATUS_CONFIG[newStatus].label}".`);
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Error updating status.");
    }
  };

  const exportRows = filteredOrders.map((o) => {
    const itemsSummary = (o.items || [])
      .map((i) => `${i.name || "Fragrance"} (${i.volume || "50ml"}) x${i.quantity || 1}`)
      .join("; ");

    return [
      o.order_number || o.id,
      new Date(o.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      o.customer_name || "—",
      o.phone || "—",
      o.email || "—",
      o.delivery_address || "—",
      STATUS_CONFIG[o.status]?.label || o.status,
      o.payment_method === "cod" ? "Cash on Delivery" : o.payment_method?.toUpperCase() || "COD",
      o.subtotal || o.total_amount,
      o.delivery_fee || 0,
      o.discount_amount || 0,
      o.total_amount,
      itemsSummary || "—",
      o.notes || "—",
    ];
  });

  return (
    <div className="space-y-6">
      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface-elevated p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            Total Orders
          </p>
          <p className="text-2xl font-bold font-mono text-foreground">
            {totalOrders}
          </p>
          <p className="text-[10px] text-muted-foreground">All time customer orders</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-amber-500 font-mono font-semibold">
            Pending Orders
          </p>
          <p className="text-2xl font-bold font-mono text-amber-500">
            {pendingOrders}
          </p>
          <p className="text-[10px] text-muted-foreground">Requires admin confirmation</p>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-orange-500 font-mono font-semibold">
            Out for Delivery
          </p>
          <p className="text-2xl font-bold font-mono text-orange-500">
            {activeDeliveries}
          </p>
          <p className="text-[10px] text-muted-foreground">En route to customer pin</p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-mono font-semibold">
            Total Revenue
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-500">
            ₱{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">Confirmed orders volume</p>
        </div>
      </div>

      {/* 2. Live Sync Bar & Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live Feed Active</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono hidden md:inline">
            Synced: {lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            filename="scents-mists-customer-orders"
            sheetName="Orders"
            headers={[
              "Order #",
              "Date & Time",
              "Customer Name",
              "Phone",
              "Email",
              "Delivery Address",
              "Order Status",
              "Payment Method",
              "Subtotal (PHP)",
              "Delivery Fee (PHP)",
              "Discount (PHP)",
              "Total Amount (PHP)",
              "Items Purchased",
              "Customer Notes",
            ]}
            rows={exportRows}
            label="Export Orders"
          />

          <button
            type="button"
            onClick={() => refreshOrders(false)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border hover:border-accent text-foreground hover:text-accent rounded-lg transition-colors font-medium disabled:opacity-50 cursor-pointer h-8"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-accent")} />
            <span>{isRefreshing ? "Syncing..." : "Refresh Feed"}</span>
          </button>
        </div>
      </div>

      {/* 3. Search & Status Filter Badges */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, phone, address..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "preparing", label: "Preparing" },
            { id: "out_for_delivery", label: "Out for Delivery" },
            { id: "delivered", label: "Delivered" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer",
                statusFilter === tab.id
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders List Table / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-elevated/40 p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-accent">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="font-serif text-lg text-foreground font-medium">
            {search || statusFilter !== "all"
              ? "No Matching Orders Found"
              : "No Customer Orders Yet"}
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "Try adjusting your search query or status filter to see other orders."
              : "Mock data has been removed. When a real customer checks out at the storefront with their Leaflet GPS location, their order and live status will appear here immediately in real time."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const googleMapsUrl = `https://www.google.com/maps?q=${order.delivery_location.lat},${order.delivery_location.lng}`;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm space-y-4 hover:border-accent/40 transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {order.order_number}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                        statusInfo.bg,
                        statusInfo.color,
                        statusInfo.border
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(order.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Customer & Contact */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                      Customer Details
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {order.customer_name}
                    </p>
                    <p className="flex items-center gap-1.5 text-foreground font-mono">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      <a href={`tel:${order.phone}`} className="hover:underline">
                        {order.phone}
                      </a>
                    </p>
                    {order.email && (
                      <p className="text-muted-foreground">{order.email}</p>
                    )}
                  </div>

                  {/* Column 2: Delivery & Leaflet Location Pin */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-between">
                      <span>Delivery Location</span>
                      <span className="text-emerald-500 font-bold">📍 GPS Pin</span>
                    </p>
                    <p className="text-foreground leading-relaxed line-clamp-2">
                      {order.delivery_address}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Landmark:</strong> {order.landmark}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Open GPS ({order.delivery_location.lat.toFixed(4)}, {order.delivery_location.lng.toFixed(4)})</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* Column 3: Payment & Amount */}
                  <div className="space-y-1.5 md:border-l md:border-border/60 md:pl-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                      Payment &amp; Total
                    </p>
                    <p className="text-base font-bold font-mono text-accent">
                      ₱{order.total_amount.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span className="uppercase font-semibold">
                        {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Subtotal: ₱{order.subtotal.toLocaleString()} • Delivery: {order.delivery_fee === 0 ? "FREE" : `₱${order.delivery_fee}`}
                    </p>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                <div className="rounded-lg bg-surface p-3 border border-border/80 space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                    <span>Ordered Perfumes ({order.items.length})</span>
                    <span>Qty &amp; Price</span>
                  </div>

                  <div className="space-y-1.5 divide-y divide-border/40">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pt-1.5 first:pt-0 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <OrderItemThumbnail src={item.image_url} alt={item.name} />
                          <div className="truncate">
                            <span className="font-medium text-foreground">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                              ({item.volume || "50ml"})
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-foreground font-medium shrink-0 ml-3">
                          {item.quantity}x @ ₱{item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/50">
                      <strong>Customer Notes:</strong> {order.notes}
                    </div>
                  )}
                </div>

                {/* Action Bar: Status Updater */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-medium">Update Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing / Packed</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border hover:border-accent text-foreground hover:text-accent rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Full Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
                  Order Dossier
                </span>
                <h3 className="text-lg font-serif font-bold text-foreground">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground font-mono uppercase text-[10px]">
                  Customer
                </p>
                <p className="font-bold text-foreground text-sm">
                  {selectedOrder.customer_name}
                </p>
                <p className="font-mono text-accent">{selectedOrder.phone}</p>
                {selectedOrder.email && <p>{selectedOrder.email}</p>}
              </div>

              <div>
                <p className="text-muted-foreground font-mono uppercase text-[10px]">
                  Payment Status
                </p>
                <p className="font-bold uppercase text-foreground">
                  {selectedOrder.payment_method === "cod" ? "Cash on Delivery (COD)" : selectedOrder.payment_method}
                </p>
                <p className="text-emerald-500 font-semibold text-sm">
                  ₱{selectedOrder.total_amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-border text-xs space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                <span>Pinned Drop-Off Location</span>
              </p>
              <p className="text-foreground">{selectedOrder.delivery_address}</p>
              <p className="text-muted-foreground">Landmark: {selectedOrder.landmark}</p>
              <p className="text-accent font-mono text-[11px]">
                Latitude: {selectedOrder.delivery_location.lat}, Longitude: {selectedOrder.delivery_location.lng}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase text-muted-foreground">
                Items Package
              </p>
              <div className="divide-y divide-border/60 border border-border rounded-lg overflow-hidden">
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center text-xs bg-surface">
                    <span className="font-medium text-foreground">
                      {i.quantity}x {i.name} ({i.volume || "50ml"})
                    </span>
                    <span className="font-mono text-foreground font-bold">
                      ₱{(i.price * i.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
              <a
                href={`/orders/${selectedOrder.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-accent hover:underline font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Customer Live Tracking Page</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs bg-secondary text-foreground hover:bg-border rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
