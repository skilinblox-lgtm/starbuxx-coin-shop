import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingDown, TrendingUp, Minus, BarChart3, ShoppingCart, Clock, Flame, Zap, ArrowRight, X, AlertTriangle, Star, Brain } from "lucide-react";
import RarityBadge, { RARITY_CONFIG, SpecialFlagBadge } from "@/components/RarityBadge";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import BrainrotFilters, { BrainrotFilterState, defaultFilters } from "@/components/BrainrotFilters";
import BrainrotDeliveryInfo from "@/components/BrainrotDeliveryInfo";
import BrainrotReviews from "@/components/BrainrotReviews";

// Price thresholds for chart behavior
const EXPENSIVE_THRESHOLD = 50; // above this = big drop
const CHEAP_THRESHOLD = 15; // below this = stable/slight rise

type ChartBehavior = "big_drop" | "small_drop" | "stable" | "slight_rise";

const getChartBehavior = (price: number, postId: string): ChartBehavior => {
  // Use postId hash for deterministic randomness
  const hash = postId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (hash % 100) / 100;

  if (price >= EXPENSIVE_THRESHOLD) {
    return rand > 0.2 ? "big_drop" : "small_drop";
  } else if (price <= CHEAP_THRESHOLD) {
    if (rand > 0.6) return "slight_rise";
    if (rand > 0.3) return "stable";
    return "small_drop";
  } else {
    if (rand > 0.5) return "small_drop";
    if (rand > 0.25) return "stable";
    return "slight_rise";
  }
};

const generateFakeChart = (currentPrice: number, postId: string) => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Hoje"];
  const behavior = getChartBehavior(currentPrice, postId);

  const patterns: Record<ChartBehavior, number[]> = {
    big_drop: [0.85, 0.92, 1.0, 0.97, 0.88, 0.78, 0.65],
    small_drop: [0.92, 0.95, 0.98, 1.0, 0.97, 0.93, 0.90],
    stable: [0.97, 1.0, 0.98, 0.99, 1.01, 0.99, 1.0],
    slight_rise: [0.90, 0.88, 0.92, 0.94, 0.96, 0.98, 1.0],
  };

  const pattern = patterns[behavior];
  const baseMultiplier = behavior === "big_drop" ? 1.3 + (currentPrice % 7) * 0.05
    : behavior === "small_drop" ? 1.08 + (currentPrice % 5) * 0.02
    : 1.0;
  const peak = currentPrice * baseMultiplier;

  return {
    data: days.map((day, i) => ({
      day,
      price: i === 6 ? currentPrice : Math.round((peak * pattern[i]) * 100) / 100,
    })),
    behavior,
  };
};

const Brainrot = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BrainrotFilterState>(defaultFilters);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: brainrots } = await supabase
        .from("brainrot_posts").select("*").order("created_at", { ascending: false });
      setPosts(brainrots || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    if (filters.rarities.length > 0) {
      result = result.filter(p => {
        const postTags: string[] = p.tags || [];
        const postRarity = p.rarity || "common";
        return filters.rarities.some(r => r === postRarity || postTags.includes(r));
      });
    }
    if (filters.minPrice) result = result.filter(p => Number(p.current_price) >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter(p => Number(p.current_price) <= Number(filters.maxPrice));

    if (filters.sortPrice === "desc") result.sort((a, b) => Number(b.current_price) - Number(a.current_price));
    else if (filters.sortPrice === "asc") result.sort((a, b) => Number(a.current_price) - Number(b.current_price));

    return result;
  }, [posts, filters]);

  const handleBuy = (post: any) => {
    navigate("/checkout", {
      state: {
        gameId: "brainrot", gameName: "Brainrot", currency: post.title,
        quantity: 1, pricePerUnit: Number(post.current_price),
        totalPrice: Number(post.current_price), productId: post.id, imageUrl: post.image_url,
      },
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 pb-12 pt-20 sm:pt-24">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(260,80%,50%)] to-[hsl(300,80%,45%)] shadow-[0_0_30px_hsl(260,80%,50%,0.3)]">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
              Mercado <span className="text-gradient-purple">Brainrot</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Acompanhe as tendências e cotações do universo brainrot
            </p>
          </motion.div>

          <BrainrotFilters filters={filters} onFilterChange={setFilters} />

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(260,80%,60%)] border-t-transparent" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="mt-16 text-center text-sm text-muted-foreground">
              {posts.length === 0 ? "Nenhum brainrot publicado ainda. Fique ligado!" : "Nenhum resultado encontrado com esses filtros."}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, i) => (
                <BrainrotCard key={post.id} post={post} index={i} onClick={() => setSelectedPost(post)} />
              ))}
            </div>
          )}

          <BrainrotReviews />
          <BrainrotDeliveryInfo />
        </div>

        <AnimatePresence>
          {selectedPost && (
            <BrainrotModal post={selectedPost} onClose={() => setSelectedPost(null)} onBuy={handleBuy} />
          )}
        </AnimatePresence>

        <Footer />
        <DiscordFloat />
      </div>
    </PageTransition>
  );
};

// ── Card Component ──
const BrainrotCard = ({ post, index, onClick }: { post: any; index: number; onClick: () => void }) => {
  const { behavior } = useMemo(() => generateFakeChart(Number(post.current_price), post.id), [post.id, post.current_price]);
  const postTags: string[] = post.tags || [];

  const isDropping = behavior === "big_drop" || behavior === "small_drop";
  const fakeDiscount = useMemo(() => {
    if (behavior === "big_drop") return Math.round(20 + Math.random() * 30);
    if (behavior === "small_drop") return Math.round(5 + Math.random() * 12);
    return 0;
  }, [behavior]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border text-left transition-all hover:shadow-[0_0_24px_hsl(260,80%,50%,0.15)] ${
        post.featured
          ? "border-primary/60 bg-card ring-1 ring-primary/20"
          : "border-border bg-card hover:border-[hsl(260,60%,40%)]"
      }`}
    >
      {post.featured && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          <Star className="h-3 w-3" /> Destaque
        </div>
      )}

      {isDropping && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
          <TrendingDown className="h-3 w-3" /> -{fakeDiscount}%
        </div>
      )}
      {behavior === "slight_rise" && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[hsl(var(--success))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--success-foreground))]">
          <TrendingUp className="h-3 w-3" /> Subindo
        </div>
      )}
      {behavior === "stable" && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
          <Minus className="h-3 w-3" /> Estável
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><Brain className="h-12 w-12 text-muted-foreground" /></div>
        )}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          <RarityBadge rarity={post.rarity || "common"} />
          {postTags.filter(t => t !== post.rarity).map(tag => (
            <RarityBadge key={tag} rarity={tag} />
          ))}
        </div>
        {post.stock > 0 && (
          <div className="absolute left-2 top-2 rounded-full bg-[hsl(var(--success))]/90 px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--success-foreground))]">
            {post.stock} em estoque
          </div>
        )}
        {post.stock === 0 && (
          <div className="absolute left-2 top-2 rounded-full bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
            Esgotado
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 flex-wrap">
          <p className="truncate font-heading text-sm font-bold sm:text-base">{post.title}</p>
          {(post.special_flags || []).map((flag: string) => (
            <SpecialFlagBadge key={flag} flag={flag} />
          ))}
        </div>
        {post.description && (
          <p className="mt-1 line-clamp-2 rounded-lg bg-[hsl(145,63%,42%)]/15 px-2.5 py-1.5 text-[12px] font-bold text-[hsl(145,70%,38%)] shadow-[inset_0_0_8px_hsl(145,63%,42%,0.1)]">{post.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-price">R$ {Number(post.current_price).toFixed(2)}</span>
            {isDropping && (
              <span className="ml-1.5 text-xs text-muted-foreground line-through">
                R$ {(Number(post.current_price) * (1 + fakeDiscount / 100)).toFixed(2)}
              </span>
            )}
          </div>
          {isDropping && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-destructive">
              <TrendingDown className="h-3 w-3" /> Caiu!
            </div>
          )}
          {behavior === "slight_rise" && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--success))]">
              <TrendingUp className="h-3 w-3" /> Subindo
            </div>
          )}
        </div>
        {isDropping && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Preço pode subir a qualquer momento</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

// ── Detail Modal ──
const BrainrotModal = ({ post, onClose, onBuy }: { post: any; onClose: () => void; onBuy: (p: any) => void }) => {
  const { data: chartData, behavior } = useMemo(() => generateFakeChart(Number(post.current_price), post.id), [post.id, post.current_price]);
  const peakPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const isDropping = behavior === "big_drop" || behavior === "small_drop";
  const fakeDiscount = isDropping ? Math.round(((peakPrice - Number(post.current_price)) / peakPrice) * 100) : 0;
  const fakeBuyers = useMemo(() => Math.round(12 + Math.random() * 38), []);
  const postTags: string[] = post.tags || [];

  const chartColor = isDropping ? "hsl(0, 70%, 55%)" : behavior === "slight_rise" ? "hsl(145, 63%, 42%)" : "hsl(210, 80%, 55%)";
  const gradientId = `gradient-${post.id.slice(0, 8)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
      >
        <div className="relative h-56 overflow-hidden bg-muted sm:h-64">
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} className="h-full w-full object-contain p-3" />
          ) : (
            <div className="flex h-full w-full items-center justify-center"><Brain className="h-16 w-16 text-muted-foreground" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 backdrop-blur-sm hover:bg-black/60">
            <X className="h-4 w-4 text-white" />
          </button>
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1">
            <RarityBadge rarity={post.rarity || "common"} size="md" />
            {postTags.filter(t => t !== post.rarity).map(tag => (
              <RarityBadge key={tag} rarity={tag} size="md" />
            ))}
          </div>
          {isDropping && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
              <TrendingDown className="h-3.5 w-3.5" /> -{fakeDiscount}% OFF
            </div>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
          <h2 className="font-heading text-2xl font-bold">{post.title}</h2>
          {post.description && (
            <p className="mt-2 rounded-xl border border-[hsl(145,63%,42%)]/30 bg-[hsl(145,63%,42%)]/10 px-3 py-2.5 text-base font-bold text-[hsl(145,70%,38%)] shadow-[0_0_12px_hsl(145,63%,42%,0.15)]">{post.description}</p>
          )}

          <div className="mt-3 flex items-end gap-3">
            <span className="text-3xl font-bold text-price">R$ {Number(post.current_price).toFixed(2)}</span>
            {isDropping && <span className="mb-1 text-sm text-muted-foreground line-through">R$ {peakPrice.toFixed(2)}</span>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {isDropping ? (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2">
                <Flame className="h-4 w-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">Preço mais baixo!</span>
              </div>
            ) : behavior === "slight_rise" ? (
              <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--success))]/10 px-3 py-2">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />
                <span className="text-xs font-bold text-[hsl(var(--success))]">Valorizando!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--info))]/10 px-3 py-2">
                <Minus className="h-4 w-4 text-[hsl(var(--info))]" />
                <span className="text-xs font-bold text-[hsl(var(--info))]">Preço estável</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary">{fakeBuyers} compraram hoje</span>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-5 rounded-2xl border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Histórico de Preços (7 dias)</span>
              <span className={`flex items-center gap-1 text-[10px] font-bold ${
                isDropping ? "text-destructive" : behavior === "slight_rise" ? "text-[hsl(var(--success))]" : "text-[hsl(var(--info))]"
              }`}>
                {isDropping ? <><TrendingDown className="h-3 w-3" /> Em queda</> :
                 behavior === "slight_rise" ? <><TrendingUp className="h-3 w-3" /> Subindo</> :
                 <><Minus className="h-3 w-3" /> Estável</>}
              </span>
            </div>
            <div className="h-36 sm:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Preço"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2.5}
                    fill={`url(#${gradientId})`}
                    dot={{ fill: chartColor, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: chartColor }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {isDropping && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p className="text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">Atenção:</span> O preço pode voltar a subir a qualquer momento. Aproveite enquanto está em promoção!
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBuy(post)}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[hsl(260,80%,55%)] to-[hsl(300,80%,50%)] py-4 text-base font-bold text-white shadow-[0_4px_20px_hsl(260,80%,50%,0.3)] transition-shadow hover:shadow-[0_6px_30px_hsl(260,80%,50%,0.4)]"
          >
            <ShoppingCart className="h-5 w-5" />
            Comprar por R$ {Number(post.current_price).toFixed(2)}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Brainrot;
