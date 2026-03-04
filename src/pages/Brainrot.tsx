import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingDown, BarChart3, ShoppingCart, Clock, Flame, Zap, ArrowRight, X, AlertTriangle } from "lucide-react";
import RarityBadge from "@/components/RarityBadge";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";

// Generate fake chart data that always shows a recent price drop
const generateFakeChart = (currentPrice: number) => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Hoje"];
  const peakMultiplier = 1.3 + Math.random() * 0.4; // 30-70% higher than current
  const peak = currentPrice * peakMultiplier;

  // Create a pattern: starts moderate, peaks mid-week, drops to current
  const pattern = [0.85, 0.92, 1.0, 0.97, 0.88, 0.78, 0.65]; // relative to peak
  return days.map((day, i) => ({
    day,
    price: Math.round((peak * pattern[i]) * 100) / 100,
    // Make "Hoje" exactly the current price
    ...(i === 6 ? { price: currentPrice } : {}),
  }));
};

const Brainrot = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const handleBuy = (post: any) => {
    navigate("/checkout", {
      state: {
        gameId: "brainrot",
        gameName: "Brainrot",
        currency: post.title,
        quantity: 1,
        pricePerUnit: Number(post.current_price),
        totalPrice: Number(post.current_price),
        productId: post.id,
        imageUrl: post.image_url,
      },
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 pb-12 pt-20 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
              Mercado <span className="text-gradient-gold">Brainrot</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Acompanhe as tendências e cotações do universo brainrot
            </p>
          </motion.div>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-16 text-center text-sm text-muted-foreground">
              Nenhum brainrot publicado ainda. Fique ligado!
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <BrainrotCard key={post.id} post={post} index={i} onClick={() => setSelectedPost(post)} />
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
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
  const fakeDiscount = useMemo(() => Math.round(15 + Math.random() * 35), []);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition-all hover:border-primary/50 hover:shadow-[0_0_20px_hsl(45,100%,50%,0.1)]"
    >
      {/* Discount ribbon */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
        <TrendingDown className="h-3 w-3" /> -{fakeDiscount}%
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background text-5xl">🧠</div>
        )}
        <div className="absolute bottom-2 left-2">
          <RarityBadge rarity={post.rarity || "common"} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="truncate font-heading text-sm font-bold sm:text-base">{post.title}</p>
        {post.description && (
          <p className="mt-1 line-clamp-2 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-foreground">{post.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gradient-gold">R$ {Number(post.current_price).toFixed(2)}</span>
            <span className="ml-1.5 text-xs text-muted-foreground line-through">
              R$ {(Number(post.current_price) * (1 + fakeDiscount / 100)).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-destructive">
            <TrendingDown className="h-3 w-3" />
            Caiu!
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Preço pode subir a qualquer momento</span>
        </div>
      </div>
    </motion.button>
  );
};

// ── Detail Modal ──
const BrainrotModal = ({ post, onClose, onBuy }: { post: any; onClose: () => void; onBuy: (p: any) => void }) => {
  const chartData = useMemo(() => generateFakeChart(Number(post.current_price)), [post.id, post.current_price]);
  const peakPrice = Math.max(...chartData.map(d => d.price));
  const fakeDiscount = Math.round(((peakPrice - Number(post.current_price)) / peakPrice) * 100);
  const fakeBuyers = useMemo(() => Math.round(12 + Math.random() * 38), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
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
        {/* Header image */}
        <div className="relative h-48 overflow-hidden bg-muted sm:h-56">
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background text-7xl">🧠</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-background/60 p-1.5 backdrop-blur-sm hover:bg-background/80">
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4">
            <RarityBadge rarity={post.rarity || "common"} size="md" />
          </div>
          <div className="absolute bottom-3 right-4 flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
            <TrendingDown className="h-3.5 w-3.5" /> -{fakeDiscount}% OFF
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
          {/* Title & Price */}
          <h2 className="font-heading text-2xl font-bold">{post.title}</h2>
          {post.description && (
            <p className="mt-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground">{post.description}</p>
          )}

          <div className="mt-3 flex items-end gap-3">
            <span className="text-3xl font-bold text-gradient-gold">R$ {Number(post.current_price).toFixed(2)}</span>
            <span className="mb-1 text-sm text-muted-foreground line-through">R$ {peakPrice.toFixed(2)}</span>
          </div>

          {/* Urgency indicators */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2">
              <Flame className="h-4 w-4 text-destructive" />
              <span className="text-xs font-bold text-destructive">Preço mais baixo!</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary">{fakeBuyers} compraram hoje</span>
            </div>
          </div>

          {/* Fake Chart */}
          <div className="mt-5 rounded-2xl border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Histórico de Preços (7 dias)</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-destructive">
                <TrendingDown className="h-3 w-3" /> Em queda
              </span>
            </div>
            <div className="h-36 sm:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0} />
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
                    stroke="hsl(0, 70%, 55%)"
                    strokeWidth={2.5}
                    fill="url(#priceGradient)"
                    dot={{ fill: "hsl(0, 70%, 55%)", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "hsl(0, 70%, 55%)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground">Atenção:</span> O preço pode voltar a subir a qualquer momento. Aproveite enquanto está em promoção!
            </p>
          </div>

          {/* Buy Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBuy(post)}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-[hsl(35,90%,50%)] py-4 text-base font-bold text-primary-foreground shadow-[0_4px_20px_hsl(45,100%,50%,0.3)] transition-shadow hover:shadow-[0_6px_30px_hsl(45,100%,50%,0.4)]"
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
