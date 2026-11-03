// Supabase Edge Function: submit-enquiry
// Validates and stores customer fragrance enquiries into public.enquiries

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { full_name, email, phone, subject, message, honeypot } = body ?? {};

    if (honeypot && String(honeypot).length > 0) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (
      !full_name ||
      String(full_name).trim().length < 2 ||
      !email ||
      !String(email).includes("@") ||
      !subject ||
      String(subject).trim().length < 3 ||
      !message ||
      String(message).trim().length < 10
    ) {
      return new Response(
        JSON.stringify({ error: "Validation failed for enquiry fields." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("enquiries").insert({
      full_name: String(full_name).trim().slice(0, 100),
      email: String(email).trim().toLowerCase().slice(0, 160),
      phone: phone ? String(phone).trim().slice(0, 30) : null,
      subject: String(subject).trim().slice(0, 140),
      message: String(message).trim().slice(0, 3000),
      status: "NEW",
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Unable to save enquiry" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you. Your enquiry has been received by SCENTS & MISTS.",
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request payload" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

