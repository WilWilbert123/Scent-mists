"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  ExternalLink,
  Eye,
  X,
  RefreshCw,
  CheckSquare,
  Square,
  MinusSquare,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";
import {
  getOrdersAction,
  updateOrderStatusAction,
  bulkUpdateOrderStatusAction,
} from "@/actions/order.actions";
import { ExportButton } from "@/components/admin/shared/export-button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    shortLabel: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    stepIndex: number;
  }
> = {
  pending: {
    label: "Pending Review",
    shortLabel: "Pending",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    stepIndex: 0,
  },
  confirmed: {
    label: "Confirmed",
    shortLabel: "Confirmed",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
    stepIndex: 1,
  },
  preparing: {
    label: "Preparing / Packed",
    shortLabel: "Preparing",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    dot: "bg-purple-500",
    stepIndex: 2,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    shortLabel: "Out for Delivery",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
    stepIndex: 3,
  },
  delivered: {
    label: "Delivered",
    shortLabel: "Delivered",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    stepIndex: 4,
  },
  cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
    stepIndex: -1,
  },
};

const ORDER_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

function OrderItemThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(
    src || "/images/products/sakura-mountain-mist.webp"
  );

  return (
    <div className="relative h-8 w-7 shrink-0 rounded overflow-hidden border border-border/80 bg-background shadow-xs">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="32px"
        className="object-cover"
        onError={() => setImgSrc("/images/products/sakura-mountain-mist.webp")}
      />
    </div>
  );
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real-time synchronization
  const refreshOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const fresh = await getOrdersAction();
      setOrders(fresh);
      setLastSynced(new Date());
      if (!silent) {
        toast.success("Orders synchronized with live feed.");
      }
    } catch {
      if (!silent) toast.error("Failed to refresh orders feed.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // Poll for new customer orders every 5 seconds for snappy realtime
  useEffect(() => {
    const timer = setInterval(() => {
      refreshOrders(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [refreshOrders]);

  // Keep selected order in sync with incoming refreshes
  useEffect(() => {
    if (selectedOrder) {
      const match = orders.find((o) => o.id === selectedOrder.id);
      if (match && match.status !== selectedOrder.status) {
        setSelectedOrder(match);
      }
    }
  }, [orders, selectedOrder]);

  // Status Counts & Metrics
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (map[o.status] !== undefined) {
        map[o.status]++;
      }
    });
    return map;
  }, [orders]);

  const totalRevenue = useMemo(
    () =>
      orders.reduce(
        (sum, o) => (o.status !== "cancelled" ? sum + o.total_amount : sum),
        0
      ),
    [orders]
  );

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;
      const matchesSearch =
        !q ||
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.phone.includes(q) ||
        order.delivery_address.toLowerCase().includes(q) ||
        order.items.some((i) => i.name.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  // Selection Logic
  const allFilteredSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.has(o.id));

  const someFilteredSelected =
    filteredOrders.some((o) => selectedIds.has(o.id)) && !allFilteredSelected;

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all in current view
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredOrders.forEach((o) => next.delete(o.id));
        return next;
      });
    } else {
      // Select all in current view
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredOrders.forEach((o) => next.add(o.id));
        return next;
      });
    }
  };

  const handleToggleSelect = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Status Change (Individual)
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    e?: React.ChangeEvent<HTMLSelectElement> | React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to "${STATUS_CONFIG[newStatus].label}".`);
      } else {
        toast.error(res.error || "Failed to update order status.");
        refreshOrders(true);
      }
    } catch {
      toast.error("Error updating order status.");
      refreshOrders(true);
    }
  };

  // Bulk Status Update (Multiple Select)
  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    if (selectedIds.size === 0) return;
    const idsToUpdate = Array.from(selectedIds);
    setIsBulkUpdating(true);

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (selectedIds.has(o.id) ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await bulkUpdateOrderStatusAction(idsToUpdate, newStatus);
      if (res.success) {
        toast.success(
          `Updated ${res.updatedCount || idsToUpdate.length} order(s) to "${STATUS_CONFIG[newStatus].label}".`
        );
        setSelectedIds(new Set());
      } else {
        toast.error(res.error || "Failed to bulk update orders.");
        refreshOrders(true);
      }
    } catch {
      toast.error("Error performing bulk status update.");
      refreshOrders(true);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleCopyOrderNumber = (e: React.MouseEvent, num: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    toast.success(`Copied "${num}" to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CSV Export Data
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border bg-surface-elevated p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            Total Orders
          </p>
          <p className="text-2xl font-bold font-mono text-foreground">
            {counts.all}
          </p>
          <p className="text-[10px] text-muted-foreground">All time feed</p>
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono font-semibold">
            Pending
          </p>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {counts.pending}
          </p>
          <p className="text-[10px] text-muted-foreground">Needs review</p>
        </div>

        <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono font-semibold">
            Confirmed
          </p>
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {counts.confirmed}
          </p>
          <p className="text-[10px] text-muted-foreground">Verified orders</p>
        </div>

        <div className="rounded-xl border border-purple-500/25 bg-purple-500/5 p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono font-semibold">
            Preparing
          </p>
          <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {counts.preparing}
          </p>
          <p className="text-[10px] text-muted-foreground">Packing bottles</p>
        </div>

        <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono font-semibold">
            Out for Delivery
          </p>
          <p className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
            {counts.out_for_delivery}
          </p>
          <p className="text-[10px] text-muted-foreground">En route</p>
        </div>

        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            Revenue
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate">
            ₱{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">Volume total</p>
        </div>
      </div>

      {/* 2. Controls Bar: Live Sync, Search & Export */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone, location, fragrance..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">Live 5s Feed</span>
            <span className="text-[10px] text-muted-foreground hidden lg:inline">
              ({lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
            </span>
          </div>

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
            label="Export"
          />

          <button
            type="button"
            onClick={() => refreshOrders(false)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border hover:border-accent text-foreground hover:text-accent rounded-lg transition-colors font-medium disabled:opacity-50 cursor-pointer h-8"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-accent")} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* 3. Category / Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: "all", label: "All Orders", count: counts.all },
          { id: "pending", label: "Pending", count: counts.pending, color: "text-amber-500" },
          { id: "confirmed", label: "Confirmed", count: counts.confirmed, color: "text-blue-500" },
          { id: "preparing", label: "Preparing", count: counts.preparing, color: "text-purple-500" },
          { id: "out_for_delivery", label: "Out for Delivery", count: counts.out_for_delivery, color: "text-orange-500" },
          { id: "delivered", label: "Delivered", count: counts.delivered, color: "text-emerald-500" },
          { id: "cancelled", label: "Cancelled", count: counts.cancelled, color: "text-rose-500" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setStatusFilter(tab.id);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer border",
              statusFilter === tab.id
                ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                statusFilter === tab.id
                  ? "bg-background/20 text-background font-bold"
                  : "bg-surface-elevated text-muted-foreground border border-border/60"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 4. BULK ACTION BAR (Visible when 1+ selected) */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-accent/10 border border-accent/30 text-xs animate-in fade-in slide-in-from-top-1 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent text-accent-foreground font-bold font-mono text-xs">
              {selectedIds.size}
            </span>
            <span className="font-medium text-foreground">
              order{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              Deselect All
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">
              Tag Status:
            </span>
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("confirmed")}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Mark Confirmed
            </button>
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("preparing")}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Mark Preparing
            </button>
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("out_for_delivery")}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Out for Delivery
            </button>
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("delivered")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Mark Delivered
            </button>
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatusChange("cancelled")}
              className="px-2 py-1 bg-surface border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 5. DENSE 1-LINE ORDERS TABLE */}
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
              : "When a customer checks out at the storefront with their GPS location, their order and live status will appear here immediately in real time."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface-elevated shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              {/* TABLE HEADER */}
              <thead>
                <tr className="border-b border-border bg-surface text-[10px] font-mono uppercase tracking-wider text-muted-foreground select-none">
                  <th className="py-3 px-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title={allFilteredSelected ? "Deselect All" : "Select All Filtered"}
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="h-4 w-4 text-accent" />
                      ) : someFilteredSelected ? (
                        <MinusSquare className="h-4 w-4 text-accent" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 min-w-[150px]">Order # / Date</th>
                  <th className="py-3 px-3 min-w-[170px]">Customer</th>
                  <th className="py-3 px-3 min-w-[180px]">Delivery Pin</th>
                  <th className="py-3 px-3 min-w-[200px]">Items Summary</th>
                  <th className="py-3 px-3 min-w-[110px]">Total &amp; Pay</th>
                  <th className="py-3 px-3 min-w-[150px]">Status</th>
                  <th className="py-3 px-3 text-right w-24">Action</th>
                </tr>
              </thead>

              {/* TABLE BODY (1-LINE ROWS) */}
              <tbody className="divide-y divide-border/60">
                {filteredOrders.map((order) => {
                  const isSelected = selectedIds.has(order.id);
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const googleMapsUrl = `https://www.google.com/maps?q=${order.delivery_location.lat},${order.delivery_location.lng}`;
                  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const formattedTime = new Date(order.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  // Compact summary of items
                  const firstItem = order.items[0];
                  const extraCount = order.items.length - 1;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={cn(
                        "group hover:bg-surface/70 transition-colors cursor-pointer",
                        isSelected && "bg-accent/5 hover:bg-accent/10"
                      )}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-3.5 text-center"
                        onClick={(e) => handleToggleSelect(order.id, e)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-accent" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Order Code & Date */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-foreground text-xs hover:text-accent transition-colors">
                            {order.order_number}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyOrderNumber(e, order.order_number)}
                            className="p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                            title="Copy Order #"
                          >
                            {copiedId === order.order_number ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {formattedDate} • {formattedTime}
                        </p>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground truncate max-w-[160px]">
                          {order.customer_name}
                        </p>
                        <a
                          href={`tel:${order.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-muted-foreground hover:text-accent font-mono block truncate"
                        >
                          {order.phone}
                        </a>
                      </td>

                      {/* Delivery Pin / Location */}
                      <td className="py-3 px-3">
                        <p className="text-foreground truncate max-w-[170px]" title={order.delivery_address}>
                          {order.delivery_address}
                        </p>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                        >
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>GPS Pin</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </td>

                      {/* Items Summary with thumbnails */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 max-w-[210px]">
                          <div className="flex -space-x-2 shrink-0">
                            {order.items.slice(0, 2).map((item, i) => (
                              <div
                                key={i}
                                className="relative h-7 w-6 rounded border border-border/80 overflow-hidden bg-surface shadow-xs"
                              >
                                <OrderItemThumbnail src={item.image_url} alt={item.name} />
                              </div>
                            ))}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate text-[11px]" title={firstItem ? firstItem.name : "Fragrance"}>
                              {firstItem ? `${firstItem.name}` : "Fragrance"}
                              {extraCount > 0 && (
                                <span className="text-[10px] text-accent font-mono font-bold ml-1">
                                  +{extraCount} more
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {order.items.reduce((s, i) => s + (i.quantity || 1), 0)} unit(s) total
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-3 px-3">
                        <p className="font-bold font-mono text-foreground text-xs">
                          ₱{order.total_amount.toLocaleString()}
                        </p>
                        <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-muted-foreground mt-0.5">
                          {order.payment_method === "cod" ? "COD" : order.payment_method}
                        </span>
                      </td>

                      {/* Interactive Status Selector */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-full max-w-[145px]">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus, e)
                            }
                            className={cn(
                              "w-full appearance-none pl-6 pr-7 py-1 text-[11px] font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors",
                              statusInfo.bg,
                              statusInfo.color,
                              statusInfo.border
                            )}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span
                            className={cn(
                              "absolute left-2.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full pointer-events-none",
                              statusInfo.dot
                            )}
                          />
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-current opacity-70 pointer-events-none" />
                        </div>
                      </td>

                      {/* Row Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-surface hover:bg-surface-elevated border border-border hover:border-accent text-foreground hover:text-accent rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="p-3 border-t border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
            <span>
              Showing {filteredOrders.length} of {orders.length} order{orders.length === 1 ? "" : "s"}
            </span>
            <span className="text-[11px] font-mono">
              Click any order row to inspect dossier &amp; Leaflet drop pin
            </span>
          </div>
        </div>
      )}

      {/* 6. ORDER DOSSIER FULL DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                    Order Dossier
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1",
                      STATUS_CONFIG[selectedOrder.status]?.bg,
                      STATUS_CONFIG[selectedOrder.status]?.color,
                      STATUS_CONFIG[selectedOrder.status]?.border
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{STATUS_CONFIG[selectedOrder.status]?.label}</span>
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mt-1 flex items-center gap-2">
                  <span>{selectedOrder.order_number}</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyOrderNumber(e, selectedOrder.order_number)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Copy Order #"
                  >
                    {copiedId === selectedOrder.order_number ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Placed on{" "}
                  {new Date(selectedOrder.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visual Delivery Status Flow Tracker */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Delivery Timeline Workflow
              </p>
              <div className="grid grid-cols-5 gap-1 pt-1">
                {ORDER_STEPS.map((step, idx) => {
                  const currentIdx = STATUS_CONFIG[selectedOrder.status]?.stepIndex ?? 0;
                  const isCompleted = currentIdx >= idx && selectedOrder.status !== "cancelled";
                  const isCurrent = currentIdx === idx && selectedOrder.status !== "cancelled";

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center space-y-1">
                      <div
                        className={cn(
                          "h-2 w-full rounded-full transition-all",
                          isCurrent
                            ? "bg-accent shadow-xs"
                            : isCompleted
                            ? "bg-emerald-500"
                            : "bg-border/60"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium leading-tight",
                          isCurrent
                            ? "text-accent font-bold"
                            : isCompleted
                            ? "text-foreground"
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

            {/* Quick Status Update Bar in Modal */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/20">
              <span className="text-xs font-semibold text-foreground">
                Set Delivery Workflow Status:
              </span>
              <div className="relative">
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className={cn(
                    "pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer",
                    STATUS_CONFIG[selectedOrder.status]?.bg,
                    STATUS_CONFIG[selectedOrder.status]?.color,
                    STATUS_CONFIG[selectedOrder.status]?.border
                  )}
                >
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing / Packed</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-current opacity-70 pointer-events-none" />
              </div>
            </div>

            {/* 2-Column Info: Customer & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer Column */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                  Recipient Information
                </p>
                <p className="text-sm font-bold text-foreground">
                  {selectedOrder.customer_name}
                </p>
                <p className="flex items-center gap-1.5 font-mono text-accent">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <a href={`tel:${selectedOrder.phone}`} className="hover:underline">
                    {selectedOrder.phone}
                  </a>
                </p>
                {selectedOrder.email && (
                  <p className="text-muted-foreground truncate">{selectedOrder.email}</p>
                )}
              </div>

              {/* Payment Column */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                  Payment Summary
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <span className="font-semibold text-foreground uppercase">
                    {selectedOrder.payment_method === "cod" ? "Cash on Delivery" : selectedOrder.payment_method}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-mono text-foreground">₱{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="font-mono text-foreground">
                    {selectedOrder.delivery_fee === 0 ? "FREE" : `₱${selectedOrder.delivery_fee}`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/80">
                  <span className="font-bold text-foreground">Grand Total:</span>
                  <span className="font-bold font-mono text-accent text-sm">
                    ₱{selectedOrder.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Pin & Address */}
            <div className="p-3.5 bg-surface rounded-xl border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <span>Pinned Delivery Coordinates</span>
                </p>
                <a
                  href={`https://www.google.com/maps?q=${selectedOrder.delivery_location.lat},${selectedOrder.delivery_location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-foreground leading-relaxed">
                {selectedOrder.delivery_address}
              </p>
              {selectedOrder.landmark && (
                <p className="text-muted-foreground">
                  <strong>Landmark:</strong> {selectedOrder.landmark}
                </p>
              )}
              <p className="text-accent font-mono text-[11px]">
                Latitude: {selectedOrder.delivery_location.lat.toFixed(6)}, Longitude:{" "}
                {selectedOrder.delivery_location.lng.toFixed(6)}
              </p>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Ordered Perfumes Package ({selectedOrder.items.length})
              </p>
              <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden">
                {selectedOrder.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex justify-between items-center text-xs bg-surface hover:bg-surface-elevated transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <OrderItemThumbnail src={i.image_url} alt={i.name} />
                      <div>
                        <p className="font-medium text-foreground text-xs">{i.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {i.volume || "50ml"} • ₱{i.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-foreground">
                        ₱{(i.price * i.quantity).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Qty: {i.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 rounded-lg bg-surface border border-border text-xs">
                <span className="font-semibold text-foreground">Customer Notes: </span>
                <span className="text-muted-foreground">{selectedOrder.notes}</span>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
              <Link
                href={`/orders/${selectedOrder.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Customer Live Tracking Page ↗</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-5 py-2 text-xs bg-surface border border-border hover:border-foreground/30 text-foreground rounded-lg transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
