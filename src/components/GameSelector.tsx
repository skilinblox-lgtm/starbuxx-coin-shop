import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Coins, ShoppingCart } from "lucide-react";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClash from "@/assets/icon-clash-royale.png";
import iconBrawl from "@/assets/icon-brawl-stars.png";

const GAMES = [
  { id: "roblox", name: "Roblox", icon: iconRoblox, currency: "Robux" },
  { id: "clash-royale", name: "Clash Royale", icon: iconClash, currency: "Gemas" },
  { id: "brawl-stars", name: "Brawl Stars", icon: iconBrawl, currency: "Gemas" },
];

const GameSelector = () => {
  const [activeGame, setActiveGame] = useState(GAMES[0].id);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("price_per_unit", { ascending: true });
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => p.game_id === activeGame);
  const activeGameData = GAMES.find((g) => g.id === activeGame)!;

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

        {/* Game Tabs */}
        <div className="mx-auto mt-8 flex max-w-xl justify-center gap-2 sm:mt-10 sm:gap-3">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all sm:px-6 sm:py-3 ${
                activeGame === game.id
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              <img src={game.icon} alt={game.name} className="h-6 w-6 object-contain" />
              <span className="hidden sm:inline">{game.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-12 text-center text-sm text-muted-foreground">
            Nenhum produto disponível para {activeGameData.name} no momento.
          </div>
        ) : (
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/product/${product.id}`}
                  className="group flex flex-col rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-lg sm:p-6"
                >
                  <div className="flex h-32 items-center justify-center sm:h-40">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-full w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                    )}
                  </div>
                  <h3 className="mt-4 font-heading text-sm font-bold sm:text-base">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-gradient-gold">
                      R$ {Number(product.price_per_unit).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {product.currency}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 self-start rounded-full bg-[hsl(var(--success))]/10 px-3 py-1.5 text-xs font-bold text-[hsl(var(--success))]">
                    Comprar <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GameSelector;
