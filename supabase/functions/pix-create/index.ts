import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLASHPIX_BASE = "https://apiflashpix.squareweb.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId é obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get order details
    const { data: order, error: orderErr } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (order.user_id !== claimsData.claims.sub) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const clientId = Deno.env.get("FLASHPIX_CLIENT_ID");
    const clientSecret = Deno.env.get("FLASHPIX_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "Credenciais PIX não configuradas" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Webhook URL for automatic notifications
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const webhookUrl = `${supabaseUrl}/functions/v1/pix-webhook`;

    // Create PIX deposit via Flash PIX API
    const pixResponse = await fetch(`${FLASHPIX_BASE}/api/v1/deposit`, {
      method: "POST",
      headers: {
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: Number(order.total_price),
        webhookUrl,
        externalId: orderId,
      }),
    });

    const pixData = await pixResponse.json();
    if (!pixResponse.ok) {
      console.error("Flash PIX error:", pixData);
      return new Response(JSON.stringify({ error: "Erro ao gerar PIX", details: pixData }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Store transaction ID in order metadata (use admin client for this)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Update order with transaction reference
    await adminClient.from("orders").update({
      cpf: order.cpf || pixData.transactionId || "pix",
    }).eq("id", orderId);

    return new Response(JSON.stringify({
      success: true,
      transactionId: pixData.transactionId,
      qrCode: pixData.qrCode,
      qrCodeBase64: pixData.qrCodeBase64,
      copyPaste: pixData.copyPaste || pixData.pixCode || pixData.qrCodeText,
      expiresAt: pixData.expiresAt,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("pix-create error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
