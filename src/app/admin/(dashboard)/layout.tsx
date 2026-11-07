import React from "react";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { verifyServerAdmin } from "@/lib/supabase/admin";
import { getAllChatThreadsAction } from "@/actions/chat.actions";
import { AdminChatNotificationProvider } from "@/context/admin-chat-notification-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [verification, chatData] = await Promise.all([
    verifyServerAdmin(),
    getAllChatThreadsAction(),
  ]);

  // When Supabase is configured in .env.local, strictly enforce server-side admin verification
  if (verification.configured && !verification.authorized) {
    redirect("/admin/login");
  }

  const initialUnreadCount = chatData.unreadTotal ?? 0;

  return (
    <AdminChatNotificationProvider initialUnreadCount={initialUnreadCount}>
      <div className="min-h-dvh bg-background text-foreground">
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
          <AdminHeader
            adminEmail={verification.admin?.email || "Not connected (.env.local)"}
            adminName={verification.admin?.full_name || "House Administrator"}
            isDatabaseConnected={verification.configured && verification.authorized}
          />

          {!verification.configured && (
            <div
              role="status"
              className="border-b border-amber-600/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 sm:px-6 lg:px-8"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Supabase Not Configured Yet:</strong> Add{" "}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
                  <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
                  <code className="font-mono">.env.local</code> to enable live authentication and database persistence. No fake statistics are displayed.
                </span>
              </div>
            </div>
          )}

          <main id="admin-main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminChatNotificationProvider>
  );
}

