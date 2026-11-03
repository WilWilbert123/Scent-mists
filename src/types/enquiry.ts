import type { EnquiryStatus } from "./database.types";

export type { EnquiryStatus };

export interface Enquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: EnquiryStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnquirySubmissionValues {
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  honeypot?: string;
}

