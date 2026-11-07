"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Store,
  Compass,
  Package,
  MessageSquare,
} from "lucide-react";
import { getOrdersByNumbersAction } from "@/actions/order.actions";
import { cn } from "@/lib/utils";

export function MobileBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  // Pre-warm client cache for all bottom tabs so changing tabs is 0ms instantaneous
  useEffect(() => {
    const bottomRoutes = ["/", "/shop", "/fragrance-guide", "/orders", "/contact"];
    bottomRoutes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {
        // ignore
      }
    });
  }, [router]);

  // Check if customer has active in-process orders on this device (decoupled from pathname for instant tab switching)
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
        // ignore background errors
      }
    }

    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 30000); // lightweight background sync every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
      label: "Guide",
      href: "/fragrance-guide",
      icon: Compass,
      isActive: pathname.startsWith("/fragrance-guide"),
    },
    {
      label: "Orders",
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
      <div className="flex h-14 items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center py-1.5 select-none rounded-lg active:opacity-75 transition-opacity",
                item.isActive
                  ? "text-accent font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    item.isActive && "scale-110"
                  )}
                  aria-hidden="true"
                />
                {item.hasNotification && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-wider uppercase font-mono font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
