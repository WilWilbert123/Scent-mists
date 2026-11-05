"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  Package,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { getOrdersByNumbersAction } from "@/actions/order.actions";
import { cn } from "@/lib/utils";

export function MobileBottomBar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  // Check if customer has active in-process orders on this device
  useEffect(() => {
    let isMounted = true;
    async function checkActiveOrders() {
      try {
        const stored = localStorage.getItem("scent_mists_customer_orders");
        const lastOrder = localStorage.getItem("scent_mists_last_order");
        const orderNumbers: string[] = [];

        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) orderNumbers.push(...parsed);
        }
        if (lastOrder) {
          const parsed = JSON.parse(lastOrder);
          if (parsed?.order_number && !orderNumbers.includes(parsed.order_number)) {
            orderNumbers.push(parsed.order_number);
          }
        }

        if (orderNumbers.length > 0) {
          const orders = await getOrdersByNumbersAction(orderNumbers.slice(0, 5));
          if (isMounted) {
            const hasInProcess = orders.some(
              (o) =>
                o.status === "pending" ||
                o.status === "confirmed" ||
                o.status === "preparing" ||
                o.status === "out_for_delivery"
            );
            setHasActiveOrder(hasInProcess);
          }
        }
      } catch {
        // ignore
      }
    }

    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 15000); // sync every 15s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      href: "/shop",
      icon: Store,
      isActive:
        pathname === "/shop" ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/collections"),
    },
    {
      label: "My Orders",
      href: "/orders",
      icon: Package,
      isActive: pathname.startsWith("/orders"),
      hasNotification: hasActiveOrder,
    },
    {
      label: "Concierge",
      href: "/contact",
      icon: MessageSquare,
      isActive: pathname === "/contact",
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121212] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {/* Tab 1: Home */}
        <Link
          href={navItems[0].href}
          className={cn(
            "flex flex-1 flex-col items-center justify-center py-1 transition-all rounded-lg select-none",
            navItems[0].isActive
              ? "text-accent font-semibold"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          )}
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-mono font-medium">
            {navItems[0].label}
          </span>
        </Link>

        {/* Tab 2: Shop */}
        <Link
          href={navItems[1].href}
          className={cn(
            "flex flex-1 flex-col items-center justify-center py-1 transition-all rounded-lg select-none",
            navItems[1].isActive
              ? "text-accent font-semibold"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          )}
        >
          <Store className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-mono font-medium">
            {navItems[1].label}
          </span>
        </Link>

        {/* Tab 3: Cart (Direct Action Drawer Button with Live Counter Badge) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-1 flex-col items-center justify-center py-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all cursor-pointer rounded-lg select-none"
          aria-label={`Open Cart (${totalItems} items)`}
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-accent-foreground px-1 text-[9px] font-bold font-mono shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-mono font-medium">
            Cart
          </span>
        </button>

        {/* Tab 4: My Orders / Track with Active Pulse Badge */}
        <Link
          href={navItems[2].href}
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center py-1 transition-all rounded-lg select-none",
            navItems[2].isActive
              ? "text-accent font-semibold"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          )}
        >
          <div className="relative">
            <Package className="h-5 w-5" aria-hidden="true" />
            {hasActiveOrder && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-mono font-medium">
            {navItems[2].label}
          </span>
        </Link>

        {/* Tab 5: Concierge / Contact */}
        <Link
          href={navItems[3].href}
          className={cn(
            "flex flex-1 flex-col items-center justify-center py-1 transition-all rounded-lg select-none",
            navItems[3].isActive
              ? "text-accent font-semibold"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          )}
        >
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-mono font-medium">
            {navItems[3].label}
          </span>
        </Link>
      </div>
    </nav>
  );
}

