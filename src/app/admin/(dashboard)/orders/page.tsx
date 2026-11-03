import React from "react";
import type { Metadata } from "next";
import { getOrdersAction } from "@/actions/order.actions";
import { AdminOrdersClient } from "./admin-orders-client";

export const metadata: Metadata = {
  title: "Orders Management | SCENTS & MISTS Admin",
  description: "Monitor customer orders, delivery locations, and order fulfillment status.",
};

export default async function AdminOrdersPage() {
  const orders = await getOrdersAction();

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6 space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          Customer Orders &amp; Delivery Management
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time order feed placed by customers, complete with Leaflet GPS map pins, contact numbers, and delivery status workflow.
        </p>
      </div>

      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}

