import { describe, expect, it } from "vitest";
import { assertAdminPermission, isAuthorizedAdmin } from "@/lib/permissions";
import type { AdminProfile } from "@/types/admin";

describe("Admin Role & Permission Verification", () => {
  const validAdminProfile: AdminProfile = {
    id: "admin-uuid-001",
    email: "concierge@scentsandmists.com",
    full_name: "Archival Director",
    role: "ADMIN",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  it("grants access when user session matches an ADMIN profile", () => {
    expect(
      isAuthorizedAdmin(
        { id: "admin-uuid-001", email: "concierge@scentsandmists.com" },
        validAdminProfile
      )
    ).toBe(true);
  });

  it("denies access when user is null, profile is missing, or IDs mismatch", () => {
    expect(isAuthorizedAdmin(null, validAdminProfile)).toBe(false);
    expect(isAuthorizedAdmin({ id: "admin-uuid-001" }, null)).toBe(false);
    expect(isAuthorizedAdmin({ id: "different-user-id" }, validAdminProfile)).toBe(false);
  });

  it("throws UNAUTHORIZED_ADMIN_ACCESS when assertAdminPermission fails", () => {
    expect(() => assertAdminPermission(null, null)).toThrow("UNAUTHORIZED_ADMIN_ACCESS");
    expect(
      assertAdminPermission({ id: "admin-uuid-001" }, validAdminProfile)
    ).toEqual(validAdminProfile);
  });
});

