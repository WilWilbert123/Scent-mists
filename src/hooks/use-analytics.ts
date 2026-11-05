"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  categorizeBrowser,
  categorizeDevice,
  categorizeReferrer,
} from "@/lib/analytics";

const VISITOR_KEY = "sm_anon_vid";
const SESSION_KEY = "sm_anon_sid";
const ENTRY_REF_KEY = "sm_anon_entry_ref";
const LAST_TRACKED_KEY = "sm_last_tracked_path";

function generateRandomId(prefix: string): string {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}_${randomPart.slice(0, 24)}`;
}

/**
 * Privacy-conscious anonymous visitor page-view tracker.
 *
 * Accuracy enhancements:
 * 1. Skips localhost / 127.0.0.1 development visits so local dev tests don't pollute live metrics.
 * 2. Skips logged-in admins browsing their storefront so owner clicks aren't counted as customer visits.
 * 3. Preserves initial entry referrer across the session so deep browsing doesn't convert into "Direct".
 * 4. Deduplicates rapid consecutive page views on the same route within 60 seconds.
 * 5. Strictly ignores /admin routes.
 */
export function useVisitorAnalytics() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    // Never record /admin routes in public analytics
    if (pathname.startsWith("/admin")) return;

    // Filter out local development traffic unless developer explicitly forced sm_debug_track
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local");

    if (isLocalhost && !window.localStorage.getItem("sm_debug_track")) {
      return;
    }

    // Do not track logged-in store administrators browsing the storefront
    const isAdmin =
      document.cookie.includes("scents_admin_session") ||
      document.cookie.includes("admin_token") ||
      window.localStorage.getItem("scents_admin_user");

    if (isAdmin) {
      return;
    }

    if (lastTrackedRef.current === pathname) return;

    try {
      // Deduplicate rapid re-renders / re-entries on same path within 60 seconds
      const currentMinuteBucket = Math.floor(Date.now() / 60000);
      const recentTrack = window.sessionStorage.getItem(LAST_TRACKED_KEY);
      if (recentTrack === `${pathname}:${currentMinuteBucket}`) {
        return;
      }

      // Consistent anonymous visitor ID
      let visitorId = window.localStorage.getItem(VISITOR_KEY);
      if (!visitorId) {
        visitorId = generateRandomId("vis");
        window.localStorage.setItem(VISITOR_KEY, visitorId);
      }

      // Consistent session ID
      let sessionId = window.sessionStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = generateRandomId("ses");
        window.sessionStorage.setItem(SESSION_KEY, sessionId);
      }

      // Preserve true entry referrer across the entire user session
      let sessionReferrer = window.sessionStorage.getItem(ENTRY_REF_KEY);
      if (!sessionReferrer) {
        sessionReferrer = categorizeReferrer(
          document.referrer,
          window.location.hostname
        );
        window.sessionStorage.setItem(ENTRY_REF_KEY, sessionReferrer);
      }

      window.sessionStorage.setItem(
        LAST_TRACKED_KEY,
        `${pathname}:${currentMinuteBucket}`
      );
      lastTrackedRef.current = pathname;

      const payload = {
        anonymous_visitor_id: visitorId,
        session_id: sessionId,
        page_path: pathname,
        referrer_category: sessionReferrer,
        device_category: categorizeDevice(
          navigator.userAgent,
          window.innerWidth
        ),
        browser_category: categorizeBrowser(navigator.userAgent),
      };

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Non-blocking telemetry
      });
    } catch {
      // Storage blocked or unavailable; silently skip tracking
    }
  }, [pathname]);
}
