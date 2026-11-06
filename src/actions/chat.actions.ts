"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import type { ChatMessage, ChatThread, SendChatMessageInput } from "@/types/chat";

const DATA_DIR = path.resolve(process.cwd(), "data");
const CHAT_FILE = path.join(DATA_DIR, "chat-threads.json");
const SUPABASE_CONTENT_KEY = "live_chat_threads";

const INITIAL_CONCIERGE_WELCOME = (_customerName: string): ChatMessage => ({
  id: "msg_welcome_intro",
  threadId: "",
  sender: "seller",
  senderName: "SCENTS & MISTS",
  text: "Hi! Welcome to SCENTS & MISTS. How can we help you today?",
  timestamp: new Date().toISOString(),
  status: "delivered",
});

function readLocalChatThreads(): ChatThread[] {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      const data = fs.readFileSync(CHAT_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("[ChatActions] Error reading local chat file:", error);
  }
  return [];
}

function writeLocalChatThreads(threads: ChatThread[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CHAT_FILE, JSON.stringify(threads, null, 2), "utf-8");
  } catch (error) {
    console.error("[ChatActions] Error writing local chat file:", error);
  }
}

async function getPersistedChatThreads(): Promise<ChatThread[]> {
  const localThreads = readLocalChatThreads();

  if (!isSupabaseConfigured()) {
    return localThreads;
  }

  try {
    const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
    if (supabase) {
      const { data, error } = await (supabase.from("site_content") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: { content_value?: { threads?: ChatThread[] } } | null; error: unknown }>;
          };
        };
      })
        .select("content_value")
        .eq("content_key", SUPABASE_CONTENT_KEY)
        .maybeSingle();

      if (!error && data?.content_value?.threads && Array.isArray(data.content_value.threads)) {
        const remoteThreads = data.content_value.threads;
        if (remoteThreads.length > 0) {
          writeLocalChatThreads(remoteThreads);
          return remoteThreads;
        }
      }
    }
  } catch (err) {
    console.warn("[ChatActions] Supabase query fallback to local:", err);
  }

  return localThreads;
}

async function savePersistedChatThreads(threads: ChatThread[]): Promise<void> {
  writeLocalChatThreads(threads);

  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
    if (supabase) {
      await (supabase.from("site_content") as unknown as {
        upsert: (values: Record<string, unknown>, opts?: { onConflict?: string }) => Promise<{ error: unknown }>;
      }).upsert(
        {
          content_key: SUPABASE_CONTENT_KEY,
          content_value: { threads },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "content_key" }
      );
    }
  } catch (err) {
    console.warn("[ChatActions] Failed to sync chat threads to Supabase:", err);
  }
}

/**
 * Retrieves or initializes a specific customer chat thread
 */
export async function getChatThreadAction(
  threadId: string,
  customerName?: string
): Promise<{ success: boolean; thread: ChatThread }> {
  const threads = await getPersistedChatThreads();
  const existing = threads.find((t) => t.id === threadId);

  if (existing) {
    // If opened by customer, mark any seller messages as delivered
    return { success: true, thread: existing };
  }

  // Create brand new thread
  const now = new Date().toISOString();
  const welcomeMsg = INITIAL_CONCIERGE_WELCOME(customerName || "valued client");
  welcomeMsg.threadId = threadId;

  const newThread: ChatThread = {
    id: threadId,
    customerName: customerName?.trim() || "Guest Client",
    createdAt: now,
    updatedAt: now,
    lastMessageText: welcomeMsg.text,
    lastMessageSender: "seller",
    unreadByAdminCount: 0,
    unreadByCustomerCount: 1,
    status: "active",
    messages: [welcomeMsg],
  };

  threads.unshift(newThread);
  await savePersistedChatThreads(threads);

  return { success: true, thread: newThread };
}

/**
 * Sends a message from customer or seller in real-time
 */
export async function sendChatMessageAction(
  input: SendChatMessageInput
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  const { threadId, sender, senderName, text, customerContact, isQuickPrompt } = input;

  const trimmedText = text?.trim();
  if (!trimmedText) {
    return { success: false, error: "Message cannot be empty." };
  }

  const threads = await getPersistedChatThreads();
  let threadIndex = threads.findIndex((t) => t.id === threadId);
  const now = new Date().toISOString();

  let thread: ChatThread;
  if (threadIndex === -1) {
    const welcome = INITIAL_CONCIERGE_WELCOME(senderName);
    welcome.threadId = threadId;
    thread = {
      id: threadId,
      customerName: senderName || "Guest Client",
      customerContact: customerContact?.trim(),
      createdAt: now,
      updatedAt: now,
      lastMessageText: trimmedText,
      lastMessageSender: sender,
      unreadByAdminCount: sender === "customer" ? 1 : 0,
      unreadByCustomerCount: sender === "seller" ? 1 : 0,
      status: "active",
      messages: [welcome],
    };
    threads.unshift(thread);
    threadIndex = 0;
  } else {
    thread = threads[threadIndex];
    if (customerContact && !thread.customerContact) {
      thread.customerContact = customerContact.trim();
    }
    if (sender === "customer" && senderName && senderName !== "Guest Client") {
      thread.customerName = senderName.trim();
    }
  }

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    threadId,
    sender,
    senderName: senderName || (sender === "seller" ? "SCENTS & MISTS" : "Customer"),
    text: trimmedText,
    timestamp: now,
    status: "sent",
    isQuickPrompt,
  };

  thread.messages.push(newMsg);
  thread.lastMessageText = trimmedText;
  thread.lastMessageSender = sender;
  thread.updatedAt = now;

  if (sender === "customer") {
    thread.unreadByAdminCount = (thread.unreadByAdminCount || 0) + 1;
  } else if (sender === "seller") {
    thread.unreadByCustomerCount = (thread.unreadByCustomerCount || 0) + 1;
  }

  // Move updated thread to top of list
  threads.splice(threadIndex, 1);
  threads.unshift(thread);

  await savePersistedChatThreads(threads);

  revalidatePath("/admin/chat");
  revalidatePath("/admin/enquiries");

  return { success: true, message: newMsg };
}

/**
 * Retrieves all chat threads for the Admin Dashboard
 */
export async function getAllChatThreadsAction(): Promise<{
  success: boolean;
  threads: ChatThread[];
  unreadTotal: number;
}> {
  const threads = await getPersistedChatThreads();
  const sorted = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const unreadTotal = sorted.reduce((acc, t) => acc + (t.unreadByAdminCount || 0), 0);

  return { success: true, threads: sorted, unreadTotal };
}

/**
 * Marks messages in a thread as read by admin or customer
 */
export async function markChatThreadReadAction(
  threadId: string,
  reader: "admin" | "customer"
): Promise<{ success: boolean }> {
  const threads = await getPersistedChatThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return { success: false };

  if (reader === "admin") {
    thread.unreadByAdminCount = 0;
    for (const msg of thread.messages) {
      if (msg.sender === "customer") {
        msg.status = "read";
      }
    }
  } else {
    thread.unreadByCustomerCount = 0;
    for (const msg of thread.messages) {
      if (msg.sender === "seller") {
        msg.status = "read";
      }
    }
  }

  await savePersistedChatThreads(threads);
  return { success: true };
}

/**
 * Admin action to resolve, reopen, or archive a thread
 */
export async function updateChatThreadStatusAction(
  threadId: string,
  status: "active" | "resolved" | "archived"
): Promise<{ success: boolean }> {
  const threads = await getPersistedChatThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return { success: false };

  thread.status = status;
  thread.updatedAt = new Date().toISOString();
  await savePersistedChatThreads(threads);

  revalidatePath("/admin/chat");
  return { success: true };
}

/**
 * Resets or clears a chat conversation
 */
export async function clearChatThreadAction(
  threadId: string,
  customerName?: string
): Promise<{ success: boolean; thread: ChatThread }> {
  const threads = await getPersistedChatThreads();
  const index = threads.findIndex((t) => t.id === threadId);
  const now = new Date().toISOString();

  const welcomeMsg = INITIAL_CONCIERGE_WELCOME(customerName || "valued client");
  welcomeMsg.threadId = threadId;

  const freshThread: ChatThread = {
    id: threadId,
    customerName: customerName?.trim() || "Guest Client",
    createdAt: now,
    updatedAt: now,
    lastMessageText: welcomeMsg.text,
    lastMessageSender: "seller",
    unreadByAdminCount: 0,
    unreadByCustomerCount: 0,
    status: "active",
    messages: [welcomeMsg],
  };

  if (index >= 0) {
    threads[index] = freshThread;
  } else {
    threads.unshift(freshThread);
  }

  await savePersistedChatThreads(threads);
  return { success: true, thread: freshThread };
}

