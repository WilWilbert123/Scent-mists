import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.WEBHOOK_SECRET;
    const providedSecret = request.headers.get("x-webhook-secret");

    if (!configuredSecret || providedSecret !== configuredSecret) {
      return NextResponse.json(
        { error: "Unauthorized webhook signature." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const table = payload?.table as string | undefined;
    const type = payload?.type as string | undefined;

    logger.info("Received verified Supabase webhook", { table, type });

    if (table === "products" || table === "collections" || table === "site_content") {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/collections");
      revalidatePath("/about");
    }

    if (table === "enquiries") {
      revalidatePath("/admin");
      revalidatePath("/admin/enquiries");
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload." },
      { status: 400 }
    );
  }
}

