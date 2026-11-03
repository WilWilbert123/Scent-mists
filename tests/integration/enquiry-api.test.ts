import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/contact/route";

describe("POST /api/contact Route Handler", () => {
  it("returns 400 when validation fails on an incomplete enquiry payload", async () => {
    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "A",
        email: "invalid-email",
        subject: "Hi",
        message: "Too short",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it("handles valid enquiry payload cleanly even when Supabase env vars are not configured", async () => {
    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Elena Rostova",
        email: "elena@example.com",
        phone: "+44 20 7946 0192",
        subject: "Bespoke Fragrance Consultation",
        message: "I would like to arrange a private consultation regarding Himalayan Cherry Blossom Air.",
        honeypot: "",
      }),
    });

    const response = await POST(request);
    expect([200, 503]).toContain(response.status);
    const json = await response.json();
    expect(typeof (json.message ?? json.error)).toBe("string");
  });
});

