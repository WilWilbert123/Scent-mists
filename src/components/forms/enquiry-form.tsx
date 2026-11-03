"use client";

import React from "react";
import { ContactForm } from "./contact-form";

interface EnquiryFormProps {
  fragranceName?: string;
}

export function EnquiryForm({ fragranceName }: EnquiryFormProps) {
  const defaultSubject = fragranceName
    ? `Fragrance Enquiry: ${fragranceName}`
    : "Fragrance Showcase Enquiry";

  return <ContactForm defaultSubject={defaultSubject} />;
}

