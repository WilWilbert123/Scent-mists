"use server";

import { revalidatePath } from "next/cache";
import { subDays } from "date-fns";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient, recordAuditLog, verifyServerAdmin } from "@/lib/supabase/admin";
import { newsletterSubscriptionSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import type { NewsletterStats, NewsletterSubscriber } from "@/types/newsletter";

export async function subscribeNewsletterAction(rawInput: {
  email: string;
  honeypot?: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (rawInput.honeypot && rawInput.honeypot.length > 0) {
    return {
      success: true,
      message: "Thank you for subscribing to the SCENTS & MISTS Journal.",
    };
  }

  const parsed = newsletterSubscriptionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Please enter a valid email address.",
    };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const rate = checkRateLimit(`newsletter:${normalizedEmail}`, 4, 60_000);
  if (!rate.allowed) {
    return {
      success: false,
      error: "Too many subscription requests. Please wait a moment.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase database is not configured. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to store subscribers.",
    };
  }

  const serviceClient = createSupabaseServiceClient();
  if (serviceClient) {
    const { error } = await (
      serviceClient.from("newsletter_subscribers") as unknown as {
        upsert: (
          values: Record<string, unknown>,
          opts: { onConflict: string }
        ) => Promise<{ error: { message: string } | null }>;
      }
    ).upsert(
      {
        email: normalizedEmail,
        is_subscribed: true,
      },
      { onConflict: "email" }
    );

    if (error) {
      return {
        success: false,
        error: "Unable to process subscription right now. Please try again later.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/newsletter");

    return {
      success: true,
      message: "You are subscribed to the SCENTS & MISTS Private Letters.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: "Database client unavailable." };
  }

  const { error } = await (
    supabase.from("newsletter_subscribers") as unknown as {
      insert: (
        values: Record<string, unknown>
      ) => Promise<{ error: { message: string; code?: string } | null }>;
    }
  ).insert({
    email: normalizedEmail,
    is_subscribed: true,
  });

  if (error && error.code !== "23505") {
    return {
      success: false,
      error: "Unable to process subscription right now. Please try again later.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");

  return {
    success: true,
    message: "You are subscribed to the SCENTS & MISTS Private Letters.",
  };
}

export async function getNewsletterSubscribersAction(): Promise<{
  subscribers: NewsletterSubscriber[];
  stats: NewsletterStats;
  isDatabaseConnected: boolean;
}> {
  const emptyStats: NewsletterStats = {
    totalSubscribers: 0,
    activeSubscribers: 0,
    unsubscribedCount: 0,
    subscribedThisMonth: 0,
  };

  if (!isSupabaseConfigured()) {
    return { subscribers: [], stats: emptyStats, isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return { subscribers: [], stats: emptyStats, isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { subscribers: [], stats: emptyStats, isDatabaseConnected: false };
  }

  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  const list = ((data ?? []) as NewsletterSubscriber[]);
  const monthAgo = subDays(new Date(), 30).toISOString();

  const activeSubscribers = list.filter((s) => s.is_subscribed).length;
  const unsubscribedCount = list.length - activeSubscribers;
  const subscribedThisMonth = list.filter(
    (s) => s.is_subscribed && s.created_at >= monthAgo
  ).length;

  return {
    subscribers: list,
    stats: {
      totalSubscribers: list.length,
      activeSubscribers,
      unsubscribedCount,
      subscribedThisMonth,
    },
    isDatabaseConnected: true,
  };
}

export async function toggleSubscriberStatusAction(
  id: string,
  isSubscribed: boolean
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await (supabase.from("newsletter_subscribers") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update({ is_subscribed: isSubscribed })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message || "Failed to update subscriber status." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "NEWSLETTER_SUBSCRIBER_UPDATED",
    resourceType: "newsletter_subscribers",
    resourceId: id,
    metadata: { is_subscribed: isSubscribed },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function addAdminNewsletterSubscriberAction(
  rawEmail: string
): Promise<{
  success: boolean;
  subscriber?: NewsletterSubscriber;
  error?: string;
}> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = newsletterSubscriptionSchema.safeParse({ email: rawEmail });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Please enter a valid email address.",
    };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { data, error } = await (
    supabase.from("newsletter_subscribers") as unknown as {
      upsert: (
        values: Record<string, unknown>,
        opts: { onConflict: string }
      ) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: NewsletterSubscriber | null;
            error: { message: string } | null;
          }>;
        };
      };
    }
  )
    .upsert(
      {
        email: normalizedEmail,
        is_subscribed: true,
      },
      { onConflict: "email" }
    )
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Failed to add subscriber in Supabase.",
    };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "NEWSLETTER_SUBSCRIBER_ADDED",
    resourceType: "newsletter_subscribers",
    resourceId: data.id,
    metadata: { email: normalizedEmail },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  return { success: true, subscriber: data };
}

export async function deleteNewsletterSubscriberAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to delete subscriber.",
    };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "NEWSLETTER_SUBSCRIBER_DELETED",
    resourceType: "newsletter_subscribers",
    resourceId: id,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  return { success: true };
}

