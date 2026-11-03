"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import type { AdminProfile } from "@/types/admin";

export function useAdminAuth() {
  const { supabase, user, isConfigured, isLoading: authLoading } = useSupabase();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading) return;
    if (!supabase || !user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);

    supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!active) return;
        const adminData = (data as AdminProfile | null) ?? null;
        if (adminData && adminData.role === "ADMIN") {
          setProfile(adminData);
        } else {
          setProfile(null);
        }
        setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [supabase, user, authLoading]);

  return {
    user,
    profile,
    isAdmin: Boolean(profile && profile.role === "ADMIN"),
    isConfigured,
    isLoading: authLoading || profileLoading,
  };
}

