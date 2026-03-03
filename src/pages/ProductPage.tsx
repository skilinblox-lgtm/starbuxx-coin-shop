import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ShieldCheck, ArrowLeft, Minus, Plus, ShoppingCart, Clock, Zap, CheckCircle, Truck, Award, Headphones, CreditCard, Gamepad2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClash from "@/assets/icon-clash-royale.png";
import iconBrawl from "@/assets/icon-brawl-stars.png";

const gameIcons: Record<string, string> = {
  roblox: iconRoblox,
  "clash-royale": iconClash,
  "brawl-stars": iconBrawl,
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: prod } = await supabase
        .from("products").select("*").eq("id", productId).eq("active", true).single();
      if (!prod) { navigate("/"); return; }
      setProduct(prod);

      const { data: related } = await supabase
        .from("products").select("*").eq("game_id", prod.game_id).eq("active", true).neq("id", prod.id).limit(4);
      setRelatedProducts(related || []);

      if ((related || []).length < 3) {
        const { data: otherGames } = await supabase
          .from("products").select("*").eq("active", true).neq("game_id", prod.game_id).limit(4);
        setRelatedProducts([...(related || []), ...(otherGames || [])].slice(0, 4));
      }

      const { data: revs } = await supabase
        .from("reviews").select("*").eq("game_id", prod.game_id).order("created_at", { ascending: false }).limit(6);
      setReviews(revs || []);
      setLoading(false);
    };
    fetchProduct();
  }, [productId, navigate]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Star className="h-8 w-8 animate-pulse fill-primary text-primary" />
    </div>
  );
  if (!product) return null;

  const totalPrice = (quantity * Number(product.price_per_unit)).toFixed(2);
  const gameLabel = product.game_id.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const gameIcon = gameIcons[product.game_id];

  const handleBuy = () => {
    navigate("/checkout", {
      state: {
        gameId: product.game_id, gameName: product.name, currency: product.currency,
        quantity, pricePerUnit: Number(product.price_per_unit),
        totalPrice: parseFloat(totalPrice), productId: product.id, imageUrl: product.image_url,
      },
    });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 pb-12 pt-20 sm:pt-24">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-12">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="max-h-72 w-auto object-contain drop-shadow-xl sm:max-h-96" />
              ) : (
                <div className="flex h-72 w-72 items-center justify-center rounded-2xl bg-muted">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-col">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Zap className="h-3 w-3" /> Entrega em até 20 minutos
              </div>

              <h1 className="mt-3 font-heading text-2xl font-bold sm:text-3xl lg:text-4xl">{product.name}</h1>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? "fill-primary text-primary" : "text-border"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{avgRating}</span>
                <span className="text-xs text-muted-foreground">({reviews.length} avaliações)</span>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
                <p className="text-xs text-muted-foreground">Preço por unidade</p>
                <p className="mt-1 font-heading text-lg font-bold text-gradient-gold sm:text-xl">
                  R$ {Number(product.price_per_unit).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ {product.currency}</span>
                </p>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Quantidade de {product.currency}</label>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 100))} className="rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-primary">
                    <Minus className="h-4 w-4" />
                  </button>
                  <input type="number" min={1} value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 rounded-xl border border-border bg-card px-4 py-2.5 text-center text-lg font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  <button onClick={() => setQuantity(q => q + 100)} className="rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[100, 500, 1000, 5000, 10000].map(amt => (
                    <button key={amt} onClick={() => setQuantity(amt)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        quantity === amt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}>{amt.toLocaleString("pt-BR")}</button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-heading text-2xl font-bold text-gradient-gold sm:text-3xl">R$ {totalPrice}</p>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleBuy}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:px-8 sm:py-3.5 sm:text-base">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" /> Comprar Agora
                </motion.button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { icon: ShieldCheck, label: "100% Seguro" },
                  { icon: Clock, label: "Entrega Rápida" },
                  { icon: Award, label: "Garantia Total" },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center shadow-[var(--shadow-card)]">
                    <b.icon className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-heading text-lg font-bold sm:text-xl">Detalhes do Produto</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>Adquira <strong className="text-foreground">{product.currency}</strong> para <strong className="text-foreground">{gameLabel}</strong> de forma rápida e segura através da StarBuxx.</p>
              <div className="flex items-start gap-2"><Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Entrega realizada em até 20 minutos após confirmação do pagamento.</span></div>
              <div className="flex items-start gap-2"><Headphones className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Suporte dedicado via Discord com mais de 10.000 membros.</span></div>
              <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Garantia de reembolso integral caso ocorra qualquer problema.</span></div>
              <div className="flex items-start gap-2"><CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Aceitamos Pix (instantâneo), Cartão de Crédito/Débito e Boleto.</span></div>
              <div className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Aviso:</strong> A Starbuxx é um revendedor terceirizado independente. As moedas são adquiridas de forma legítima dentro dos próprios jogos. Não possuímos vínculo oficial com a Roblox Corporation.
              </div>
            </div>
          </motion.div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
              <h2 className="font-heading text-lg font-bold sm:text-xl">
                Avaliações <span className="text-muted-foreground font-normal text-sm">({reviews.length})</span>
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map(r => {
                  const rGameIcon = gameIcons[r.game_id];
                  return (
                    <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {rGameIcon ? <img src={rGameIcon} alt={r.game_id} className="h-5 w-5 object-contain" /> : <Gamepad2 className="h-4 w-4 text-primary" />}
                          <span className="text-[10px] font-medium text-muted-foreground">{r.game_id.replace(/-/g, " ")}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-border"}`} />
                        ))}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed sm:text-sm">"{r.comment}"</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {r.author_name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{r.author_name}</p>
                          <p className="text-[10px] text-muted-foreground">Comprador verificado</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Related */}
          {relatedProducts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
              <h2 className="font-heading text-lg font-bold sm:text-xl">Produtos Relacionados</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {relatedProducts.map(rp => (
                  <Link key={rp.id} to={`/product/${rp.id}`}
                    className="group rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-lg">
                    <div className="flex h-24 items-center justify-center sm:h-32">
                      {rp.image_url ? (
                        <img src={rp.image_url} alt={rp.name} className="max-h-full w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-105" />
                      ) : (
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs font-bold sm:text-sm">{rp.name}</p>
                    <p className="text-xs text-muted-foreground">R$ {Number(rp.price_per_unit).toFixed(2)}/{rp.currency}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <Footer />
        <DiscordFloat />
      </div>
    </PageTransition>
  );
};

export default ProductPage;
