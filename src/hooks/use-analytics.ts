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
 * Prevents duplicate tracking on re-renders and never tracks /admin routes.
 */
export function useVisitorAnalytics() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (lastTrackedRef.current === pathname) return;

    try {
      const recentSessionTrack = window.sessionStorage.getItem(LAST_TRACKED_KEY);
      if (recentSessionTrack === `${pathname}:${Math.floor(Date.now() / 30000)}`) {
        return;
      }

      let visitorId = window.localStorage.getItem(VISITOR_KEY);
      if (!visitorId) {
        visitorId = generateRandomId("vis");
        window.localStorage.setItem(VISITOR_KEY, visitorId);
      }

      let sessionId = window.sessionStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = generateRandomId("ses");
        window.sessionStorage.setItem(SESSION_KEY, sessionId);
      }

      window.sessionStorage.setItem(
        LAST_TRACKED_KEY,
        `${pathname}:${Math.floor(Date.now() / 30000)}`
      );
      lastTrackedRef.current = pathname;

      const payload = {
        anonymous_visitor_id: visitorId,
        session_id: sessionId,
        page_path: pathname,
        referrer_category: categorizeReferrer(
          document.referrer,
          window.location.hostname
        ),
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
        // Non-blocking analytics call
      });
    } catch {
      // Storage blocked or unavailable; silently skip tracking
    }
  }, [pathname]);
}

