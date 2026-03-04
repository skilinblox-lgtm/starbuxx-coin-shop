import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import { useRobuxPricing } from "@/hooks/useRobuxPricing";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClash from "@/assets/icon-clash-royale.png";
import iconBrawl from "@/assets/icon-brawl-stars.png";

const GAME_CONFIG: Record<string, { name: string; icon: string; categories: string[] }> = {
  roblox: {
    name: "Roblox",
    icon: iconRoblox,
    categories: ["Gamepass Blox Fruits", "Frutas Blox Fruits", "Robux"],
  },
  "clash-royale": {
    name: "Clash Royale",
    icon: iconClash,
    categories: ["Passe Royale", "Evolução", "Gemas", "Heroicos", "Ouro"],
  },
  "brawl-stars": {
    name: "Brawl Stars",
    icon: iconBrawl,
    categories: [],
  },
};

const GameCatalog = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { ratePer1000, loading: pricingLoading } = useRobuxPricing();

  const config = GAME_CONFIG[gameId || ""] || { name: gameId, icon: "", categories: [] };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("game_id", gameId || "")
        .eq("active", true)
        .order("display_order", { ascending: true });
      // Show featured products first, then by display_order
      const sorted = (data || []).sort((a: any, b: any) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      });
      setProducts(sorted);
      setLoading(false);
    };
    fetchProducts();
  }, [gameId]);

  const filteredProducts = activeCategory
    ? products.filter((p) => p.name.toLowerCase().includes(activeCategory.toLowerCase()))
    : products;

  const isRoblox = gameId === "roblox";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 pb-12 pt-20 sm:pt-24">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span>/</span>
            <span className="text-foreground">{config.name}</span>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {config.icon && <img src={config.icon} alt={config.name} className="h-12 w-12 object-contain" />}
            <div>
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">{config.name}</h1>
              <p className="text-sm text-muted-foreground">{products.length} produtos disponíveis</p>
            </div>
          </div>

          {config.categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                  activeCategory === null
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                Todos
              </button>
              {config.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                    activeCategory === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading || pricingLoading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-16 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, i) => {
                const displayPrice = isRoblox ? ratePer1000 / 1000 : Number(product.price_per_unit);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-lg sm:p-6"
                    >
                      <div className="flex h-32 items-center justify-center sm:h-40">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="max-h-full w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                        )}
                      </div>
                      <h3 className="mt-4 font-heading text-sm font-bold sm:text-base">{product.name}</h3>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-gradient-gold">
                          R$ {displayPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {product.currency}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-all group-hover:brightness-110 sm:text-sm">
                        Comprar Agora
                      </div>
                    </Link>
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

export default GameCatalog;
