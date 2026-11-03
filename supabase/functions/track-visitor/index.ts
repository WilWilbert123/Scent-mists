// Supabase Edge Function: track-visitor
// Privacy-conscious visitor analytics ingestion endpoint

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
    const {
      anonymous_visitor_id,
      session_id,
      page_path,
      referrer_category = "Direct",
      device_category = "Desktop",
      browser_category = "Other",
    } = body ?? {};

    if (
      typeof anonymous_visitor_id !== "string" ||
      anonymous_visitor_id.length < 8 ||
      typeof session_id !== "string" ||
      session_id.length < 8 ||
      typeof page_path !== "string" ||
      !page_path.startsWith("/")
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid visitor analytics payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("visitor_analytics").insert({
      anonymous_visitor_id: anonymous_visitor_id.slice(0, 80),
      session_id: session_id.slice(0, 80),
      page_path: page_path.slice(0, 200),
      referrer_category,
      device_category,
      browser_category,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to record analytics" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Malformed request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

