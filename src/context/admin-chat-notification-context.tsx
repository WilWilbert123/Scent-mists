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
import { getAllChatThreadsAction } from "@/actions/chat.actions";
import type { ChatMessage } from "@/types/chat";

interface AdminChatNotificationContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  playNotificationSound: () => void;
}

const AdminChatNotificationContext =
  createContext<AdminChatNotificationContextValue>({
    unreadCount: 0,
    refreshUnreadCount: async () => {},
    setUnreadCount: () => {},
    playNotificationSound: () => {},
  });

function playChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Soft two-tone melodic chime (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio playback blocked or not permitted
  }
}

export function AdminChatNotificationProvider({
  initialUnreadCount = 0,
  children,
}: {
  initialUnreadCount?: number;
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCountState] = useState<number>(initialUnreadCount);
  const lastChimeTimeRef = useRef<number>(0);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    // Throttle chime sound to at most once per 2 seconds
    if (now - lastChimeTimeRef.current > 2000) {
      lastChimeTimeRef.current = now;
      playChime();
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getAllChatThreadsAction();
      if (res.success && typeof res.unreadTotal === "number") {
        setUnreadCountState(res.unreadTotal);
      }
    } catch (err) {
      console.warn("[AdminChatNotification] Refresh error:", err);
    }
  }, []);

  const setUnreadCount = useCallback(
    (countOrUpdater: number | ((prev: number) => number)) => {
      setUnreadCountState((prev) => {
        const next =
          typeof countOrUpdater === "function"
            ? countOrUpdater(prev)
            : countOrUpdater;
        // Broadcast to other tabs
        try {
          broadcastChannelRef.current?.postMessage({
            type: "unread_count_updated",
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

  // 1. Dynamic document.title synchronization
  // Prepends "(N) " to browser tab title when unread messages exist
  useEffect(() => {
    if (typeof document === "undefined") return;

    const currentTitle = document.title;
    // Strip existing prefix if any: e.g. "(3) " or "(12) "
    const cleanTitle = currentTitle.replace(/^\(\d+\)\s*/, "");

    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${cleanTitle}`;
    } else {
      document.title = cleanTitle;
    }
  }, [unreadCount]);

  // 2. Real-time synchronizations: Supabase Realtime + BroadcastChannel + Window events + Polling
  useEffect(() => {
    // A. Multi-tab BroadcastChannel
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("scent_mists_chat_sync");
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === "new_customer_message") {
          playNotificationSound();
          void refreshUnreadCount();
        } else if (data.type === "unread_count_updated" && typeof data.count === "number") {
          setUnreadCountState(data.count);
        } else if (data.type === "thread_read") {
          void refreshUnreadCount();
        }
      };
    }

    // B. Custom window event for local in-memory actions
    const handleLocalUpdate = () => {
      void refreshUnreadCount();
    };
    window.addEventListener("scent_mists_chat_updated", handleLocalUpdate);

    // C. Supabase Realtime broadcast listener on "admin-chat-feed"
    const supabase = createSupabaseBrowserClient();
    let supabaseChannel: ReturnType<NonNullable<ReturnType<typeof createSupabaseBrowserClient>>["channel"]> | null = null;

    if (supabase) {
      supabaseChannel = supabase
        .channel("admin-chat-notifications")
        .on("broadcast", { event: "new_message" }, ({ payload }) => {
          const msg = payload as ChatMessage;
          if (msg && msg.sender === "customer") {
            playNotificationSound();
            void refreshUnreadCount();
          }
        })
        .subscribe();
    }

    // D. Regular background polling ticker (every 5 seconds) to ensure 100% accuracy
    const interval = setInterval(() => {
      void refreshUnreadCount();
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scent_mists_chat_updated", handleLocalUpdate);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (supabaseChannel && supabase) {
        void supabase.removeChannel(supabaseChannel);
      }
    };
  }, [refreshUnreadCount, playNotificationSound]);

  return (
    <AdminChatNotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        setUnreadCount,
        playNotificationSound,
      }}
    >
      {children}
    </AdminChatNotificationContext.Provider>
  );
}

export function useAdminChatNotification() {
  return useContext(AdminChatNotificationContext);
}
