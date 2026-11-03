// Supabase Edge Function: send-enquiry-notification
// Triggered by database webhook when a new enquiry is inserted

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload?.record;

    if (!record || !record.id) {
      return new Response(
        JSON.stringify({ error: "Missing enquiry record" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Structured notification log (without sensitive credentials)
    console.info(
      JSON.stringify({
        event: "NEW_ENQUIRY_NOTIFICATION",
        enquiryId: record.id,
        subject: record.subject,
        createdAt: record.created_at,
      })
    );

    return new Response(
      JSON.stringify({ notified: true, enquiryId: record.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to process notification" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

