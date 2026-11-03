"use client";

import React, { useState } from "react";
import { Truck, CheckCircle2, Save, AlertCircle } from "lucide-react";
import type { CartDeliverySettings } from "@/types/delivery-settings";
import { updateCartDeliverySettingsAction } from "@/actions/delivery-settings.actions";
import { toast } from "@/components/ui/toast";

interface CartDeliveryPromoManagerProps {
  initialSettings: CartDeliverySettings;
}

export function CartDeliveryPromoManager({
  initialSettings,
}: CartDeliveryPromoManagerProps) {
  const [enabled, setEnabled] = useState(initialSettings.freeDeliveryPromoEnabled);
  const [threshold, setThreshold] = useState(initialSettings.threshold);
  const [promoText, setPromoText] = useState(initialSettings.promoText);
  const [successText, setSuccessText] = useState(initialSettings.successText);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      const res = await updateCartDeliverySettingsAction({
        freeDeliveryPromoEnabled: enabled,
        threshold: Number(threshold) || 0,
        promoText,
        successText,
      });

      if (res.success) {
        setIsSaved(true);
        toast.success("Delivery promotion settings updated successfully.");
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        toast.error(res.error || "Failed to update settings.");
      }
    } catch {
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-xl font-medium text-foreground">
              Cart Free Delivery Promotion
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Control whether the &ldquo;Free Delivery Meter&rdquo; banner appears in the customer&apos;s shopping cart drawer, and customize the threshold and message.
          </p>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          <span className="ml-3 text-xs font-semibold uppercase tracking-wider text-foreground">
            {enabled ? "Visible in Cart" : "Hidden (Disabled)"}
          </span>
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {!enabled && (
          <div className="flex items-center gap-2 rounded-lg bg-surface-elevated border border-border px-4 py-3 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              The free delivery banner is currently <strong>hidden</strong> in the cart drawer. Turn on the switch above if you want customers to see it.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Threshold Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Free Delivery Qualifying Subtotal (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">
                ₱
              </span>
              <input
                type="number"
                min="0"
                step="50"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                placeholder="500"
                className="w-full pl-7 pr-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Minimum order amount required to unlock free delivery.
            </p>
          </div>

          {/* Dynamic Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Preview State
            </label>
            <div className="rounded-lg border border-border bg-surface-elevated p-2.5 text-xs space-y-1">
              <p className="text-muted-foreground text-[11px]">
                Status: {enabled ? <span className="text-emerald-500 font-semibold">Active in Cart</span> : <span className="text-rose-500 font-semibold">Hidden</span>}
              </p>
              <p className="font-mono text-foreground text-[11px] truncate">
                Target: ₱{threshold.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Promo Message Before Reaching Threshold */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Message Before Threshold (use <code className="font-mono bg-surface-elevated px-1 py-0.5 rounded text-accent">&#123;amount&#125;</code> for remaining pesos)
          </label>
          <input
            type="text"
            value={promoText}
            onChange={(e) => setPromoText(e.target.value)}
            placeholder="Add ₱{amount} more for FREE Delivery"
            className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Success Message After Reaching Threshold */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Success Message Once Qualified
          </label>
          <input
            type="text"
            value={successText}
            onChange={(e) => setSuccessText(e.target.value)}
            placeholder="🎉 Congratulations! You qualify for FREE Delivery!"
            className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved &amp; synced
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Delivery Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

