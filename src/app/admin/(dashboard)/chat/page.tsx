import React from "react";
import type { Metadata } from "next";
import { getAllChatThreadsAction } from "@/actions/chat.actions";
import { AdminChatHub } from "@/components/admin/chat/admin-chat-hub";
import { AdminChatTitleHeader } from "@/components/admin/chat/admin-chat-title-header";

export const metadata: Metadata = {
  title: "Live Customer Chat | Admin",
  description: "Real-time customer live chat conversations and seller support.",
};

export default async function AdminChatPage() {
  const { threads, unreadTotal } = await getAllChatThreadsAction();

  return (
    <div className="space-y-6">
      <AdminChatTitleHeader initialUnreadCount={unreadTotal} />

      <AdminChatHub
        initialThreads={threads}
        initialUnreadCount={unreadTotal}
      />
    </div>
  );
}

