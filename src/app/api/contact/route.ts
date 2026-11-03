import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { enquirySubmissionSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export async function GET() {
  return NextResponse.json({
    connected: isSupabaseConfigured(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.honeypot && String(body.honeypot).length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Thank you. Your enquiry has been received.",
        },
        { status: 200 }
      );
    }

    const parsed = enquirySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.errors[0]?.message ||
            "Please check the fields in your enquiry form.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const rateKey = `api_contact:${normalizedEmail}`;
    const rate = checkRateLimit(rateKey, 5, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many enquiries sent recently. Please wait a minute and try again.",
        },
        { status: 429 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase database is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to store customer enquiries.",
        },
        { status: 503 }
      );
    }

    const payload = {
      full_name: parsed.data.full_name.trim(),
      email: normalizedEmail,
      phone: parsed.data.phone ? parsed.data.phone.trim() : null,
      subject: parsed.data.subject.trim(),
      message: parsed.data.message.trim(),
      status: "NEW",
    };

    const serviceClient = createSupabaseServiceClient();
    if (serviceClient) {
      const { data, error } = await (
        serviceClient.from("enquiries") as unknown as {
          insert: (values: Record<string, unknown>) => {
            select: (cols: string) => {
              single: () => Promise<{
                data: { id: string; created_at: string } | null;
                error: { message: string } | null;
              }>;
            };
          };
        }
      )
        .insert(payload)
        .select("id, created_at")
        .single();

      if (error) {
        logger.error("Failed to insert customer enquiry via service client", {
          error: error.message,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Could not save your enquiry to the database. Please try again later.",
          },
          { status: 500 }
        );
      }

      revalidatePath("/admin");
      revalidatePath("/admin/enquiries");

      return NextResponse.json(
        {
          success: true,
          referenceId: data?.id
            ? `SM-${data.id.slice(0, 6).toUpperCase()}`
            : `SM-${Date.now().toString(36).toUpperCase()}`,
          submittedAt: data?.created_at || new Date().toISOString(),
          message:
            "Thank you. Your enquiry has been recorded by the SCENTS & MISTS concierge.",
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
      supabase.from("enquiries") as unknown as {
        insert: (
          values: Record<string, unknown>
        ) => Promise<{ error: { message: string } | null }>;
      }
    ).insert(payload);

    if (error) {
      logger.error("Failed to insert customer enquiry", { error: error.message });
      return NextResponse.json(
        {
          success: false,
          error: "Could not save your enquiry to the database. Please try again later.",
        },
        { status: 500 }
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");

    return NextResponse.json(
      {
        success: true,
        referenceId: `SM-${Date.now().toString(36).slice(-6).toUpperCase()}`,
        submittedAt: new Date().toISOString(),
        message:
          "Thank you. Your enquiry has been recorded by the SCENTS & MISTS concierge.",
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


