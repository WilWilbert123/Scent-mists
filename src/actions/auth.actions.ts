"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  recordAuditLog,
  verifyServerAdmin,
} from "@/lib/supabase/admin";
import { adminLoginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function signInAdminAction(rawInput: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
}> {
  const parsed = adminLoginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid email or password format.",
    };
  }

  const rate = checkRateLimit(`admin_login:${parsed.data.email.toLowerCase()}`, 5, 60_000);
  if (!rate.allowed) {
    return {
      success: false,
      error: "Too many login attempts. Please wait 60 seconds before trying again.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase server client could not be initialized.",
    };
  }

  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

  if (signInError || !authData.user) {
    logger.warn("Failed admin login attempt", { email: parsed.data.email });
    return {
      success: false,
      error: "Invalid administrator credentials.",
    };
  }

  const serviceClient = createSupabaseServiceClient();
  const dbClient = serviceClient ?? supabase;

  const { data: profileData } = await dbClient
    .from("admin_profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  let profile = profileData as { id: string; role: string } | null;

  // If the user was created in Supabase Dashboard Auth and has no admin_profiles row yet, provision it
  if (!profile && serviceClient) {
    const email = authData.user.email || parsed.data.email;
    const fullName =
      (authData.user.user_metadata?.full_name as string | undefined) ||
      (authData.user.user_metadata?.name as string | undefined) ||
      email.split("@")[0] ||
      "House Administrator";

    const { data: provisioned } = await (
      serviceClient.from("admin_profiles") as unknown as {
        upsert: (
          values: Record<string, unknown>,
          opts?: { onConflict?: string }
        ) => {
          select: () => {
            single: () => Promise<{ data: { id: string; role: string } | null }>;
          };
        };
      }
    )
      .upsert(
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role: "ADMIN",
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (provisioned) {
      profile = provisioned;
    }
  }

  if (!profile || profile.role !== "ADMIN") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Unauthorized: This account does not have ADMIN role access.",
    };
  }

  await recordAuditLog({
    adminUserId: authData.user.id,
    action: "ADMIN_LOGIN",
    resourceType: "auth",
    resourceId: authData.user.id,
    metadata: { email: parsed.data.email },
  });

  revalidatePath("/admin");
  return {
    success: true,
    redirectTo: "/admin",
  };
}

export async function signOutAdminAction(): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const verification = await verifyServerAdmin();
  const supabase = await createSupabaseServerClient();

  if (verification.admin) {
    await recordAuditLog({
      adminUserId: verification.admin.id,
      action: "ADMIN_LOGOUT",
      resourceType: "auth",
      resourceId: verification.admin.id,
    });
  }

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/admin");
  return { success: true };
}

