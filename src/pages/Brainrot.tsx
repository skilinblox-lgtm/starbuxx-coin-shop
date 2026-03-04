import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import RarityBadge from "@/components/RarityBadge";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";

// Rarity helpers removed - using RarityBadge component instead

const Brainrot = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [priceHistories, setPriceHistories] = useState<Record<string, any[]>>({});
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: brainrots } = await supabase
        .from("brainrot_posts").select("*").order("created_at", { ascending: false });
      setPosts(brainrots || []);

      if (brainrots && brainrots.length > 0) {
        const { data: histories } = await supabase
          .from("brainrot_price_history").select("*").order("recorded_at", { ascending: true });

        const grouped: Record<string, any[]> = {};
        (histories || []).forEach(h => {
          if (!grouped[h.brainrot_id]) grouped[h.brainrot_id] = [];
          grouped[h.brainrot_id].push({
            date: new Date(h.recorded_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            price: Number(h.price),
          });
        });
        setPriceHistories(grouped);
        if (brainrots.length > 0) setSelectedPost(brainrots[0]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getChange = (post: any) => {
    const history = priceHistories[post.id];
    if (!history || history.length < 2) return 0;
    const prev = history[history.length - 2].price;
    const curr = history[history.length - 1].price;
    return prev === 0 ? 0 : ((curr - prev) / prev) * 100;
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
            <>
              {selectedPost && (
                <motion.div key={selectedPost.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mt-8 max-w-3xl rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
                  <div className="flex items-start gap-4">
                    {selectedPost.image_url && (
                      <img src={selectedPost.image_url} alt={selectedPost.title} className="h-16 w-16 rounded-2xl object-cover sm:h-20 sm:w-20" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-xl font-bold sm:text-2xl">{selectedPost.title}</h2>
                        <RarityBadge rarity={selectedPost.rarity || 'common'} size="md" />
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="font-heading text-lg font-bold text-gradient-gold sm:text-xl">
                          R$ {Number(selectedPost.current_price).toFixed(2)}
                        </span>
                        {(() => {
                          const change = getChange(selectedPost);
                          return (
                            <span className={`flex items-center gap-0.5 text-xs font-bold ${
                              change > 0 ? "text-[hsl(var(--success))]" : change < 0 ? "text-destructive" : "text-muted-foreground"
                            }`}>
                              {change > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : change < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                              {Math.abs(change).toFixed(1)}%
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {selectedPost.description && (
                    <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{selectedPost.description}</p>
                  )}

                  <div className="mt-5 h-48 sm:h-64">
                    {(priceHistories[selectedPost.id] || []).length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceHistories[selectedPost.id]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{
                            background: "hsl(var(--card))", border: "1px solid hsl(var(--border))",
                            borderRadius: 12, fontSize: 12,
                          }} />
                          <Line type="monotone" dataKey="price" stroke="hsl(45, 100%, 51%)" strokeWidth={2.5}
                            dot={{ fill: "hsl(45, 100%, 51%)", r: 3 }} name="Preço (R$)" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Dados insuficientes para gerar gráfico
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => {
                  const change = getChange(post);
                  return (
                    <motion.button key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }} onClick={() => setSelectedPost(post)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left shadow-[var(--shadow-card)] transition-all ${
                        selectedPost?.id === post.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                      }`}>
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                          <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold">{post.title}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${getBrainrotRarityStyle(post.rarity || 'common')}`}>
                            {getBrainrotRarityLabel(post.rarity || 'common')}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-sm font-bold text-gradient-gold">R$ {Number(post.current_price).toFixed(2)}</span>
                          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${
                            change > 0 ? "text-[hsl(var(--success))]" : change < 0 ? "text-destructive" : "text-muted-foreground"
                          }`}>
                            {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {Math.abs(change).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <Footer />
        <DiscordFloat />
      </div>
    </PageTransition>
  );
};

export default Brainrot;
