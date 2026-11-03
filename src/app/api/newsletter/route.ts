import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { newsletterSubscriptionSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ connected: false, activeCount: 0 });
  }

  try {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ connected: true, activeCount: null });
    }

    const { count, error } = await serviceClient
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_subscribed", true);

    if (error) {
      return NextResponse.json({ connected: true, activeCount: null });
    }

    return NextResponse.json({
      connected: true,
      activeCount: count ?? 0,
    });
  } catch {
    return NextResponse.json({ connected: false, activeCount: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.honeypot && String(body.honeypot).length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Welcome to the SCENTS & MISTS Journal.",
        },
        { status: 200 }
      );
    }

    const parsed = newsletterSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.errors[0]?.message ||
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();

    const rate = checkRateLimit(`api_newsletter:${normalizedEmail}`, 4, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many subscription requests. Please wait a minute.",
        },
        { status: 429 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase database is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to store newsletter subscribers.",
        },
        { status: 503 }
      );
    }

    const serviceClient = createSupabaseServiceClient();
    if (serviceClient) {
      const { error } = await (
        serviceClient.from("newsletter_subscribers") as unknown as {
          upsert: (
            values: Record<string, unknown>,
            opts: { onConflict: string }
          ) => Promise<{ error: { message: string; code?: string } | null }>;
        }
      ).upsert(
        {
          email: normalizedEmail,
          is_subscribed: true,
        },
        { onConflict: "email" }
      );

      if (error) {
        logger.error("Failed to upsert newsletter subscriber via service client", {
          error: error.message,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Could not save your subscription at this time.",
          },
          { status: 500 }
        );
      }

      revalidatePath("/admin");
      revalidatePath("/admin/newsletter");

      return NextResponse.json(
        {
          success: true,
          email: normalizedEmail,
          subscribedAt: new Date().toISOString(),
          message: "You are subscribed to the SCENTS & MISTS Private Letters.",
        },
        { status: 201 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection unavailable.",
        },
        { status: 503 }
      );
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

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: true,
            alreadySubscribed: true,
            email: normalizedEmail,
            subscribedAt: new Date().toISOString(),
            message:
              "Your email is already registered with the SCENTS & MISTS Private Letters.",
          },
          { status: 200 }
        );
      }

      logger.error("Failed to insert newsletter subscriber", { error: error.message });
      return NextResponse.json(
        {
          success: false,
          error: "Could not save your subscription at this time.",
        },
        { status: 500 }
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/newsletter");

    return NextResponse.json(
      {
        success: true,
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        message: "You are subscribed to the SCENTS & MISTS Private Letters.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Malformed request payload.",
      },
      { status: 400 }
    );
  }
}


