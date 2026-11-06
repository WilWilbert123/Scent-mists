"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Truck,
  CheckCircle2,
  Save,
  Calendar,
  Clock,
  Tag,
  Percent,
  Banknote,
  ShieldCheck,
  Flame,
  Zap,
  AlertCircle,
} from "lucide-react";
import type {
  CartDeliverySettings,
  FlashSaleCampaign,
} from "@/types/delivery-settings";
import {
  updateCartDeliverySettingsAction,
  updateFlashSaleCampaignAction,
} from "@/actions/delivery-settings.actions";
import {
  isFlashSaleActive,
  getFlashSaleStatus,
  toDateTimeLocalString,
  type FlashSaleStatus,
} from "@/lib/promotions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface DeliveryAndPromoManagerProps {
  initialDeliverySettings: CartDeliverySettings;
  initialFlashSale: FlashSaleCampaign;
}

export function DeliveryAndPromoManager({
  initialDeliverySettings,
  initialFlashSale,
}: DeliveryAndPromoManagerProps) {
  const [activeTab, setActiveTab] = useState<"delivery" | "flash_sale">("delivery");

  // Delivery Settings State
  const [baseDeliveryFee, setBaseDeliveryFee] = useState<number>(
    initialDeliverySettings.baseDeliveryFee ?? 60
  );
  const [freePromoEnabled, setFreePromoEnabled] = useState<boolean>(
    initialDeliverySettings.freeDeliveryPromoEnabled
  );
  const [threshold, setThreshold] = useState<number>(
    initialDeliverySettings.threshold ?? 500
  );
  const [promoText, setPromoText] = useState<string>(
    initialDeliverySettings.promoText || "Add ₱{amount} more for FREE Delivery"
  );
  const [successText, setSuccessText] = useState<string>(
    initialDeliverySettings.successText || "🎉 Congratulations! You qualify for FREE Delivery!"
  );
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [isSavedDelivery, setIsSavedDelivery] = useState(false);

  // Flash Sale Campaign State
  const [fsEnabled, setFsEnabled] = useState<boolean>(initialFlashSale.enabled);
  const [fsName, setFsName] = useState<string>(
    initialFlashSale.name || "Exclusive Flash Sale"
  );
  const [fsDiscountType, setFsDiscountType] = useState<"percentage" | "fixed">(
    initialFlashSale.discountType || "percentage"
  );
  const [fsDiscountValue, setFsDiscountValue] = useState<number>(
    initialFlashSale.discountValue ?? 20
  );
  const [fsStartDate, setFsStartDate] = useState<string>(
    initialFlashSale.startDate || ""
  );
  const [fsEndDate, setFsEndDate] = useState<string>(
    initialFlashSale.endDate || ""
  );
  const [fsScope, setFsScope] = useState<"all" | "volume_50ml" | "volume_85ml">(
    initialFlashSale.scope || "all"
  );
  const [fsBannerText, setFsBannerText] = useState<string>(
    initialFlashSale.bannerText || ""
  );
  const [isSavingFs, setIsSavingFs] = useState(false);
  const [isSavedFs, setIsSavedFs] = useState(false);

  // Real-time clock for status display & countdown
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live flash sale status
  const currentFsConfig: FlashSaleCampaign = useMemo(() => ({
    enabled: fsEnabled,
    name: fsName,
    discountType: fsDiscountType,
    discountValue: fsDiscountValue,
    startDate: fsStartDate,
    endDate: fsEndDate,
    scope: fsScope,
    bannerText: fsBannerText,
  }), [fsEnabled, fsName, fsDiscountType, fsDiscountValue, fsStartDate, fsEndDate, fsScope, fsBannerText]);

  const liveStatus: FlashSaleStatus = useMemo(
    () => getFlashSaleStatus(currentFsConfig, now),
    [currentFsConfig, now]
  );

  const isCurrentlyActive = useMemo(
    () => isFlashSaleActive(currentFsConfig, now),
    [currentFsConfig, now]
  );

  // Time remaining or time until start
  const timeInfo = useMemo(() => {
    if (!fsStartDate || !fsEndDate) return null;
    const start = new Date(fsStartDate).getTime();
    const end = new Date(fsEndDate).getTime();
    const current = now.getTime();

    if (isNaN(start) || isNaN(end)) return null;

    if (current < start) {
      const diffMs = start - current;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      return { type: "until_start", hours, mins, secs, label: `Starts in ${hours}h ${mins}m ${secs}s` };
    }

    if (current >= start && current <= end) {
      const diffMs = end - current;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      return { type: "remaining", hours, mins, secs, label: `${hours}h ${mins}m ${secs}s left` };
    }

    return { type: "expired", label: "Window ended" };
  }, [fsStartDate, fsEndDate, now]);

  // Example price calculation: ₱200 perfume
  const simulation = useMemo(() => {
    const regular = 200;
    let discount = 0;
    if (fsDiscountType === "percentage") {
      discount = Math.round(regular * (Math.max(0, Math.min(99, fsDiscountValue)) / 100));
    } else {
      discount = Math.max(0, Math.min(regular - 1, fsDiscountValue));
    }
    const finalPrice = Math.max(1, regular - discount);
    const badge = fsDiscountType === "percentage" ? `-${fsDiscountValue}%` : `-₱${discount}`;
    return { regular, discount, finalPrice, badge };
  }, [fsDiscountType, fsDiscountValue]);

  // Quick Preset Handlers (Automatically activates the campaign schedule)
  const applyPreset = (preset: "nov15" | "today" | "weekend" | "next3days") => {
    setFsEnabled(true);
    const cur = new Date();
    if (preset === "nov15") {
      // 2026-11-15 00:00 to 2026-11-15 23:59 (as in user request)
      setFsStartDate("2026-11-15T00:00");
      setFsEndDate("2026-11-15T23:59");
      setFsName("Nov 15 Mega Flash Sale");
      toast.info("Applied preset: Nov 15, 2026 (Campaign ENABLED & Scheduled)");
    } else if (preset === "today") {
      const start = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 0, 0, 0);
      const end = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 23, 59, 59);
      setFsStartDate(toDateTimeLocalString(start));
      setFsEndDate(toDateTimeLocalString(end));
      toast.info("Applied preset: Today Only (Campaign ENABLED & Live until 11:59 PM)");
    } else if (preset === "weekend") {
      const day = cur.getDay(); // 0 is Sun, 6 is Sat
      const sat = new Date(cur);
      sat.setDate(cur.getDate() + ((6 - day + 7) % 7));
      sat.setHours(0, 0, 0, 0);

      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      sun.setHours(23, 59, 59, 999);

      setFsStartDate(toDateTimeLocalString(sat));
      setFsEndDate(toDateTimeLocalString(sun));
      setFsName("Weekend Fragrance Flash Sale");
      toast.info("Applied preset: Upcoming Weekend (Campaign ENABLED & Scheduled)");
    } else if (preset === "next3days") {
      const start = new Date(cur);
      const end = new Date(cur);
      end.setDate(cur.getDate() + 3);
      end.setHours(23, 59, 59, 999);
      setFsStartDate(toDateTimeLocalString(start));
      setFsEndDate(toDateTimeLocalString(end));
      toast.info("Applied preset: Next 3 Days (Campaign ENABLED & Scheduled)");
    }
  };

  // Save Delivery Settings
  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDelivery(true);
    setIsSavedDelivery(false);

    try {
      const res = await updateCartDeliverySettingsAction({
        baseDeliveryFee: Math.max(0, Number(baseDeliveryFee) || 0),
        freeDeliveryPromoEnabled: freePromoEnabled,
        threshold: Math.max(0, Number(threshold) || 0),
        promoText,
        successText,
      });

      if (res.success && res.data) {
        setIsSavedDelivery(true);
        toast.success("Delivery fee & promo threshold updated successfully!");
        setTimeout(() => setIsSavedDelivery(false), 3500);

        // Instant cross-tab broadcast
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("scent_mists_promo_sync_timestamp", String(Date.now()));
            if ("BroadcastChannel" in window) {
              const bc = new BroadcastChannel("scent_mists_promotions_channel");
              bc.postMessage({ type: "DELIVERY_UPDATED", payload: res.data });
              bc.close();
            }
            window.dispatchEvent(
              new CustomEvent("scent_mists_flash_sale_updated", {
                detail: { delivery: res.data },
              })
            );
          }
        } catch {
          // ignore
        }
      } else {
        toast.error(res.error || "Failed to update delivery settings.");
      }
    } catch {
      toast.error("An unexpected error occurred while saving delivery settings.");
    } finally {
      setIsSavingDelivery(false);
    }
  };

  // Save Flash Sale Campaign (with optional explicit enable override)
  const handleSaveFlashSale = async (
    e?: React.FormEvent,
    enableExplicitly?: boolean
  ) => {
    if (e) e.preventDefault();
    setIsSavingFs(true);
    setIsSavedFs(false);

    const targetEnabled = enableExplicitly !== undefined ? enableExplicitly : fsEnabled;
    if (enableExplicitly !== undefined && enableExplicitly !== fsEnabled) {
      setFsEnabled(enableExplicitly);
    }

    if (targetEnabled && (!fsStartDate || !fsEndDate)) {
      toast.warning("Please specify both a scheduled Start Date and End Date for the promotion.");
      setIsSavingFs(false);
      return;
    }

    if (fsStartDate && fsEndDate && new Date(fsStartDate) >= new Date(fsEndDate)) {
      toast.error("Scheduled End Date must be after the Start Date.");
      setIsSavingFs(false);
      return;
    }

    try {
      const res = await updateFlashSaleCampaignAction({
        enabled: targetEnabled,
        name: fsName.trim() || "Exclusive Flash Sale",
        discountType: fsDiscountType,
        discountValue: Math.max(1, Number(fsDiscountValue) || 1),
        startDate: fsStartDate,
        endDate: fsEndDate,
        scope: fsScope,
        bannerText: fsBannerText.trim(),
      });

      if (res.success && res.data) {
        setIsSavedFs(true);
        toast.success(
          targetEnabled
            ? "Scheduled Flash Sale campaign saved & active across store in real time!"
            : "Flash sale saved as disabled draft."
        );
        setTimeout(() => setIsSavedFs(false), 3500);

        // Instant cross-tab broadcast
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("scent_mists_promo_sync_timestamp", String(Date.now()));
            if ("BroadcastChannel" in window) {
              const bc = new BroadcastChannel("scent_mists_promotions_channel");
              bc.postMessage({ type: "FLASH_SALE_UPDATED", payload: res.data });
              bc.close();
            }
            window.dispatchEvent(
              new CustomEvent("scent_mists_flash_sale_updated", {
                detail: { flashSale: res.data },
              })
            );
          }
        } catch {
          // ignore
        }
      } else {
        toast.error(res.error || "Failed to save flash sale campaign.");
      }
    } catch {
      toast.error("An unexpected error occurred while saving flash sale campaign.");
    } finally {
      setIsSavingFs(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-xl font-medium text-foreground">
              Delivery Fee &amp; Promotion Management
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure courier delivery pricing, free shipping threshold, and automated scheduled flash sales with start and end date windows.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg border border-border bg-surface-elevated p-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("delivery")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeTab === "delivery"
                ? "bg-surface text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Truck className="h-3.5 w-3.5 text-accent" />
            <span>Courier Delivery Fee</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("flash_sale")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeTab === "flash_sale"
                ? "bg-surface text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span>Scheduled Flash Sale</span>
            {isCurrentlyActive && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COURIER DELIVERY FEE & FREE DELIVERY THRESHOLD */}
      {/* ========================================================================= */}
      {activeTab === "delivery" && (
        <form onSubmit={handleSaveDelivery} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Base Delivery Fee */}
            <div className="space-y-2 rounded-lg border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Banknote className="h-4 w-4 text-accent" />
                  Base Courier Delivery Fee (₱)
                </label>
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                  Current: ₱{baseDeliveryFee}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">
                  ₱
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={baseDeliveryFee}
                  onChange={(e) => setBaseDeliveryFee(Number(e.target.value))}
                  placeholder="60"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Flat courier delivery fee charged to the customer at checkout (e.g., ₱60, ₱80, ₱50). Applied across storefront and checkout calculations.
              </p>
            </div>

            {/* Free Delivery Threshold */}
            <div className="space-y-2 rounded-lg border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  Free Delivery Qualifying Subtotal (₱)
                </label>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={freePromoEnabled}
                    onChange={(e) => setFreePromoEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-2 text-[11px] font-semibold text-foreground">
                    {freePromoEnabled ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">
                  ₱
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  disabled={!freePromoEnabled}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  placeholder="500"
                  className={cn(
                    "w-full pl-7 pr-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono",
                    !freePromoEnabled && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Orders with a cart subtotal equal to or above this amount automatically qualify for 100% FREE delivery (₱0).
              </p>
            </div>
          </div>

          {/* Cart Drawer Messages */}
          <div className="space-y-4 rounded-lg border border-border bg-surface-elevated p-4">
            <h3 className="text-xs font-semibold text-foreground">
              Customer Cart Drawer Banner Copy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground">
                  Message before reaching threshold (use <code className="font-mono text-accent bg-surface px-1 py-0.5 rounded">&#123;amount&#125;</code> for remaining amount):
                </label>
                <input
                  type="text"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  placeholder="Add ₱{amount} more for FREE Delivery"
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground">
                  Success message once customer qualifies for free delivery:
                </label>
                <input
                  type="text"
                  value={successText}
                  onChange={(e) => setSuccessText(e.target.value)}
                  placeholder="🎉 Congratulations! You qualify for FREE Delivery!"
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Live Delivery Calculation Simulation Box */}
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent">
              <ShieldCheck className="h-4 w-4" />
              <span>Live Checkout Delivery Rule Simulation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-md bg-surface p-3 border border-border/60">
                <p className="text-muted-foreground font-mono text-[11px]">
                  Sample Order Under Threshold (₱{Math.round(threshold * 0.6)})
                </p>
                <p className="font-semibold text-foreground mt-1">
                  Courier Fee: <span className="font-mono text-accent">₱{baseDeliveryFee}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Total charged to customer: ₱{Math.round(threshold * 0.6) + baseDeliveryFee}
                </p>
              </div>

              <div className="rounded-md bg-surface p-3 border border-border/60">
                <p className="text-muted-foreground font-mono text-[11px]">
                  Sample Order Qualifying for Free Delivery (₱{threshold}+)
                </p>
                <p className="font-semibold text-foreground mt-1">
                  Courier Fee:{" "}
                  {freePromoEnabled ? (
                    <span className="font-mono text-emerald-500 font-bold">FREE (₱0)</span>
                  ) : (
                    <span className="font-mono text-accent">₱{baseDeliveryFee} (Promo Disabled)</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {freePromoEnabled
                    ? `Customer saves ₱${baseDeliveryFee} delivery fee discount.`
                    : "Free delivery promo is turned off."}
                </p>
              </div>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            {isSavedDelivery ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Delivery fee settings saved and active across checkout!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Settings persist in Supabase and sync instantly to cart and checkout.
              </span>
            )}

            <button
              type="submit"
              disabled={isSavingDelivery}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingDelivery ? "Saving Settings..." : "Save Delivery Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHEDULED FLASH SALE & PROMO ENGINE */}
      {/* ========================================================================= */}
      {activeTab === "flash_sale" && (
        <form onSubmit={handleSaveFlashSale} className="space-y-6">
          {/* Status Indicator Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border",
                  liveStatus === "active"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                    : liveStatus === "upcoming"
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                    : liveStatus === "expired"
                    ? "border-border bg-surface text-muted-foreground"
                    : "border-border bg-surface text-muted-foreground"
                )}
              >
                {liveStatus === "active" ? (
                  <Flame className="h-5 w-5 animate-pulse" />
                ) : liveStatus === "upcoming" ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Calendar className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Campaign Status:
                  </span>
                  {liveStatus === "active" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      LIVE NOW ({timeInfo?.label})
                    </span>
                  ) : liveStatus === "upcoming" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold font-mono">
                      SCHEDULED ({timeInfo?.label})
                    </span>
                  ) : liveStatus === "expired" ? (
                    <span className="rounded-full bg-muted/30 text-muted-foreground border border-border px-2.5 py-0.5 text-xs font-medium font-mono">
                      EXPIRED (Normal prices restored)
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted/20 text-muted-foreground border border-border px-2.5 py-0.5 text-xs font-medium">
                      DISABLED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {liveStatus === "active"
                    ? "Customers across the store are seeing the discounted promotional prices."
                    : liveStatus === "upcoming"
                    ? "Prices will automatically discount when the start date/time arrives without manual action."
                    : liveStatus === "expired"
                    ? "Promotion window has passed. Catalog prices automatically reverted to regular pricing."
                    : "Flash sale is currently turned off."}
                </p>
              </div>
            </div>

            {/* Campaign Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer select-none self-start sm:self-auto">
              <input
                type="checkbox"
                checked={fsEnabled}
                onChange={(e) => setFsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                {fsEnabled ? "Campaign Enabled" : "Campaign Off"}
              </span>
            </label>
          </div>

          {/* Prominent Alert Banner if Campaign is Currently Off */}
          {!fsEnabled && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <p>
                  <strong>Campaign is currently TURNED OFF.</strong> Shoppers will see normal catalog prices until the campaign is enabled and saved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFsEnabled(true);
                  toast.success("Campaign Enabled! Now click 'Save & Activate Schedule' below to launch.");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Turn Campaign ON</span>
              </button>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="rounded-lg border border-border bg-surface-elevated p-3.5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Schedule Presets:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset("nov15")}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <Calendar className="h-3 w-3 text-accent" />
                <span>Nov 15, 2026 (00:00 - 23:59)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("today")}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <Clock className="h-3 w-3 text-emerald-500" />
                <span>Today Only (Until Midnight)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("weekend")}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                <span>Upcoming Weekend (Sat - Sun)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("next3days")}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <Clock className="h-3 w-3 text-blue-500" />
                <span>Next 3 Days</span>
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Campaign Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Campaign / Sale Name
              </label>
              <input
                type="text"
                value={fsName}
                onChange={(e) => setFsName(e.target.value)}
                placeholder="e.g. Weekend Flash Sale, Payday Blast"
                className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="text-[11px] text-muted-foreground">
                Shown to customers in product badges and promotional callout cards.
              </p>
            </div>

            {/* Scope Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Fragrance Catalog Scope
              </label>
              <select
                value={fsScope}
                onChange={(e) =>
                  setFsScope(e.target.value as "all" | "volume_50ml" | "volume_85ml")
                }
                className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="all">All Fragrances (Storewide)</option>
                <option value="volume_50ml">50ml Aroma Body Mists Only</option>
                <option value="volume_85ml">85ml Luxe Perfumes Only</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Choose whether the discount applies to the entire catalog or specific perfume volumes.
              </p>
            </div>

            {/* Discount Type & Value */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Discount Calculation Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFsDiscountType("percentage")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all cursor-pointer",
                    fsDiscountType === "percentage"
                      ? "border-accent bg-accent/10 text-accent font-bold"
                      : "border-border bg-surface-elevated text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Percent className="h-3.5 w-3.5" />
                  <span>Percentage (% off)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFsDiscountType("fixed")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all cursor-pointer",
                    fsDiscountType === "fixed"
                      ? "border-accent bg-accent/10 text-accent font-bold"
                      : "border-border bg-surface-elevated text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Fixed Pesos (₱ off)</span>
                </button>
              </div>
            </div>

            {/* Discount Value Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Discount Value ({fsDiscountType === "percentage" ? "% off" : "₱ off"})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">
                  {fsDiscountType === "percentage" ? "%" : "₱"}
                </span>
                <input
                  type="number"
                  min="1"
                  max={fsDiscountType === "percentage" ? 99 : 500}
                  step={fsDiscountType === "percentage" ? 1 : 10}
                  value={fsDiscountValue}
                  onChange={(e) => setFsDiscountValue(Number(e.target.value))}
                  placeholder={fsDiscountType === "percentage" ? "20" : "40"}
                  className="w-full pl-7 pr-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {fsDiscountType === "percentage"
                  ? "e.g. 20 means 20% discount (a ₱200 perfume sells for ₱160)."
                  : "e.g. 40 means ₱40 discount (a ₱200 perfume sells for ₱160)."}
              </p>
            </div>

            {/* Scheduled Start Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Scheduled Start Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={fsStartDate}
                onChange={(e) => setFsStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Prices will automatically switch to the promo rate at this exact minute.
              </p>
            </div>

            {/* Scheduled End Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-500" />
                Scheduled End Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={fsEndDate}
                onChange={(e) => setFsEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Prices will automatically revert back to normal immediately after this minute.
              </p>
            </div>
          </div>

          {/* Announcement Banner Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Optional Announcement Banner Text
            </label>
            <input
              type="text"
              value={fsBannerText}
              onChange={(e) => setFsBannerText(e.target.value)}
              placeholder="⚡ FLASH SALE IS LIVE: Special discounts applied across our signature collection!"
              className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Live Mathematical Verification Box */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4" />
              <span>Automated Schedule Calculation Simulation</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              Based on your settings, a <strong>₱{simulation.regular} perfume</strong> will automatically display as{" "}
              <strong className="text-rose-500 font-mono text-sm">₱{simulation.finalPrice}</strong> (
              <span className="font-mono text-accent">{simulation.badge} / Save ₱{simulation.discount}</span>) between{" "}
              <span className="font-mono underline">
                {fsStartDate ? new Date(fsStartDate).toLocaleString() : "[Start Date]"}
              </span>{" "}
              and{" "}
              <span className="font-mono underline">
                {fsEndDate ? new Date(fsEndDate).toLocaleString() : "[End Date]"}
              </span>
              . Once the end date passes, the perfume immediately reverts to <strong>₱{simulation.regular}</strong> with zero manual intervention required.
            </p>
          </div>

          {/* Save Action Bar with Clear Activation Choices */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-4">
            {isSavedFs ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Flash sale campaign saved and synchronized in real time!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Automated scheduler runs directly against current timestamp with instant multi-tab sync.
              </span>
            )}

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!fsEnabled ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveFlashSale(undefined, false)}
                    disabled={isSavingFs}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-accent/60 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save as Draft (Off)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveFlashSale(undefined, true)}
                    disabled={isSavingFs}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    <Zap className="h-4 w-4" />
                    <span>{isSavingFs ? "Activating..." : "Save & Activate Schedule (Live)"}</span>
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={isSavingFs}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Zap className="h-4 w-4" />
                  <span>{isSavingFs ? "Saving..." : "Save & Update Live Campaign"}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
