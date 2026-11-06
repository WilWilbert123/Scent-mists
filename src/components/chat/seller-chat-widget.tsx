"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  RotateCcw,
  Check,
  CheckCheck,
  HelpCircle,
  User,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getChatThreadAction,
  sendChatMessageAction,
  clearChatThreadAction,
  markChatThreadReadAction,
} from "@/actions/chat.actions";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { label: "🌸 Bestsellers", text: "Which mists and perfumes are your top bestsellers?" },
  { label: "💵 COD Info", text: "Do you offer Cash on Delivery (COD)?" },
  { label: "📍 Pin Delivery", text: "How does the GPS pin delivery work?" },
  { label: "⏳ Shipping Time", text: "How fast is delivery?" },
];

const BOT_AUTO_REPLIES: Record<string, string> = {
  cod: "Yes! We proudly offer Cash on Delivery (COD) as well as GCash. You only pay when your parcel is delivered safely to your doorstep.",
  pin: "Our checkout features an interactive GPS map! Simply tap 'Use My Current Location' or drag the pin directly over your house/building for precise courier delivery.",
  bestseller: "Our current #1 bestsellers are Clinique - Happy (50ml) and Bvlgari Man Black for men, and VS - Sweet Temptation (50ml) and Secret Angel Gold (85ml) for women! Both are in stock.",
  authentic: "Every bottle is composed with premium Eau de Parfum botanical fragrance oils with 6-8 hours of lasting sillage and authentic top, heart, and base notes.",
  shipping: "Orders are prepared within 24 hours. Metro Manila & nearby delivery takes 1-3 business days, provincial areas take 3-5 days.",
};

function playGentleChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    // AudioContext might be muted by browser policy before user interaction
  }
}

interface SellerChatWidgetProps {
  initialFragranceNote?: string;
}

export function SellerChatWidget({ initialFragranceNote }: SellerChatWidgetProps) {
  const [threadId, setThreadId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("Guest Client");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(
    initialFragranceNote
      ? `Hello! I would like to ask about ${initialFragranceNote}. Is it in stock?`
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof createSupabaseBrowserClient>>["channel"]> | null>(null);

  // 1. Initialize or load persistent chat session
  useEffect(() => {
    let storedSession = "";
    let storedName = "";

    try {
      storedSession = localStorage.getItem("scents_chat_session_id") || "";
      storedName = localStorage.getItem("scents_customer_name") || "";
    } catch {
      // localStorage disabled or SSR
    }

    if (!storedSession) {
      storedSession = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      try {
        localStorage.setItem("scents_chat_session_id", storedSession);
      } catch {
        // ignore
      }
    }

    const effectiveName = storedName || "Guest Client";
    setThreadId(storedSession);
    setCustomerName(effectiveName);
    setTempName(effectiveName);

    // Fetch existing thread from server
    void (async () => {
      const res = await getChatThreadAction(storedSession, effectiveName);
      if (res.success && res.thread) {
        setMessages(res.thread.messages);
        void markChatThreadReadAction(storedSession, "customer");
      }
    })();
  }, []);

  // 2. Real-time Supabase Broadcast Channel listener
  useEffect(() => {
    if (!threadId) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase.channel(`live-chat:${threadId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        if (msg && msg.threadId === threadId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.sender === "seller") {
            playGentleChime();
            void markChatThreadReadAction(threadId, "customer");
          }
        }
      })
      .on("broadcast", { event: "seller_typing" }, () => {
        setIsSellerTyping(true);
        setTimeout(() => setIsSellerTyping(false), 3000);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsOnline(true);
        }
      });

    channelRef.current = channel;

    // Background poll backup every 5 seconds for robust sync
    const pollInterval = setInterval(async () => {
      const res = await getChatThreadAction(threadId, customerName);
      if (res.success && res.thread) {
        setMessages((prev) => {
          if (res.thread.messages.length > prev.length) {
            playGentleChime();
            return res.thread.messages;
          }
          return prev;
        });
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
      }
    };
  }, [threadId, customerName]);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  // Handle customer name update
  const handleSaveName = () => {
    const trimmed = tempName.trim() || "Guest Client";
    setCustomerName(trimmed);
    setIsEditingName(false);
    try {
      localStorage.setItem("scents_customer_name", trimmed);
    } catch {
      // ignore
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? inputText).trim();
    if (!content || !threadId || isSubmitting) return;

    setInputText("");
    setIsSubmitting(true);

    const optimisticId = `temp_${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      threadId,
      sender: "customer",
      senderName: customerName,
      text: content,
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await sendChatMessageAction({
        threadId,
        sender: "customer",
        senderName: customerName,
        text: content,
      });

      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...res.message!, status: "delivered" } : m))
        );

        // Broadcast to seller admin in real time via Supabase
        if (channelRef.current) {
          void channelRef.current.send({
            type: "broadcast",
            event: "new_message",
            payload: res.message,
          });
        }

        // Multi-tab sync & instant notification for admin dashboard
        try {
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const bc = new BroadcastChannel("scent_mists_chat_sync");
            bc.postMessage({
              type: "new_customer_message",
              threadId,
              message: res.message,
            });
            bc.close();
          }
          window.dispatchEvent(
            new CustomEvent("scent_mists_chat_updated", { detail: res.message })
          );
        } catch {
          // ignore broadcast errors
        }

        // Smart auto-reply if keyword matched and it's customer's first question
        const lower = content.toLowerCase();
        let autoKey = "";
        if (lower.includes("cod") || lower.includes("cash on delivery")) autoKey = "cod";
        else if (lower.includes("pin") || lower.includes("map") || lower.includes("location")) autoKey = "pin";
        else if (lower.includes("best") || lower.includes("popular") || lower.includes("top")) autoKey = "bestseller";
        else if (lower.includes("authentic") || lower.includes("fake") || lower.includes("original")) autoKey = "authentic";
        else if (lower.includes("ship") || lower.includes("deliver") || lower.includes("how long")) autoKey = "shipping";

        if (autoKey && BOT_AUTO_REPLIES[autoKey]) {
          setIsSellerTyping(true);
          setTimeout(async () => {
            setIsSellerTyping(false);
            const botText = BOT_AUTO_REPLIES[autoKey];
            const botRes = await sendChatMessageAction({
              threadId,
              sender: "seller",
              senderName: "SCENTS & MISTS Concierge",
              text: botText,
            });
            if (botRes.success && botRes.message) {
              setMessages((prev) => [...prev, botRes.message!]);
              playGentleChime();
              if (channelRef.current) {
                void channelRef.current.send({
                  type: "broadcast",
                  event: "new_message",
                  payload: botRes.message,
                });
              }
            }
          }, 1200);
        }
      } else {
        // mark failed
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...m, status: "sent" } : m))
        );
      }
    } catch {
      // network fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  // Clear chat
  const handleClearChat = async () => {
    if (!threadId) return;
    if (window.confirm("Start a new conversation with the SCENTS & MISTS seller?")) {
      const res = await clearChatThreadAction(threadId, customerName);
      if (res.success && res.thread) {
        setMessages(res.thread.messages);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-265px)] sm:h-[calc(100dvh-220px)] lg:h-[calc(100dvh-215px)] min-h-[280px] max-h-[640px] w-full rounded-2xl border border-border/80 bg-surface-elevated/90 shadow-xl overflow-hidden backdrop-blur-md">
      {/* =================================================================== */}
      {/* 1. SELLER CONCIERGE HEADER (Clean & Minimalist) */}
      {/* =================================================================== */}
      <div className="border-b border-border/70 bg-[#FAF7F2] dark:bg-[#1A1816] px-3 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 rounded-full border border-amber-600/30 bg-[#FAF7F2] dark:bg-[#201D1B] p-1 shadow-xs flex items-center justify-center">
            <span className="font-serif text-xs sm:text-sm font-semibold tracking-wider text-foreground">
              SM
            </span>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
              )}
              title={isOnline ? "Seller is online" : "Connecting..."}
            />
          </div>

          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-base font-semibold text-foreground tracking-wide leading-none">
              SCENTS &amp; MISTS
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Online</span>
            </p>
          </div>
        </div>

        {/* Right Header Actions: Client Name & Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="Your name"
                className="h-7 w-24 sm:w-32 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="h-7 rounded-md bg-foreground px-2 text-[10px] font-medium text-background hover:opacity-90 cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempName(customerName);
                setIsEditingName(true);
              }}
              title="Click to change your display name"
              className="group flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-border/60 rounded-full px-2.5 py-1 bg-surface/60 transition-colors cursor-pointer"
            >
              <User className="h-3 w-3 text-accent" />
              <span className="max-w-[70px] sm:max-w-[110px] truncate font-medium">
                {customerName === "Guest Client" ? "Guest" : customerName}
              </span>
              <span className="text-[9px] text-muted-foreground/60 group-hover:text-accent">
                ✏️
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearChat}
            title="Start fresh conversation"
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
            aria-label="Restart chat"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. LIVE MESSAGE FEED */}
      {/* =================================================================== */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-2.5 sm:space-y-3.5 bg-dot-pattern">
        {/* Message items */}
        {messages.map((msg) => {
          const isMe = msg.sender === "customer";
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const cleanSenderName = isMe
            ? "You"
            : (msg.senderName?.replace(/Atelier Concierge/gi, "").trim() || "SCENTS & MISTS");

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] sm:max-w-[75%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-mono text-muted-foreground/80">
                  {cleanSenderName}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/60">
                  {time}
                </span>
              </div>

              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-xs transition-all",
                  isMe
                    ? "rounded-tr-xs bg-foreground text-background font-normal"
                    : "rounded-tl-xs border border-border/80 bg-[#FAF7F2] dark:bg-[#201D1B] text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>

              {/* Status footer for customer's messages */}
              {isMe && (
                <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] font-mono text-muted-foreground/70">
                  {msg.status === "sending" ? (
                    <span>Sending...</span>
                  ) : msg.status === "delivered" ? (
                    <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCheck className="h-3 w-3" /> Delivered
                    </span>
                  ) : msg.status === "read" ? (
                    <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCheck className="h-3 w-3" /> Read
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

        {/* Real-time typing indicator */}
        {isSellerTyping && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto bg-surface/80 border border-border/60 rounded-full px-3 py-1.5 animate-pulse">
            <span className="font-serif italic">SCENTS &amp; MISTS is typing</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* =================================================================== */}
      {/* 3. QUICK CONCIERGE PROMPTS (Clickable chips) */}
      {/* =================================================================== */}
      <div className="border-t border-border/50 bg-[#FAF7F2]/60 dark:bg-[#181615]/60 px-2.5 py-1 sm:px-4 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0 flex items-center gap-1 mr-0.5">
            <HelpCircle className="h-3 w-3 text-accent" />
            Quick:
          </span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => handleSendMessage(prompt.text)}
              className="shrink-0 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-foreground hover:border-accent hover:bg-accent/10 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. CHAT INPUT BAR (Fixed height, perfectly visible on mobile without scroll) */}
      {/* =================================================================== */}
      <div className="border-t border-border/70 bg-[#FAF7F2] dark:bg-[#1A1816] p-1.5 sm:p-2.5 shrink-0">
        <div className="relative flex items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-1 sm:p-1.5 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all shadow-xs min-h-[42px]">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Press Enter to send)"
            className="w-full resize-none bg-transparent px-1 py-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-20 min-h-[34px] leading-relaxed"
          />

          <button
            type="button"
            disabled={!inputText.trim() || isSubmitting}
            onClick={() => handleSendMessage()}
            aria-label="Send message to seller"
            className={cn(
              "shrink-0 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg transition-all cursor-pointer",
              inputText.trim() && !isSubmitting
                ? "bg-foreground text-background hover:opacity-90 shadow-xs"
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
