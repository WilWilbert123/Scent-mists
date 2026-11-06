"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Check,
  CheckCheck,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getAllChatThreadsAction,
  sendChatMessageAction,
  markChatThreadReadAction,
  updateChatThreadStatusAction,
} from "@/actions/chat.actions";
import { useAdminChatNotification } from "@/context/admin-chat-notification-context";
import type { ChatMessage, ChatThread } from "@/types/chat";
import { cn } from "@/lib/utils";

const CANNED_REPLIES = [
  { label: "📦 In Stock & COD", text: "Hi! Yes, this item is in stock and available for Cash on Delivery (COD)." },
  { label: "👋 Welcome", text: "Thank you for contacting SCENTS & MISTS! How may we assist with your fragrance order today?" },
  { label: "📍 Pin Location", text: "You can pin your exact house or gate location on our checkout map for accurate courier delivery." },
  { label: "🌸 Scent Sillage", text: "Our 50ml Aroma Mists are oil-rich formulations designed to project and last 6–8 hours." },
  { label: "🚚 Packing Today", text: "Your order has been verified and our team is preparing it for dispatch today!" },
];

interface AdminChatHubProps {
  initialThreads: ChatThread[];
  initialUnreadCount?: number;
}

export function AdminChatHub({
  initialThreads,
  initialUnreadCount = 0,
}: AdminChatHubProps) {
  const { setUnreadCount } = useAdminChatNotification();
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    initialThreads[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "active" | "resolved">("all");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeThread = threads.find((t) => t.id === selectedThreadId);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const replyInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync unread count to global admin notification context whenever threads update
  useEffect(() => {
    const unread = threads.reduce((acc, t) => acc + (t.unreadByAdminCount || 0), 0);
    setUnreadCount(unread);
  }, [threads, setUnreadCount]);

  // Auto-scroll messages
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [selectedThreadId, activeThread?.messages, scrollToBottom]);

  // Mark selected thread as read by admin
  useEffect(() => {
    if (!selectedThreadId) return;

    void (async () => {
      await markChatThreadReadAction(selectedThreadId, "admin");
      setThreads((prev) =>
        prev.map((t) => (t.id === selectedThreadId ? { ...t, unreadByAdminCount: 0 } : t))
      );
      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel("scent_mists_chat_sync");
          bc.postMessage({ type: "thread_read", threadId: selectedThreadId });
          bc.close();
        }
      } catch {
        // ignore broadcast errors
      }
    })();
  }, [selectedThreadId]);

  const refreshThreads = useCallback(async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await getAllChatThreadsAction();
      if (res.success && res.threads) {
        setThreads(res.threads);
        if (!selectedThreadId && res.threads.length > 0) {
          setSelectedThreadId(res.threads[0].id);
        }
      }
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, [selectedThreadId]);

  // Real-time synchronization: listen for Supabase broadcasts, BroadcastChannel, and poll
  useEffect(() => {
    // 1. Multi-tab BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("scent_mists_chat_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "new_customer_message") {
          void refreshThreads(false);
        }
      };
    }

    // 2. Custom window event
    const handleLocalUpdate = () => {
      void refreshThreads(false);
    };
    window.addEventListener("scent_mists_chat_updated", handleLocalUpdate);

    // 3. Supabase Realtime channel
    const supabase = createSupabaseBrowserClient();
    let channel: ReturnType<NonNullable<ReturnType<typeof createSupabaseBrowserClient>>["channel"]> | null = null;

    if (supabase) {
      channel = supabase.channel("admin-chat-feed");
      channel
        .on("broadcast", { event: "new_message" }, ({ payload }) => {
          const msg = payload as ChatMessage;
          if (!msg || !msg.threadId) return;

          setThreads((prev) => {
            const index = prev.findIndex((t) => t.id === msg.threadId);
            if (index === -1) {
              // New thread arrived
              void refreshThreads(false);
              return prev;
            }
            const updated = [...prev];
            const target = { ...updated[index] };
            if (!target.messages.some((m) => m.id === msg.id)) {
              target.messages = [...target.messages, msg];
              target.lastMessageText = msg.text;
              target.lastMessageSender = msg.sender;
              target.updatedAt = msg.timestamp;
              if (msg.sender === "customer" && target.id !== selectedThreadId) {
                target.unreadByAdminCount = (target.unreadByAdminCount || 0) + 1;
              }
              updated.splice(index, 1);
              updated.unshift(target);
            }
            return updated;
          });
        })
        .subscribe();
    }

    // 4. Regular polling fallback every 5 seconds
    const interval = setInterval(() => {
      void refreshThreads(false);
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scent_mists_chat_updated", handleLocalUpdate);
      if (bc) bc.close();
      if (channel && supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [selectedThreadId, refreshThreads]);

  // Filter threads
  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerContact && t.customerContact.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === "unread") return (t.unreadByAdminCount || 0) > 0;
    if (filterStatus === "active") return t.status === "active";
    if (filterStatus === "resolved") return t.status === "resolved";
    return true;
  });

  // Send admin reply
  const handleSendReply = async (textToSend?: string) => {
    const content = (textToSend ?? replyText).trim();
    if (!content || !selectedThreadId || isSending) return;

    setReplyText("");
    setIsSending(true);

    const optimisticId = `admin_temp_${Date.now()}`;
    const now = new Date().toISOString();
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      threadId: selectedThreadId,
      sender: "seller",
      senderName: "SCENTS & MISTS",
      text: content,
      timestamp: now,
      status: "sending",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            lastMessageText: content,
            lastMessageSender: "seller",
            updatedAt: now,
            messages: [...t.messages, optimisticMsg],
          };
        }
        return t;
      })
    );
    scrollToBottom();

    try {
      const res = await sendChatMessageAction({
        threadId: selectedThreadId,
        sender: "seller",
        senderName: "SCENTS & MISTS",
        text: content,
      });

      if (res.success && res.message) {
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === selectedThreadId) {
              return {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === optimisticId ? { ...res.message!, status: "delivered" } : m
                ),
              };
            }
            return t;
          })
        );

        // Broadcast to customer
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
          const ch = supabase.channel(`live-chat:${selectedThreadId}`);
          void ch.send({
            type: "broadcast",
            event: "new_message",
            payload: res.message,
          });
        }
      }
    } finally {
      setIsSending(false);
      replyInputRef.current?.focus();
    }
  };

  const handleStatusChange = async (newStatus: "active" | "resolved" | "archived") => {
    if (!selectedThreadId) return;
    await updateChatThreadStatusAction(selectedThreadId, newStatus);
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedThreadId ? { ...t, status: newStatus } : t))
    );
  };

  const totalUnread =
    threads.reduce((acc, t) => acc + (t.unreadByAdminCount || 0), 0) || initialUnreadCount;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-13rem)] min-h-[620px] max-h-[820px] w-full rounded-2xl border border-border bg-surface-elevated overflow-hidden shadow-sm">
      {/* =================================================================== */}
      {/* 1. LEFT COLUMN: CONVERSATION LIST (320px - 380px) */}
      {/* =================================================================== */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-surface/40 dark:bg-[#1C1A19]">
        {/* Header & Search */}
        <div className="p-3.5 sm:p-4 border-b border-border space-y-3 bg-surface-elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              <h2 className="font-serif text-sm sm:text-base font-semibold text-foreground">
                Live Conversations
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground font-mono">
                  {totalUnread} new
                </span>
              )}
              <button
                type="button"
                onClick={() => refreshThreads(true)}
                disabled={isRefreshing}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-md transition-colors cursor-pointer"
                title="Refresh conversations"
                aria-label="Refresh conversations"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or message..."
              className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
            {(["all", "unread", "active", "resolved"] as const).map((st) => {
              const count =
                st === "all"
                  ? threads.length
                  : st === "unread"
                  ? threads.filter((t) => (t.unreadByAdminCount || 0) > 0).length
                  : threads.filter((t) => t.status === st).length;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors whitespace-nowrap cursor-pointer",
                    filterStatus === st
                      ? "bg-foreground text-background shadow-2xs font-semibold"
                      : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{st}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread List Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No conversations found matching filters.
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = thread.id === selectedThreadId;
              const hasUnread = (thread.unreadByAdminCount || 0) > 0;
              const timeString = new Date(thread.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={cn(
                    "w-full text-left p-3 sm:p-3.5 transition-colors flex items-start gap-3 cursor-pointer",
                    isSelected
                      ? "bg-accent/15 border-l-4 border-l-foreground dark:border-l-accent"
                      : "hover:bg-surface/80"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative h-9 w-9 shrink-0 rounded-full border border-border bg-surface-elevated flex items-center justify-center font-serif text-xs font-semibold text-foreground">
                    {thread.customerName.charAt(0).toUpperCase()}
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={cn(
                          "truncate text-xs font-medium",
                          hasUnread ? "text-foreground font-bold" : "text-foreground/90"
                        )}
                      >
                        {thread.customerName}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {timeString}
                      </span>
                    </div>

                    <p
                      className={cn(
                        "truncate text-[11px] leading-snug",
                        hasUnread ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {thread.lastMessageSender === "seller" && (
                        <span className="text-foreground/80 font-medium">You: </span>
                      )}
                      {thread.lastMessageText}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          "inline-block rounded-full px-1.5 py-0.2 text-[9px] font-mono uppercase font-medium",
                          thread.status === "active"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-neutral-500/15 text-muted-foreground"
                        )}
                      >
                        {thread.status}
                      </span>
                      {hasUnread && (
                        <span className="rounded-full bg-accent px-1.5 py-0.2 text-[9px] font-bold text-accent-foreground font-mono">
                          {thread.unreadByAdminCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. RIGHT COLUMN: ACTIVE CONVERSATION MESSAGES & REPLY BOX */}
      {/* =================================================================== */}
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-serif text-base text-foreground font-medium">
              Select a Customer Conversation
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Choose a thread from the left to view customer inquiries, scent preferences, and reply in real time.
            </p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="h-16 border-b border-border bg-surface-elevated px-4 sm:px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 shrink-0 rounded-full border border-border bg-surface flex items-center justify-center font-serif text-sm font-semibold text-foreground">
                  {activeThread.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground truncate">
                      {activeThread.customerName}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.2 text-[10px] font-mono font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span>Started {new Date(activeThread.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      ID: #{activeThread.id.slice(-6)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {activeThread.status === "active" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("resolved")}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("active")}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface/80 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reopen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-dot-pattern">
              {activeThread.messages.map((msg) => {
                const isSeller = msg.sender === "seller";
                const timeString = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const cleanSenderName = isSeller
                  ? "You (Store Admin)"
                  : (msg.senderName?.replace(/Atelier Concierge/gi, "").trim() || activeThread.customerName);

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[70%]",
                      isSeller ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-mono text-muted-foreground/80">
                        {cleanSenderName}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/60">
                        {timeString}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs",
                        isSeller
                          ? "rounded-tr-xs bg-[#242322] text-[#FAF8F4] dark:bg-[#FAF8F4] dark:text-[#242322] font-normal"
                          : "rounded-tl-xs border border-border/80 bg-surface-elevated text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>

                    {isSeller && (
                      <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] font-mono text-muted-foreground">
                        {msg.status === "delivered" || msg.status === "read" ? (
                          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCheck className="h-3 w-3" /> Sent to Customer
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Sent
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Canned Replies Bar */}
            <div className="border-t border-border/60 bg-surface/50 px-4 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
                  <HelpCircle className="h-3 w-3 text-accent" />
                  Quick:
                </span>
                {CANNED_REPLIES.map((canned, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setReplyText(canned.text);
                      replyInputRef.current?.focus();
                    }}
                    title={canned.text}
                    className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/10 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    {canned.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Input Box */}
            <div className="border-t border-border bg-surface-elevated p-3 sm:p-4">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all shadow-xs">
                <textarea
                  ref={replyInputRef}
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendReply();
                    }
                  }}
                  placeholder={`Reply directly to ${activeThread.customerName}... (Enter to send)`}
                  className="w-full resize-none bg-transparent px-2 py-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-28"
                />

                <button
                  type="button"
                  disabled={!replyText.trim() || isSending}
                  onClick={() => handleSendReply()}
                  className={cn(
                    "shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all cursor-pointer",
                    replyText.trim() && !isSending
                      ? "bg-foreground text-background hover:opacity-90 shadow-xs"
                      : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  )}
                  aria-label="Send reply"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>Customer receives this message in real time</span>
                <span>Press Shift + Enter for new line</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
