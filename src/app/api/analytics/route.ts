import { NextResponse, type NextRequest } from "next/server";
import { visitorAnalyticsSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { verifyServerAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = visitorAnalyticsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid analytics event payload.",
        },
        { status: 400 }
      );
    }

    // Never record admin routes in public visitor analytics
    if (parsed.data.page_path.startsWith("/admin")) {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 });
    }

    const rate = checkRateLimit(
      `analytics:${parsed.data.anonymous_visitor_id}`,
      30,
      60_000
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded." },
        { status: 429 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message: "Supabase not configured; visitor event not persisted.",
        },
        { status: 202 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, configured: false },
        { status: 202 }
      );
    }

    const { error } = await (supabase.from("visitor_analytics") as unknown as {
      insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    }).insert({
      anonymous_visitor_id: parsed.data.anonymous_visitor_id,
      session_id: parsed.data.session_id,
      page_path: parsed.data.page_path,
      referrer_category: parsed.data.referrer_category,
      device_category: parsed.data.device_category,
      browser_category: parsed.data.browser_category,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to persist analytics event." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

/**
 * Protected GET endpoint — strictly requires verified server-side ADMIN authorization.
 * Public visitors cannot read visitor analytics.
 */
export async function GET() {
  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required." },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ records: [], configured: false }, { status: 200 });
  }

  const { data } = await supabase
    .from("visitor_analytics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ records: data ?? [], configured: true }, { status: 200 });
}

