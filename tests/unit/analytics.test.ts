import { describe, expect, it } from "vitest";
import {
  categorizeBrowser,
  categorizeDevice,
  categorizeReferrer,
  computeVisitorAggregates,
} from "@/lib/analytics";
import type { VisitorAnalyticsRecord } from "@/types/analytics";

describe("Analytics categorization & aggregation utilities", () => {
  it("categorizes referrers accurately without retaining sensitive query parameters", () => {
    expect(categorizeReferrer("")).toBe("Direct");
    expect(categorizeReferrer("https://scentsandmists.com/shop", "scentsandmists.com")).toBe("Direct");
    expect(categorizeReferrer("https://www.google.com/search?q=himalayan+cherry+blossom")).toBe("Organic Search");
    expect(categorizeReferrer("https://www.instagram.com/p/abc123")).toBe("Social");
    expect(categorizeReferrer("https://editorial-magazine.example.com/perfumes")).toBe("Referral");
  });

  it("categorizes device types from user-agent and viewport width", () => {
    expect(
      categorizeDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
        390
      )
    ).toBe("Mobile");
    expect(
      categorizeDevice(
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        820
      )
    ).toBe("Tablet");
    expect(
      categorizeDevice(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        1440
      )
    ).toBe("Desktop");
  });

  it("categorizes browser families cleanly", () => {
    expect(categorizeBrowser("Mozilla/5.0 Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0")).toBe("Edge");
    expect(categorizeBrowser("Mozilla/5.0 Chrome/124.0.0.0 Safari/537.36")).toBe("Chrome");
    expect(categorizeBrowser("Mozilla/5.0 Version/17.0 Safari/605.1.15")).toBe("Safari");
    expect(categorizeBrowser("Mozilla/5.0 Gecko/20100101 Firefox/125.0")).toBe("Firefox");
  });

  it("computes distinct page views vs unique anonymous visitors and empty zero states", () => {
    const empty = computeVisitorAggregates([]);
    expect(empty.totalPageViews).toBe(0);
    expect(empty.uniqueVisitors).toBe(0);
    expect(empty.totalSessions).toBe(0);
    expect(empty.mostViewedPages).toEqual([]);

    const sampleRecords: VisitorAnalyticsRecord[] = [
      {
        id: "1",
        anonymous_visitor_id: "vis_alpha_12345",
        session_id: "sess_001_abcdef",
        page_path: "/",
        referrer_category: "Direct",
        device_category: "Desktop",
        browser_category: "Chrome",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        anonymous_visitor_id: "vis_alpha_12345",
        session_id: "sess_001_abcdef",
        page_path: "/products/himalayan-cherry-blossom-air",
        referrer_category: "Direct",
        device_category: "Desktop",
        browser_category: "Chrome",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        anonymous_visitor_id: "vis_beta_67890",
        session_id: "sess_002_ghijkl",
        page_path: "/",
        referrer_category: "Organic Search",
        device_category: "Mobile",
        browser_category: "Safari",
        created_at: new Date().toISOString(),
      },
    ];

    const summary = computeVisitorAggregates(sampleRecords);
    expect(summary.totalPageViews).toBe(3);
    expect(summary.uniqueVisitors).toBe(2);
    expect(summary.totalSessions).toBe(2);
    expect(summary.mostViewedPages[0]).toEqual({
      page_path: "/",
      views: 2,
      unique_visitors: 2,
    });
  });
});

