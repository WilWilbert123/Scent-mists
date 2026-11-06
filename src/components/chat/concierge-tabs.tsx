"use client";

import React, { useState } from "react";
import { MessageSquare, Mail } from "lucide-react";
import { SellerChatWidget } from "./seller-chat-widget";
import { ContactForm } from "@/components/forms/contact-form";
import { cn } from "@/lib/utils";

interface ConciergeTabsProps {
  defaultSubject?: string;
  initialTab?: "chat" | "enquiry";
}

export function ConciergeTabs({
  defaultSubject,
  initialTab = "chat",
}: ConciergeTabsProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "enquiry">(initialTab);

  return (
    <div className="space-y-1.5 sm:space-y-3">
      {/* =================================================================== */}
      {/* SEGMENTED TAB SWITCHER */}
      {/* =================================================================== */}
      <div className="inline-flex w-full sm:w-auto p-0.5 sm:p-1 rounded-xl border border-border/80 bg-surface shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer",
            activeTab === "chat"
              ? "bg-foreground text-background shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Live Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("enquiry")}
          className={cn(
            "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer",
            activeTab === "enquiry"
              ? "bg-foreground text-background shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Send Enquiry</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB CONTENT PANELS */}
      {/* =================================================================== */}
      {activeTab === "chat" ? (
        <div className="animate-in fade-in duration-200">
          <SellerChatWidget initialFragranceNote={defaultSubject} />
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <ContactForm defaultSubject={defaultSubject} />
        </div>
      )}
    </div>
  );
}
