"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  recordAuditLog,
  verifyServerAdmin,
} from "@/lib/supabase/admin";
import { enquirySubmissionSchema, enquiryUpdateSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Enquiry, EnquiryStatus, EnquirySubmissionValues } from "@/types/enquiry";

export async function submitCustomerEnquiryAction(
  rawValues: EnquirySubmissionValues
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (rawValues.honeypot && rawValues.honeypot.length > 0) {
    return {
      success: true,
      message: "Thank you. Your enquiry has been received.",
    };
  }

  const parsed = enquirySubmissionSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Please check your enquiry fields.",
    };
  }

  const rate = checkRateLimit(`enquiry:${parsed.data.email.toLowerCase()}`, 5, 60_000);
  if (!rate.allowed) {
    return {
      success: false,
      error: "Too many enquiries submitted recently. Please wait a moment and try again.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Database connection is not configured. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to store enquiries.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return {
      success: false,
      error: "Unable to initialize database client.",
    };
  }

  const { error } = await (supabase.from("enquiries") as unknown as {
    insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  }).insert({
    full_name: parsed.data.full_name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone ? parsed.data.phone : null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "NEW",
  });

  if (error) {
    return {
      success: false,
      error: "Unable to save your enquiry at this time. Please try again shortly.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");

  return {
    success: true,
    message:
      "Thank you. Your enquiry has been recorded by the SCENTS & MISTS concierge.",
  };
}

export async function getAdminEnquiriesAction({
  statusFilter,
  searchQuery,
}: {
  statusFilter?: string;
  searchQuery?: string;
} = {}): Promise<{
  enquiries: Enquiry[];
  isDatabaseConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { enquiries: [], isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return { enquiries: [], isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { enquiries: [], isDatabaseConnected: false };
  }

  let query = supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter as EnquiryStatus);
  }

  const { data } = await query;
  let list = ((data ?? []) as Enquiry[]);

  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.full_name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
    );
  }

  return { enquiries: list, isDatabaseConnected: true };
}

export async function getEnquiryByIdAction(id: string): Promise<{
  enquiry: Enquiry | null;
  isDatabaseConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { enquiry: null, isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return { enquiry: null, isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { enquiry: null, isDatabaseConnected: false };
  }

  const { data } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single();

  return {
    enquiry: (data as Enquiry | null) ?? null,
    isDatabaseConnected: true,
  };
}

export async function updateEnquiryStatusAction(rawInput: {
  id: string;
  status: EnquiryStatus;
  internal_notes?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = enquiryUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid enquiry update data.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const updatePayload: Record<string, unknown> = {
    status: parsed.data.status,
  };
  if (parsed.data.internal_notes !== undefined) {
    updatePayload.internal_notes = parsed.data.internal_notes;
  }

  const { error } = await (supabase.from("enquiries") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update(updatePayload)
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: "Failed to update enquiry." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "ENQUIRY_STATUS_UPDATED",
    resourceType: "enquiries",
    resourceId: parsed.data.id,
    metadata: { status: parsed.data.status },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${parsed.data.id}`);

  return { success: true };
}

export async function deleteEnquiryAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) {
    return { success: false, error: "Unable to delete enquiry." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "ENQUIRY_DELETED",
    resourceType: "enquiries",
    resourceId: id,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");

  return { success: true };
}

