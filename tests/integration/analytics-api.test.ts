import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/analytics/route";

describe("POST /api/analytics Route Handler", () => {
  it("rejects malformed visitor analytics payloads", async () => {
    const request = new NextRequest("http://localhost:3000/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymous_visitor_id: "short",
        session_id: "short",
        page_path: "invalid-path-without-slash",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("accepts privacy-conscious anonymous visitor events", async () => {
    const request = new NextRequest("http://localhost:3000/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymous_visitor_id: "vis_9876543210abcdef",
        session_id: "sess_1234567890abcdef",
        page_path: "/products/himalayan-cherry-blossom-air",
        referrer_category: "Direct",
        device_category: "Desktop",
        browser_category: "Chrome",
      }),
    });

    const response = await POST(request);
    expect([201, 202]).toContain(response.status);
    const json = await response.json();
    if (response.status === 202) {
      expect(json.configured).toBe(false);
    } else {
      expect(json.success).toBe(true);
    }
  });
});

