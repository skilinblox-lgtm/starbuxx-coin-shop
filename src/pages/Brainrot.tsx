import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ShoppingCart, Star, Zap, ShieldCheck, Gamepad2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import bannerBrainrot from "@/assets/banner-brainrot.png";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClash from "@/assets/icon-clash-royale.png";
import iconBrawl from "@/assets/icon-brawl-stars.png";

const GAMES = [
  {
    id: "roblox",
    name: "Roblox",
    icon: iconRoblox,
    description: "O maior metaverso de jogos do mundo. Compre Robux e itens exclusivos para personalizar seu avatar e desbloquear experiências incríveis.",
    currency: "Robux",
  },
  {
    id: "clash-royale",
    name: "Clash Royale",
    icon: iconClash,
    description: "Batalhas estratégicas em tempo real. Adquira gemas e recursos para evoluir suas cartas e dominar a arena.",
    currency: "Gemas",
  },
  {
    id: "brawl-stars",
    name: "Brawl Stars",
    icon: iconBrawl,
    description: "Combates 3v3 rápidos e frenéticos. Consiga gemas para desbloquear brawlers lendários e skins raras.",
    currency: "Gemas",
  },
];

const Brainrot = () => {
  const [products, setProducts] = useState<Record<string, any[]>>({});
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("price_per_unit", { ascending: true });

      const grouped: Record<string, any[]> = {};
      (data || []).forEach((p) => {
        if (!grouped[p.game_id]) grouped[p.game_id] = [];
        grouped[p.game_id].push(p);
      });
      setProducts(grouped);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const getAvgPrice = (gameId: string) => {
    const prods = products[gameId];
    if (!prods || prods.length === 0) return null;
    const avg = prods.reduce((s, p) => s + Number(p.price_per_unit), 0) / prods.length;
    return avg.toFixed(2);
  };

  const toggleGame = (gameId: string) => {
    setExpandedGame((prev) => (prev === gameId ? null : gameId));
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Banner */}
        <div className="relative mt-14 overflow-hidden sm:mt-16">
          <img
            src={bannerBrainrot}
            alt="Brainrot Marketplace"
            className="h-40 w-full object-cover sm:h-56 lg:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,20%,7%)]/80 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container px-4">
              <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Encontre suas <span className="text-gradient-gold">Moedas</span>
              </h1>
              <p className="mt-1 max-w-md text-xs text-white/70 sm:text-sm">
                Marketplace de moedas virtuais dos jogos mais populares. Escolha o jogo e veja os produtos disponíveis.
              </p>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-b border-border bg-card">
          <div className="container flex items-center justify-center gap-6 px-4 py-3 sm:gap-10">
            {[
              { icon: Zap, text: "Entrega Rápida" },
              { icon: ShieldCheck, text: "100% Seguro" },
              { icon: Star, text: "10mil+ no Discord" },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                <t.icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                <span className="font-medium">{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Games list */}
        <div className="container px-4 py-8 sm:py-12">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {GAMES.map((game, i) => {
                const isExpanded = expandedGame === game.id;
                const gameProducts = products[game.id] || [];
                const avgPrice = getAvgPrice(game.id);

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
                  >
                    {/* Game header - clickable */}
                    <button
                      onClick={() => toggleGame(game.id)}
                      className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 sm:p-5"
                    >
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="h-14 w-14 rounded-xl object-contain sm:h-16 sm:w-16"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="font-heading text-base font-bold sm:text-lg">{game.name}</h2>
                          {gameProducts.length > 0 && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {gameProducts.length} {gameProducts.length === 1 ? "produto" : "produtos"}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                          {game.description}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3">
                          {avgPrice && (
                            <span className="text-xs font-bold text-gradient-gold sm:text-sm">
                              A partir de R$ {avgPrice}/{game.currency}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 rounded-lg border border-border p-1.5">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expandable products */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border px-4 py-4 sm:px-5">
                            {gameProducts.length === 0 ? (
                              <p className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum produto disponível no momento. Fique ligado!
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {gameProducts.map((product) => (
                                  <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/40 hover:shadow-md sm:p-4"
                                  >
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted sm:h-14 sm:w-14">
                                      {product.image_url ? (
                                        <img
                                          src={product.image_url}
                                          alt={product.name}
                                          className="h-10 w-10 object-contain transition-transform group-hover:scale-110 sm:h-12 sm:w-12"
                                        />
                                      ) : (
                                        <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-bold">{product.name}</p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {product.currency}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-sm font-bold text-gradient-gold">
                                        R$ {Number(product.price_per_unit).toFixed(2)}
                                      </span>
                                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                        <ShoppingCart className="h-3 w-3" /> Comprar
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
        <DiscordFloat />
      </div>
    </PageTransition>
  );
};

export default Brainrot;
