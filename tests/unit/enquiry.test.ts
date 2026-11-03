import { describe, expect, it } from "vitest";
import {
  enquirySubmissionSchema,
  enquiryUpdateSchema,
  newsletterSubscriptionSchema,
  validateImageUpload,
} from "@/lib/validations";

describe("Enquiry, Newsletter, and Image Upload Validation", () => {
  it("accepts a valid luxury fragrance enquiry submission", () => {
    const parsed = enquirySubmissionSchema.safeParse({
      full_name: "Clara Vance",
      email: "clara.vance@example.com",
      phone: "+41 22 555 0192",
      subject: "Himalayan Cherry Blossom Air — Private Consultation",
      message: "I would love to learn more about the botanical distillation of your signature creation.",
      honeypot: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects spam submissions when the honeypot field is filled", () => {
    const parsed = enquirySubmissionSchema.safeParse({
      full_name: "Bot Account",
      email: "bot@example.com",
      subject: "Automated spam",
      message: "This message was filled by an automated bot script.",
      honeypot: "http://spam-link.example.com",
    });
    expect(parsed.success).toBe(false);
  });

  it("validates admin enquiry status updates", () => {
    const valid = enquiryUpdateSchema.safeParse({
      id: "enq_123",
      status: "CONTACTED",
      internal_notes: "Sent personal response with fragrance notes dossier.",
    });
    expect(valid.success).toBe(true);

    const invalid = enquiryUpdateSchema.safeParse({
      id: "",
      status: "UNKNOWN_STATUS",
    });
    expect(invalid.success).toBe(false);
  });

  it("normalizes newsletter emails and blocks invalid formats", () => {
    const valid = newsletterSubscriptionSchema.safeParse({
      email: "  GUEST@Example.com ",
      honeypot: "",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("guest@example.com");
    }
  });

  it("validates image upload MIME types and file size limits", () => {
    const validWebp = validateImageUpload({
      type: "image/webp",
      size: 1024 * 500,
      name: "Himalayan Bottle Shot!.webp",
    });
    expect(validWebp.valid).toBe(true);
    expect(validWebp.safeFilename).toMatch(/^\d+-himalayan-bottle-shot-\.webp$/);

    const invalidMime = validateImageUpload({
      type: "application/x-msdownload",
      size: 1024,
      name: "malicious.exe",
    });
    expect(invalidMime.valid).toBe(false);
  });
});

