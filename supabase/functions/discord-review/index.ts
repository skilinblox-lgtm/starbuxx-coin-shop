import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get("DISCORD_REVIEWS_WEBHOOK_URL");
    if (!webhookUrl) {
      throw new Error("DISCORD_REVIEWS_WEBHOOK_URL is not configured");
    }

    const { author_name, rating, comment, game_id, type } = await req.json();

    const stars = "⭐".repeat(rating) + "☆".repeat(5 - rating);
    const typeLabel = type === "brainrot" ? "🧠 Brainrot" : "🎮 Robux / Game";
    const color = rating >= 4 ? 0x22c55e : rating >= 3 ? 0xeab308 : 0xef4444;

    const embed = {
      embeds: [
        {
          title: "📝 Nova Avaliação Recebida!",
          color,
          fields: [
            { name: "👤 Cliente", value: author_name || "Anônimo", inline: true },
            { name: "📊 Nota", value: stars, inline: true },
            { name: "🏷️ Categoria", value: typeLabel, inline: true },
            { name: "🎮 Jogo/Item", value: game_id || "N/A", inline: true },
            { name: "💬 Comentário", value: comment || "Sem comentário" },
          ],
          footer: {
            text: "StarBuxx • Sistema de Avaliações",
          },
          timestamp: new Date().toISOString(),
        },
      ],
      username: "StarBuxx Reviews",
      avatar_url: "https://starbuxx-coin-shop.lovable.app/favicon.ico",
    };

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      throw new Error(`Discord webhook failed [${discordRes.status}]: ${errText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending Discord review:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
