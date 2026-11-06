import React from "react";
import type { Metadata } from "next";
import { MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllChatThreadsAction } from "@/actions/chat.actions";
import { AdminChatHub } from "@/components/admin/chat/admin-chat-hub";

export const metadata: Metadata = {
  title: "Live Customer Chat | Admin",
  description: "Real-time customer live chat conversations and seller support.",
};

export default async function AdminChatPage() {
  const { threads, unreadTotal } = await getAllChatThreadsAction();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
              Live Customer Chat
            </h1>
            {unreadTotal > 0 && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground font-mono">
                {unreadTotal} unread
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

      <AdminChatHub
        initialThreads={threads}
        initialUnreadCount={unreadTotal}
      />
    </div>
  );
}

