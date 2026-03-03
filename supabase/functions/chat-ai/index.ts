import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { orderId, message, chatHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get order details for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    const orderContext = order
      ? `Dados do pedido: Jogo: ${order.game_id}, Quantidade: ${order.quantity}, Total: R$${order.total_price}, Status: ${order.status}, Usuário no jogo: ${order.game_username}, Nome: ${order.full_name}`
      : "Pedido não encontrado.";

    const systemPrompt = `Você é o assistente virtual da Starbuxx, uma loja de moedas virtuais para games.
Sua função é ajudar clientes com dúvidas sobre seus pedidos e entregas.

${orderContext}

Regras:
- Seja educado, breve e direto
- Informe o status do pedido quando perguntado
- Para pedidos com status "pago", informe que a entrega será feita em até 48h
- Para pedidos "em_entrega", informe que estão processando e logo será concluído
- Para pedidos "entregue", confirme que foi entregue e pergunte se precisa de mais alguma coisa
- Se o cliente tiver um problema que você não consegue resolver, diga para aguardar que um atendente humano vai responder
- Nunca invente informações sobre prazos ou valores que não estejam nos dados do pedido
- Responda sempre em português brasileiro`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []).map((m: any) => ({
        role: m.sender_role === "customer" ? "user" : "assistant",
        content: m.message,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições, tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    // Save AI message to chat
    if (orderId) {
      // Use a special AI user id
      await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: "00000000-0000-0000-0000-000000000000",
        sender_role: "ai",
        message: aiMessage,
      });
    }

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
