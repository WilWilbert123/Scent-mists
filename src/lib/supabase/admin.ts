import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { createSupabaseServerClient, isSupabaseConfigured } from "./server";
import { isAuthorizedAdmin } from "@/lib/permissions";
import type { AdminProfile } from "@/types/admin";
import { logger } from "@/lib/logger";

let cachedServiceClient: SupabaseClient<Database> | null = null;

const adminProfileCache = new Map<
  string,
  { profile: AdminProfile; expiresAt: number }
>();
const ADMIN_PROFILE_TTL_MS = 5 * 60_000; // 5-minute cache to avoid repeated auth round-trips

/**
 * Server-only Supabase Service Role client for privileged operations
 * (such as recording audit logs or reading aggregate analytics after verifying admin auth).
 * NEVER import this module into Client Components.
 */
export function createSupabaseServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY_VIOLATION: Service role client cannot be used in browser.");
  }

  if (cachedServiceClient) {
    return cachedServiceClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || !url.startsWith("http")) {
    return null;
  }

  cachedServiceClient = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedServiceClient;
}

/**
 * Verifies on the server that the current request is authenticated AND belongs
 * to a verified ADMIN in `admin_profiles`.
 * Wrapped in React `cache()` so layout + multiple server actions in the same render pass
 * only execute a single auth verification.
 */
export const verifyServerAdmin = cache(async (): Promise<{
  authorized: boolean;
  configured: boolean;
  admin: AdminProfile | null;
  error?: string;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      authorized: false,
      configured: false,
      admin: null,
      error: "Supabase environment variables are not configured.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      authorized: false,
      configured: false,
      admin: null,
      error: "Supabase server client unavailable.",
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      configured: true,
      admin: null,
      error: "Authentication required.",
    };
  }

  const now = Date.now();
  const cached = adminProfileCache.get(user.id);
  if (cached && cached.expiresAt > now && isAuthorizedAdmin(user, cached.profile)) {
    return {
      authorized: true,
      configured: true,
      admin: cached.profile,
    };
  }

  const serviceClient = createSupabaseServiceClient();
  const dbClient = serviceClient ?? supabase;

  const { data: profileData, error: profileError } = await dbClient
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = (profileData as AdminProfile | null) ?? null;

  if (profileError || !isAuthorizedAdmin(user, profile)) {
    logger.warn("Unauthorized admin access attempt", {
      userId: user.id,
    });
    return {
      authorized: false,
      configured: true,
      admin: null,
      error: "Account does not have ADMIN privileges.",
    };
  }

  if (profile) {
    adminProfileCache.set(user.id, {
      profile,
      expiresAt: now + ADMIN_PROFILE_TTL_MS,
    });
  }

  return {
    authorized: true,
    configured: true,
    admin: profile,
  };
});

/**
 * Writes an administrative audit log entry to `audit_logs`.
 * Never stores passwords, tokens, or secret credentials.
 */
export async function recordAuditLog({
  adminUserId,
  action,
  resourceType,
  resourceId = null,
  metadata = {},
}: {
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
    if (!supabase) return;

    await (supabase.from("audit_logs") as unknown as {
      insert: (values: Record<string, unknown>) => Promise<unknown>;
    }).insert({
      admin_user_id: adminUserId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  } catch (err) {
    logger.error("Failed to record audit log", {
      action,
      resourceType,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

