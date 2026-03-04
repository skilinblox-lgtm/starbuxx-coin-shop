import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("PIX Webhook received:", JSON.stringify(body));

    const { transactionId, transactionState, externalId, value, event } = body;

    // externalId = orderId that we sent when creating the deposit
    const orderId = externalId;
    if (!orderId) {
      console.error("No externalId/orderId in webhook");
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if payment completed
    const isCompleted = transactionState === "COMPLETO" || event === "DEPOSITO_COMPLETO";

    if (isCompleted) {
      // Update order status to "pago"
      const { error: updateErr } = await adminClient.from("orders").update({
        status: "pago",
        payment_approved_at: new Date().toISOString(),
      }).eq("id", orderId);

      if (updateErr) {
        console.error("Error updating order:", updateErr);
      } else {
        console.log(`Order ${orderId} marked as PAGO`);

        // Get order details for email
        const { data: order } = await adminClient.from("orders").select("*").eq("id", orderId).single();

        if (order) {
          // Log email to send (payment_approved)
          const { data: profile } = await adminClient.from("profiles").select("*").eq("user_id", order.user_id).single();

          // Try to get user email from auth
          const { data: userData } = await adminClient.auth.admin.getUserById(order.user_id);
          const email = userData?.user?.email;

          if (email) {
            await adminClient.from("email_logs").insert({
              template_key: "payment_approved",
              recipient_email: email,
              recipient_user_id: order.user_id,
              order_id: orderId,
              status: "pending",
            });
            console.log(`Email log created for ${email} (payment_approved)`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("pix-webhook error:", err);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
