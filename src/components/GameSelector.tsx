import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Coins } from "lucide-react";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClash from "@/assets/icon-clash-royale.png";
import iconBrawl from "@/assets/icon-brawl-stars.png";

const GAMES = [
  { id: "roblox", name: "Roblox", icon: iconRoblox, currency: "Robux", desc: "O maior metaverso de jogos do mundo" },
  { id: "clash-royale", name: "Clash Royale", icon: iconClash, currency: "Gemas", desc: "Batalhas estratégicas em tempo real" },
  { id: "brawl-stars", name: "Brawl Stars", icon: iconBrawl, currency: "Gemas", desc: "Combates 3v3 frenéticos" },
];

const GameSelector = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      const { data } = await supabase
        .from("products").select("game_id, price_per_unit").eq("active", true);
      const mins: Record<string, number> = {};
      (data || []).forEach(p => {
        const price = Number(p.price_per_unit);
        if (!mins[p.game_id] || price < mins[p.game_id]) mins[p.game_id] = price;
      });
      setPrices(mins);
      setLoading(false);
    };
    fetchPrices();
  }, []);

  return (
    <section id="jogos" className="bg-card py-12 sm:py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <h2 className="font-heading text-2xl font-bold sm:text-3xl md:text-4xl">
            Escolha seu <span className="text-gradient-gold">Jogo</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Selecione o jogo e veja os produtos disponíveis
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3">
            {GAMES.map((game, i) => {
              const minPrice = prices[game.id];
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/game/${game.id}`}
                    className="group flex flex-col items-center rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-lg sm:p-8"
                  >
                    <img
                      src={game.icon}
                      alt={game.name}
                      className="h-16 w-16 object-contain transition-transform group-hover:scale-110 sm:h-20 sm:w-20"
                    />
                    <h3 className="mt-4 font-heading text-base font-bold sm:text-lg">{game.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{game.desc}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-gradient-gold">
                        {minPrice ? `A partir de R$ ${minPrice.toFixed(2)}` : "—"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 rounded-full bg-[hsl(var(--success))]/10 px-3 py-1.5 text-xs font-bold text-[hsl(var(--success))]">
                      Ver Produtos <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default GameSelector;
