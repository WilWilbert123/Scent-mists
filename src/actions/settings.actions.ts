"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  recordAuditLog,
  verifyServerAdmin,
} from "@/lib/supabase/admin";
import type { AdminProfile, AuditLogEntry } from "@/types/admin";
import { logger } from "@/lib/logger";

export async function getAdminProfileAndLogsAction(): Promise<{
  admin: AdminProfile | null;
  auditLogs: AuditLogEntry[];
  isDatabaseConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { admin: null, auditLogs: [], isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { admin: null, auditLogs: [], isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { admin: auth.admin, auditLogs: [], isDatabaseConnected: false };
  }

  const [{ data: logsData }, { data: profilesData }] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("admin_profiles").select("id, email"),
  ]);

  const emailByAdminId = new Map<string, string>();
  for (const p of (profilesData ?? []) as Array<{ id: string; email: string }>) {
    if (p.id && p.email) {
      emailByAdminId.set(p.id, p.email);
    }
  }
  if (auth.admin.id && auth.admin.email) {
    emailByAdminId.set(auth.admin.id, auth.admin.email);
  }

  const auditLogs = ((logsData ?? []) as unknown as AuditLogEntry[]).map(
    (entry) => ({
      ...entry,
      admin_email:
        emailByAdminId.get(entry.admin_user_id) ||
        (typeof entry.metadata?.email === "string"
          ? entry.metadata.email
          : undefined),
    })
  );

  return {
    admin: auth.admin,
    auditLogs,
    isDatabaseConnected: true,
  };
}

export async function updateAdminProfileAction(rawInput: {
  full_name: string;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const cleanName = rawInput.full_name.trim();
  if (cleanName.length < 2 || cleanName.length > 100) {
    return {
      success: false,
      error: "Full name must be between 2 and 100 characters.",
    };
  }

  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await (supabase.from("admin_profiles") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update({ full_name: cleanName })
    .eq("id", auth.admin.id);

  if (error) {
    return { success: false, error: "Failed to update administrator profile." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "ADMIN_PROFILE_UPDATED",
    resourceType: "admin_profiles",
    resourceId: auth.admin.id,
    metadata: { full_name: cleanName },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/profile");

  return { success: true };
}

export async function updateAdminPasswordAction(rawInput: {
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  if (!rawInput.newPassword || rawInput.newPassword.length < 8) {
    return {
      success: false,
      error: "New password must contain at least 8 characters.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await supabase.auth.updateUser({
    password: rawInput.newPassword,
  });

  if (error) {
    return { success: false, error: error.message || "Unable to update password." };
  }

  // Record audit log WITHOUT storing password
  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "ADMIN_PASSWORD_CHANGED",
    resourceType: "auth",
    resourceId: auth.admin.id,
  });

  return { success: true };
}

export type CleanableTableName =
  | "visitor_analytics"
  | "enquiries"
  | "newsletter_subscribers"
  | "audit_logs";

export interface SupabaseTableStat {
  tableName: string;
  displayName: string;
  category: "Telemetry" | "Client Concierge" | "Catalog" | "CMS" | "Security & RBAC";
  rowCount: number;
  estimatedBytes: number;
  lastTimestamp: string | null;
  canClean: boolean;
  manageHref: string;
}

export interface SupabaseDatabaseDiagnostics {
  tables: SupabaseTableStat[];
  totalRows: number;
  totalUsedBytes: number;
  databaseQuotaBytes: number; // 500 MB standard Supabase PostgreSQL database quota
  availableBytes: number;
  usedPercentage: number;
  storageBucketsCount: number;
  storageObjectsCount: number;
  storageUsedBytes: number;
  storageQuotaBytes: number; // 1 GB standard Supabase Storage quota
}

const SUPABASE_DB_QUOTA_BYTES = 500 * 1024 * 1024; // 500 MB
const SUPABASE_STORAGE_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB
const PG_TUPLE_AND_INDEX_OVERHEAD_BYTES = 160; // PostgreSQL heap tuple header + index entry overhead per row

export async function getSupabaseDatabaseDiagnosticsAction(): Promise<SupabaseDatabaseDiagnostics> {
  const emptyResult: SupabaseDatabaseDiagnostics = {
    tables: [],
    totalRows: 0,
    totalUsedBytes: 0,
    databaseQuotaBytes: SUPABASE_DB_QUOTA_BYTES,
    availableBytes: SUPABASE_DB_QUOTA_BYTES,
    usedPercentage: 0,
    storageBucketsCount: 0,
    storageObjectsCount: 0,
    storageUsedBytes: 0,
    storageQuotaBytes: SUPABASE_STORAGE_QUOTA_BYTES,
  };

  if (!isSupabaseConfigured()) {
    return emptyResult;
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return emptyResult;
  }

  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return emptyResult;
  }

  const [
    visitorsRes,
    enquiriesRes,
    newsletterRes,
    auditRes,
    productsRes,
    collectionsRes,
    siteContentRes,
    adminsRes,
    bucketsRes,
  ] = await Promise.all([
    supabase
      .from("visitor_analytics")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase
      .from("collections")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase
      .from("site_content")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase
      .from("admin_profiles")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase.storage.listBuckets(),
  ]);

  const computeStats = (
    rows: unknown[] | null | undefined
  ): { rowCount: number; estimatedBytes: number; lastTimestamp: string | null } => {
    const list = (rows ?? []) as Array<Record<string, unknown>>;
    const rowCount = list.length;
    if (rowCount === 0) {
      return { rowCount: 0, estimatedBytes: 8192, lastTimestamp: null }; // 8 KB base PostgreSQL page allocation
    }
    const jsonBytes = Buffer.byteLength(JSON.stringify(list), "utf8");
    const estimatedBytes =
      8192 + jsonBytes + rowCount * PG_TUPLE_AND_INDEX_OVERHEAD_BYTES;
    const first = list[0];
    const lastTimestamp =
      (typeof first?.updated_at === "string" ? first.updated_at : null) ||
      (typeof first?.created_at === "string" ? first.created_at : null);

    return { rowCount, estimatedBytes, lastTimestamp };
  };

  const visitorStat = computeStats(visitorsRes.data);
  const enquiryStat = computeStats(enquiriesRes.data);
  const newsletterStat = computeStats(newsletterRes.data);
  const auditStat = computeStats(auditRes.data);
  const productStat = computeStats(productsRes.data);
  const collectionStat = computeStats(collectionsRes.data);
  const siteContentStat = computeStats(siteContentRes.data);
  const adminStat = computeStats(adminsRes.data);

  const tables: SupabaseTableStat[] = [
    {
      tableName: "visitor_analytics",
      displayName: "Visitor Analytics & Event Log",
      category: "Telemetry",
      ...visitorStat,
      canClean: true,
      manageHref: "/admin/visitors",
    },
    {
      tableName: "enquiries",
      displayName: "Customer Concierge Enquiries",
      category: "Client Concierge",
      ...enquiryStat,
      canClean: true,
      manageHref: "/admin/enquiries",
    },
    {
      tableName: "newsletter_subscribers",
      displayName: "Newsletter Subscribers Registry",
      category: "Client Concierge",
      ...newsletterStat,
      canClean: true,
      manageHref: "/admin/newsletter",
    },
    {
      tableName: "audit_logs",
      displayName: "Administrative Audit Trail",
      category: "Security & RBAC",
      ...auditStat,
      canClean: true,
      manageHref: "/admin/audit-logs",
    },
    {
      tableName: "products",
      displayName: "Fragrance Showcase Entries",
      category: "Catalog",
      ...productStat,
      canClean: false,
      manageHref: "/admin/products",
    },
    {
      tableName: "collections",
      displayName: "Curated Fragrance Collections",
      category: "Catalog",
      ...collectionStat,
      canClean: false,
      manageHref: "/admin/collections",
    },
    {
      tableName: "site_content",
      displayName: "CMS Site Content (Homepage, Banners, Story)",
      category: "CMS",
      ...siteContentStat,
      canClean: false,
      manageHref: "/admin/content",
    },
    {
      tableName: "admin_profiles",
      displayName: "Verified Administrator Profiles",
      category: "Security & RBAC",
      ...adminStat,
      canClean: false,
      manageHref: "/admin/settings/profile",
    },
  ];

  const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);
  const totalUsedBytes = tables.reduce((sum, t) => sum + t.estimatedBytes, 0);
  const availableBytes = Math.max(0, SUPABASE_DB_QUOTA_BYTES - totalUsedBytes);
  const usedPercentage = Number(
    ((totalUsedBytes / SUPABASE_DB_QUOTA_BYTES) * 100).toFixed(4)
  );

  const buckets = bucketsRes.data ?? [];
  let storageObjectsCount = 0;
  let storageUsedBytes = 0;

  if (buckets.length > 0) {
    const bucketLists = await Promise.all(
      buckets.map((b) => supabase.storage.from(b.name).list("", { limit: 500 }))
    );
    for (const res of bucketLists) {
      for (const obj of res.data ?? []) {
        if (obj.id) {
          storageObjectsCount += 1;
          const size =
            typeof obj.metadata?.size === "number" ? obj.metadata.size : 0;
          storageUsedBytes += size;
        }
      }
    }
  }

  return {
    tables,
    totalRows,
    totalUsedBytes,
    databaseQuotaBytes: SUPABASE_DB_QUOTA_BYTES,
    availableBytes,
    usedPercentage,
    storageBucketsCount: buckets.length,
    storageObjectsCount,
    storageUsedBytes,
    storageQuotaBytes: SUPABASE_STORAGE_QUOTA_BYTES,
  };
}

const ALLOWED_CLEAN_TABLES = new Set<CleanableTableName>([
  "visitor_analytics",
  "enquiries",
  "newsletter_subscribers",
  "audit_logs",
]);

export async function cleanSupabaseTableAction(
  tableName: CleanableTableName
): Promise<{
  success: boolean;
  deletedCount?: number;
  error?: string;
}> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return {
      success: false,
      error: auth.error || "Unauthorized admin operation.",
    };
  }

  if (!ALLOWED_CLEAN_TABLES.has(tableName)) {
    return {
      success: false,
      error: `Table "${tableName}" is a protected core table and cannot be bulk-purged.`,
    };
  }

  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { data: existingRows } = await supabase
    .from(tableName)
    .select("id");
  const countBefore = (existingRows ?? []).length;

  const { error } = await supabase
    .from(tableName)
    .delete()
    .not("id", "is", null);

  if (error) {
    return {
      success: false,
      error: error.message || `Failed to clean public.${tableName}.`,
    };
  }

  if (tableName !== "audit_logs") {
    await recordAuditLog({
      adminUserId: auth.admin.id,
      action: "DATABASE_TABLE_CLEANED",
      resourceType: tableName,
      resourceId: tableName,
      metadata: { rows_removed: countBefore },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/visitors");
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/settings");

  return {
    success: true,
    deletedCount: countBefore,
  };
}

export interface CreateAdminAccountInput {
  username: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
  currentAdminPassword: string;
}

export async function getAdminAccountsListAction(): Promise<{
  admins: AdminProfile[];
  currentAdminId: string | null;
}> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { admins: [], currentAdminId: null };
  }

  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { admins: [auth.admin], currentAdminId: auth.admin.id };
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) {
    return { admins: [auth.admin], currentAdminId: auth.admin.id };
  }

  return {
    admins: data as AdminProfile[],
    currentAdminId: auth.admin.id,
  };
}

export async function createAnotherAdminAction(
  input: CreateAdminAccountInput
): Promise<{
  success: boolean;
  error?: string;
  newAdmin?: AdminProfile;
}> {
  // 1. Verify current session is an admin
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return {
      success: false,
      error:
        "Unauthorized operation. Only logged-in administrators can create admin accounts.",
    };
  }

  // 2. Validate inputs
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const newPassword = input.newPassword;
  const confirmPassword = input.confirmPassword;
  const currentAdminPassword = input.currentAdminPassword;

  if (username.length < 2) {
    return {
      success: false,
      error: "Username / Full Name must be at least 2 characters.",
    };
  }

  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid administrator email address.",
    };
  }

  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters long.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "New password and Confirm Password do not match.",
    };
  }

  if (!currentAdminPassword) {
    return {
      success: false,
      error:
        "Current administrator password is required for security verification.",
    };
  }

  // 3. SECURITY VERIFICATION: Verify the current admin's password!
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      error: "Supabase authentication configuration is missing.",
    };
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: verifyData, error: verifyError } =
    await anonClient.auth.signInWithPassword({
      email: auth.admin.email,
      password: currentAdminPassword,
    });

  if (verifyError || !verifyData.user) {
    logger.warn(
      "Admin account creation blocked: incorrect authorizing admin password",
      {
        attempted_by: auth.admin.email,
        target_email: email,
      }
    );
    return {
      success: false,
      error:
        "Incorrect current admin password. Authorization failed — your administrator password was not recognized, so the new admin account cannot be created.",
    };
  }

  // 4. Check if an admin with this email or username already exists
  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    return {
      success: false,
      error:
        "Supabase service role client is not available. Please verify SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const { data: existingProfiles } = await serviceClient
    .from("admin_profiles")
    .select("id, email, full_name");

  const duplicate = (existingProfiles ?? []).find(
    (p: { email?: string; full_name?: string }) =>
      p.email?.toLowerCase() === email ||
      p.full_name?.toLowerCase() === username.toLowerCase()
  );

  if (duplicate) {
    return {
      success: false,
      error: `An administrator with this email (${email}) or username (${username}) already exists.`,
    };
  }

  // 5. Create new user in Supabase Auth via Admin API
  const { data: createdAuthUser, error: createAuthError } =
    await serviceClient.auth.admin.createUser({
      email,
      password: newPassword,
      email_confirm: true,
      user_metadata: {
        full_name: username,
        role: "ADMIN",
      },
    });

  if (createAuthError || !createdAuthUser.user) {
    return {
      success: false,
      error:
        createAuthError?.message ||
        "Failed to create new user credentials in Supabase Auth.",
    };
  }

  const newAdminId = createdAuthUser.user.id;
  const now = new Date().toISOString();

  // 6. Insert new profile into public.admin_profiles
  const newProfileRecord: AdminProfile = {
    id: newAdminId,
    email,
    full_name: username,
    role: "ADMIN",
    created_at: now,
    updated_at: now,
  };

  const { error: profileInsertError } = await (
    serviceClient.from("admin_profiles") as unknown as {
      upsert: (
        values: Record<string, unknown>,
        opts?: { onConflict?: string }
      ) => Promise<{ error: { message: string } | null }>;
    }
  ).upsert(newProfileRecord as unknown as Record<string, unknown>, {
    onConflict: "id",
  });

  if (profileInsertError) {
    return {
      success: false,
      error: `Auth user created, but failed to insert into admin_profiles: ${profileInsertError.message}`,
    };
  }

  // 7. Record an immutable audit log
  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "ADMIN_ACCOUNT_CREATED",
    resourceType: "admin_profiles",
    resourceId: newAdminId,
    metadata: {
      authorized_by_admin: auth.admin.email,
      created_admin_email: email,
      created_admin_name: username,
      role: "ADMIN",
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/security");
  revalidatePath("/admin/settings/profile");
  revalidatePath("/admin/audit-logs");

  return {
    success: true,
    newAdmin: newProfileRecord,
  };
}

export async function deleteAdminAccountAction(
  targetAdminId: string,
  currentAdminPassword: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return {
      success: false,
      error: "Unauthorized operation.",
    };
  }

  if (targetAdminId === auth.admin.id) {
    return {
      success: false,
      error: "Security protection: You cannot delete your own active administrator account.",
    };
  }

  if (!currentAdminPassword) {
    return {
      success: false,
      error: "Current administrator password is required to authorize deletion.",
    };
  }

  // Verify current admin password
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { success: false, error: "Supabase configuration missing." };
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: verifyData, error: verifyError } =
    await anonClient.auth.signInWithPassword({
      email: auth.admin.email,
      password: currentAdminPassword,
    });

  if (verifyError || !verifyData.user) {
    return {
      success: false,
      error: "Incorrect current admin password. Authorization failed.",
    };
  }

  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) {
    return { success: false, error: "Supabase service client unavailable." };
  }

  // Delete from admin_profiles
  await serviceClient.from("admin_profiles").delete().eq("id", targetAdminId);

  // Delete from auth.users
  await serviceClient.auth.admin.deleteUser(targetAdminId);

  // Audit log
  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "ADMIN_ACCOUNT_DELETED",
    resourceType: "admin_profiles",
    resourceId: targetAdminId,
    metadata: {
      authorized_by_admin: auth.admin.email,
      deleted_admin_id: targetAdminId,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/security");
  revalidatePath("/admin/audit-logs");

  return { success: true };
}

