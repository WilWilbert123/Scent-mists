import type { AdminProfile } from "@/types/admin";

/**
 * Pure authorization helper used by server actions, route handlers, and unit tests.
 * Verifies that a user session exists and has a matching ADMIN profile record.
 */
export function isAuthorizedAdmin(
  user: { id: string; email?: string | null } | null,
  profile: AdminProfile | null
): boolean {
  if (!user || !user.id) return false;
  if (!profile) return false;
  if (profile.id !== user.id) return false;
  if (profile.role !== "ADMIN") return false;
  return true;
}

export function assertAdminPermission(
  user: { id: string; email?: string | null } | null,
  profile: AdminProfile | null
): AdminProfile {
  if (!isAuthorizedAdmin(user, profile) || !profile) {
    throw new Error("UNAUTHORIZED_ADMIN_ACCESS");
  }
  return profile;
}

