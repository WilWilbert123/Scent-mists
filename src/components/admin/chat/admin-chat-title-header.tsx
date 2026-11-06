"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, MessageCircle } from "lucide-react";
import { useAdminChatNotification } from "@/context/admin-chat-notification-context";

interface AdminChatTitleHeaderProps {
  initialUnreadCount?: number;
}

export function AdminChatTitleHeader({
  initialUnreadCount = 0,
}: AdminChatTitleHeaderProps) {
  const { unreadCount } = useAdminChatNotification();
  const displayCount = unreadCount ?? initialUnreadCount;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-accent dark:text-[#E8C6CE]" />
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
              Live Customer Chat
            </h1>
          </div>

          {displayCount > 0 ? (
            <span
              title={`${displayCount} unread customer chat${displayCount > 1 ? "s" : ""}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-0.5 text-xs font-bold text-white font-mono shadow-xs animate-pulse dark:bg-rose-500"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span>
                {displayCount} unread {displayCount === 1 ? "chat" : "chats"}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              All Caught Up
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time direct chat with shoppers. Assist with scent consultations, stock checks, and Cash on Delivery inquiries.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 bg-surface transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>View Form Enquiries</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

