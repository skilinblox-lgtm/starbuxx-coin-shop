import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ShieldCheck, ArrowLeft, Minus, Plus, ShoppingCart, Clock, Zap, CheckCircle, Truck, Award, Headphones, CreditCard, Gamepad2, Calendar, Users, MessageCircle, RefreshCw, Link as LinkIcon, Gift, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import { useRobuxPricing } from "@/hooks/useRobuxPricing";
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
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { ratePer1000, calculatePrice, loading: pricingLoading } = useRobuxPricing();

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

  if (loading || pricingLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Star className="h-8 w-8 animate-pulse fill-primary text-primary" />
    </div>
  );
  if (!product) return null;

  // Use universal pricing for Roblox products (Robux, Gamepass, Frutas)
  const isRobloxProduct = product.game_id === "roblox";
  const effectivePricePerUnit = isRobloxProduct
    ? (Number(product.price_per_unit) * ratePer1000 / 1000)
    : Number(product.price_per_unit);

  const totalPrice = (quantity * effectivePricePerUnit).toFixed(2);
  const gameLabel = product.game_id.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const gameIcon = gameIcons[product.game_id];

  const handleBuy = () => {
    navigate("/checkout", {
      state: {
        gameId: product.game_id, gameName: product.name, currency: product.currency,
        quantity, pricePerUnit: effectivePricePerUnit,
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
                <img src={product.image_url} alt={product.name} className="max-h-72 w-auto object-contain drop-shadow-xl sm:max-h-96" loading="lazy" />
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
                  R$ {effectivePricePerUnit.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ {product.currency}</span>
                </p>
                {isRobloxProduct && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Baseado no valor de R$ {ratePer1000.toFixed(2)} a cada 1.000 Robux
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Quantidade de {product.currency}</label>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-primary">
                    <Minus className="h-4 w-4" />
                  </button>
                  <input type="number" min={1} value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 rounded-xl border border-border bg-card px-4 py-2.5 text-center text-lg font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  <button onClick={() => setQuantity(q => q + 1)} className="rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 50, 100, 500, 1000, 5000].map(amt => (
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
                  <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-[hsl(140,60%,45%)]/30 bg-[hsl(140,60%,45%)]/5 p-3 text-center">
                    <b.icon className="h-5 w-5 text-[hsl(140,60%,45%)]" />
                    <span className="text-[10px] font-medium text-[hsl(140,60%,45%)] sm:text-xs">{b.label}</span>
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
              {product.currency?.toLowerCase() === "robux" ? (
                <>
                  <p>Adquira <strong className="text-foreground">Robux</strong> para <strong className="text-foreground">Roblox</strong> de forma rápida e segura pela StarBuxx.</p>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4 text-primary" /> Como funciona a entrega via Gamepass</p>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">1</span><span>Você cria uma Gamepass dentro do Roblox com o valor correspondente aos Robux que deseja comprar.</span></div>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">2</span><span>Na hora de finalizar o pagamento, você insere o link da sua Gamepass no campo indicado.</span></div>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">3</span><span>Assim que o pagamento for confirmado, o link da sua Gamepass é enviado automaticamente para o nosso sistema.</span></div>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">4</span><span>Em até <strong className="text-foreground">24 horas</strong> (máximo 48h), nossos vendedores realizam a compra da sua Gamepass, entregando seus Robux.</span></div>
                  </div>
                  <div className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Fique atento ao prazo de processamento do Roblox (2 a 7 dias úteis para os Robux ficarem disponíveis na sua conta). Acompanhe tudo pela aba <strong className="text-foreground">Meus Pedidos</strong>.</span></div>
                  <div className="flex items-start gap-2"><RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Caso a entrega não seja realizada em até 48 horas, você pode solicitar o reembolso automático diretamente na página do seu pedido.</span></div>
                </>
              ) : product.name?.toLowerCase().includes("gamepass") || product.name?.toLowerCase().includes("fruta") || product.name?.toLowerCase().includes("fruit") ? (
                <>
                  <p>Adquira <strong className="text-foreground">{product.name}</strong> para <strong className="text-foreground">{gameLabel}</strong> de forma rápida e segura pela StarBuxx.</p>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2"><Gift className="h-4 w-4 text-primary" /> Como funciona a entrega</p>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">1</span><span>Após a confirmação do pagamento, um de nossos vendedores irá adicionar você como amigo dentro do jogo.</span></div>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">2</span><span>O vendedor entra no seu servidor e envia o item como presente ou realiza o trade, conforme sua preferência.</span></div>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">3</span><span>Um chat será aberto automaticamente para você se conectar com nossos vendedores e acompanhar a entrega em tempo real.</span></div>
                  </div>
                  <div className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Prazo de entrega: até <strong className="text-foreground">24 horas</strong> (máximo 48h) após a confirmação do pagamento.</span></div>
                  <div className="flex items-start gap-2"><RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Se a entrega não for concluída em 48h, você pode solicitar o reembolso automático clicando no botão disponível na página do pedido.</span></div>
                  <div className="flex items-start gap-2"><MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Após a compra, utilize o chat integrado para se comunicar diretamente com o vendedor responsável pela sua entrega.</span></div>
                </>
              ) : (
                <>
                  <p>Adquira <strong className="text-foreground">{product.currency}</strong> para <strong className="text-foreground">{gameLabel}</strong> de forma rápida e segura pela StarBuxx.</p>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Como funciona a entrega</p>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">1</span><span>Após o pagamento ser confirmado, nossos vendedores irão adicionar você como amigo no jogo.</span></div>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">2</span><span>O vendedor entra no seu servidor e realiza a entrega por presente ou trade.</span></div>
                    <div className="flex items-start gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">3</span><span>Um chat se abre automaticamente para você acompanhar tudo com o vendedor.</span></div>
                  </div>
                  <div className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Entrega em até <strong className="text-foreground">24 horas</strong> (máximo 48h) após confirmação.</span></div>
                  <div className="flex items-start gap-2"><RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Caso a entrega não seja feita em 48h, solicite reembolso automático na página do pedido.</span></div>
                </>
              )}
              <div className="flex items-start gap-2"><Headphones className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Suporte dedicado via Discord com mais de 10.000 membros.</span></div>
              <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Garantia de reembolso integral caso ocorra qualquer problema.</span></div>
              <div className="flex items-start gap-2"><CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /><span>Aceitamos Pix (instantâneo), Cartão de Crédito/Débito e Boleto.</span></div>
              <div className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Aviso:</strong> A StarBuxx é um revendedor terceirizado independente. Os itens são adquiridos de forma legítima dentro dos próprios jogos. Não possuímos vínculo oficial com os desenvolvedores dos jogos.
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
                          <span className="text-sm font-bold">{r.author_name}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-border"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{r.comment}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </p>
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
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {relatedProducts.map(rp => {
                  const rpIsRoblox = rp.game_id === "roblox";
                  const rpPrice = rpIsRoblox ? (Number(rp.price_per_unit) * ratePer1000 / 1000) : Number(rp.price_per_unit);
                  return (
                    <Link key={rp.id} to={`/product/${rp.id}`}
                      className="group rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-lg">
                      <div className="flex h-24 items-center justify-center sm:h-32">
                        {rp.image_url ? (
                          <img src={rp.image_url} alt={rp.name} className="max-h-full w-auto object-contain transition-transform group-hover:scale-105" loading="lazy" />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <h4 className="mt-2 text-xs font-bold line-clamp-2 sm:text-sm">{rp.name}</h4>
                      <p className="mt-1 text-xs font-bold text-gradient-gold">R$ {rpPrice.toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">/{rp.currency}</span></p>
                    </Link>
                  );
                })}
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
