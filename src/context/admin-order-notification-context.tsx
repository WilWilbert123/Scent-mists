"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPendingOrdersCountAction } from "@/actions/order.actions";

interface AdminOrderNotificationContextValue {
  pendingOrdersCount: number;
  totalOrdersCount: number;
  refreshPendingOrdersCount: () => Promise<void>;
  setPendingOrdersCount: (count: number | ((prev: number) => number)) => void;
  playOrderNotificationSound: () => void;
}

const AdminOrderNotificationContext =
  createContext<AdminOrderNotificationContextValue>({
    pendingOrdersCount: 0,
    totalOrdersCount: 0,
    refreshPendingOrdersCount: async () => {},
    setPendingOrdersCount: () => {},
    playOrderNotificationSound: () => {},
  });

function playOrderChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    // Elegant luxury harmonic chime (E5 -> B5, 659.25Hz -> 987.77Hz)
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.16);

    osc2.frequency.setValueAtTime(329.63, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(493.88, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.46);
    osc2.stop(ctx.currentTime + 0.46);
  } catch {
    // Audio playback blocked or not permitted
  }
}

export function AdminOrderNotificationProvider({
  initialPendingCount = 0,
  initialTotalCount = 0,
  children,
}: {
  initialPendingCount?: number;
  initialTotalCount?: number;
  children: React.ReactNode;
}) {
  const [pendingOrdersCount, setPendingOrdersCountState] =
    useState<number>(initialPendingCount);
  const [totalOrdersCount, setTotalOrdersCount] =
    useState<number>(initialTotalCount);

  const lastChimeTimeRef = useRef<number>(0);
  const prevPendingCountRef = useRef<number>(initialPendingCount);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const playOrderNotificationSound = useCallback(() => {
    const now = Date.now();
    // Throttle chime sound to at most once per 2 seconds
    if (now - lastChimeTimeRef.current > 2000) {
      lastChimeTimeRef.current = now;
      playOrderChime();
    }
  }, []);

  const refreshPendingOrdersCount = useCallback(async () => {
    try {
      const res = await getPendingOrdersCountAction();
      if (res.success && typeof res.pendingCount === "number") {
        setPendingOrdersCountState((prev) => {
          // If pending orders increased, play celebratory notification chime
          if (res.pendingCount > prev && prevPendingCountRef.current < res.pendingCount) {
            playOrderNotificationSound();
          }
          prevPendingCountRef.current = res.pendingCount;
          return res.pendingCount;
        });
        setTotalOrdersCount(res.totalCount);
      }
    } catch (err) {
      console.warn("[AdminOrderNotification] Refresh error:", err);
    }
  }, [playOrderNotificationSound]);

  const setPendingOrdersCount = useCallback(
    (countOrUpdater: number | ((prev: number) => number)) => {
      setPendingOrdersCountState((prev) => {
        const next =
          typeof countOrUpdater === "function"
            ? countOrUpdater(prev)
            : countOrUpdater;
        prevPendingCountRef.current = next;
        // Broadcast to other tabs
        try {
          broadcastChannelRef.current?.postMessage({
            type: "pending_count_updated",
            count: next,
          });
        } catch {
          // ignore broadcast errors
        }
        return next;
      });
    },
    []
  );

  // Real-time synchronizations: Supabase Realtime + BroadcastChannel + Window events + Polling + Focus
  useEffect(() => {
    // A. Multi-tab BroadcastChannel
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("scent_mists_orders_channel");
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === "new_order_placed") {
          playOrderNotificationSound();
          void refreshPendingOrdersCount();
        } else if (
          data.type === "pending_count_updated" &&
          typeof data.count === "number"
        ) {
          setPendingOrdersCountState(data.count);
          prevPendingCountRef.current = data.count;
        } else if (data.type === "order_status_changed") {
          void refreshPendingOrdersCount();
        }
      };
    }

    // B. Custom window event for local in-memory actions
    const handleLocalUpdate = () => {
      void refreshPendingOrdersCount();
    };
    window.addEventListener("scent_mists_orders_updated", handleLocalUpdate);

    // C. Window focus: instantly refresh when administrator returns to tab
    const handleWindowFocus = () => {
      void refreshPendingOrdersCount();
    };
    window.addEventListener("focus", handleWindowFocus);

    // D. Supabase Realtime listener on site_content (orders_list)
    const supabase = createSupabaseBrowserClient();
    let supabaseChannel: ReturnType<
      NonNullable<ReturnType<typeof createSupabaseBrowserClient>>["channel"]
    > | null = null;

    if (supabase) {
      supabaseChannel = supabase
        .channel("admin-orders-realtime-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "site_content",
            filter: "content_key=eq.orders_list",
          },
          () => {
            void refreshPendingOrdersCount();
          }
        )
        .on("broadcast", { event: "new_order" }, () => {
          playOrderNotificationSound();
          void refreshPendingOrdersCount();
        })
        .on("broadcast", { event: "order_status_changed" }, () => {
          void refreshPendingOrdersCount();
        })
        .subscribe();
    }

    // E. 5-second polling ticker to guarantee 100% accuracy and freshness
    const interval = setInterval(() => {
      void refreshPendingOrdersCount();
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scent_mists_orders_updated", handleLocalUpdate);
      window.removeEventListener("focus", handleWindowFocus);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (supabaseChannel && supabase) {
        void supabase.removeChannel(supabaseChannel);
      }
    };
  }, [refreshPendingOrdersCount, playOrderNotificationSound]);

  return (
    <AdminOrderNotificationContext.Provider
      value={{
        pendingOrdersCount,
        totalOrdersCount,
        refreshPendingOrdersCount,
        setPendingOrdersCount,
        playOrderNotificationSound,
      }}
    >
      {children}
    </AdminOrderNotificationContext.Provider>
  );
}

export function useAdminOrderNotification() {
  return useContext(AdminOrderNotificationContext);
}

