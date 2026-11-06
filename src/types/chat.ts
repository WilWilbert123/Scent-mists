export type ChatSender = "customer" | "seller" | "system";

export type ChatMessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: ChatSender;
  senderName: string;
  text: string;
  timestamp: string; // ISO 8601 string
  status: ChatMessageStatus;
  isQuickPrompt?: boolean;
}

export interface ChatThread {
  id: string; // Unique session ID e.g. "thread_1730912345_abc12"
  customerName: string;
  customerContact?: string; // Optional phone or email
  createdAt: string;
  updatedAt: string;
  lastMessageText: string;
  lastMessageSender: ChatSender;
  unreadByAdminCount: number;
  unreadByCustomerCount: number;
  status: "active" | "resolved" | "archived";
  messages: ChatMessage[];
}

export interface SendChatMessageInput {
  threadId: string;
  sender: ChatSender;
  senderName: string;
  text: string;
  customerContact?: string;
  isQuickPrompt?: boolean;
}

