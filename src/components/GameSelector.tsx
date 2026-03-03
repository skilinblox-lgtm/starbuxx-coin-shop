import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Gamepad2 } from "lucide-react";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClash from "@/assets/icon-clash-royale.png";
import iconBrawl from "@/assets/icon-brawl-stars.png";

const gameIcons: Record<string, string> = {
  roblox: iconRoblox,
  "clash-royale": iconClash,
  "brawl-stars": iconBrawl,
};

const GameSelector = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products").select("*").eq("active", true).order("name");
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <section id="jogos" className="bg-muted/50 py-12 sm:py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="font-heading text-2xl font-bold sm:text-3xl md:text-4xl">
            Nossos <span className="text-gradient-gold">Produtos</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            Escolha o produto e veja todos os detalhes
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {products.map((product, i) => {
              const gameIcon = gameIcons[product.game_id];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="group block rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-lg sm:p-5"
                  >
                    <div className="flex h-24 items-center justify-center sm:h-32">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                          className="max-h-full w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-105" />
                      ) : (
                        <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5">
                        {gameIcon && <img src={gameIcon} alt={product.game_id} className="h-4 w-4 object-contain" />}
                        <p className="truncate font-heading text-sm font-bold sm:text-base">{product.name}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {product.currency} • {product.game_id.replace(/-/g, " ")}
                      </p>
                      <p className="mt-2 font-heading text-base font-bold text-gradient-gold sm:text-lg">
                        R$ {Number(product.price_per_unit).toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground"> /un</span>
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {products.length === 0 && !loading && (
          <p className="mt-12 text-center text-sm text-muted-foreground">Nenhum produto disponível no momento.</p>
        )}
      </div>
    </section>
  );
};

export default GameSelector;
