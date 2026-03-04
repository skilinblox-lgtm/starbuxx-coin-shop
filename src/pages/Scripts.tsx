import { useState, useEffect } from "react";
import { Code2, Calendar, Tag, Search, Star, Shield, CheckCircle, RefreshCw, Gamepad2, Key, Unlock, Zap, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import iconBrainrot from "@/assets/icon-brainrot-game.png";
import iconBloxFruits from "@/assets/icon-bloxfruits-game.png";

const GAME_ICONS: Record<string, string> = {
  "Steal a Brainrot": iconBrainrot,
  "Blox Fruits": iconBloxFruits,
};

const Scripts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const categories = [
    { id: "all", label: "Todos" },
    { id: "executor", label: "Executors" },
    { id: "script", label: "Scripts" },
    { id: "tutorial", label: "Tutoriais" },
  ];

  const gameFilters = [
    { id: "all", label: "Todos os Jogos", icon: null },
    { id: "Steal a Brainrot", label: "Brainrot", icon: iconBrainrot },
    { id: "Blox Fruits", label: "Blox Fruits", icon: iconBloxFruits },
  ];

  const [selectedGame, setSelectedGame] = useState<string>("all");

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchGame = selectedGame === "all" || p.game_compatible === selectedGame;
    return matchSearch && matchCat && matchGame;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 pb-12 pt-20 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-gold)]">
              <Code2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
              Executor & <span className="text-gradient-gold">Scripts</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Scripts e executors atualizados para Roblox
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 px-4 py-1.5">
              <Wifi className="h-3.5 w-3.5 text-[hsl(var(--success))] animate-pulse" />
              <span className="text-xs font-bold text-[hsl(var(--success))]">API Atualizada</span>
              <span className="text-[10px] text-muted-foreground">• Conteúdo de primeira mão</span>
            </div>
          </motion.div>

          {/* Trust / Tested Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 rounded-2xl border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-[hsl(var(--success))]" />
              <h3 className="font-heading text-sm font-bold sm:text-base">Conteúdo verificado pela nossa equipe</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-background/50 p-3">
                <RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--success))]" />
                <div>
                  <p className="text-xs font-bold text-foreground">Atualizado manualmente</p>
                  <p className="text-[10px] text-muted-foreground">Cada script é atualizado pela nossa equipe antes de ser publicado</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-background/50 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--success))]" />
                <div>
                  <p className="text-xs font-bold text-foreground">Testado antes de postar</p>
                  <p className="text-[10px] text-muted-foreground">Tudo que está aqui foi testado e está funcionando corretamente</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-background/50 p-3">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--success))]" />
                <div>
                  <p className="text-xs font-bold text-foreground">Seguro e sem vírus</p>
                  <p className="text-[10px] text-muted-foreground">Nenhum script contém vírus ou qualquer coisa que prejudique o usuário</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                    selectedCategory === c.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {gameFilters.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGame(g.id)}
                    className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                      selectedGame === g.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {g.icon && <img src={g.icon} alt={g.label} className="h-4 w-4 object-contain" />}
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar scripts..."
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary sm:w-64"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-16 text-center text-sm text-muted-foreground">
              Nenhum post encontrado.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/scripts/${post.id}`}
                    className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          post.category === "executor" ? "bg-destructive/10 text-destructive" :
                          post.category === "tutorial" ? "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]" :
                          "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                        }`}>
                          <Tag className="mr-1 inline h-3 w-3" />
                          {post.category === "executor" ? "Executor" : post.category === "tutorial" ? "Tutorial" : "Script"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <h3 className="mt-2 font-heading text-base font-bold sm:text-lg line-clamp-2">{post.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{post.content.substring(0, 120)}...</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Por {post.author || "skilin"}</span>
                        {post.game_compatible && (
                          <span className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {GAME_ICONS[post.game_compatible] ? (
                              <img src={GAME_ICONS[post.game_compatible]} alt={post.game_compatible} className="h-3.5 w-3.5 object-contain" />
                            ) : (
                              <Gamepad2 className="h-3 w-3" />
                            )}
                            {post.game_compatible}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <Footer />
        <DiscordFloat />
      </div>
    </PageTransition>
  );
};

export default Scripts;
