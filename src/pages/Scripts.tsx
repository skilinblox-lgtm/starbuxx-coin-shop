import { useState, useEffect } from "react";
import { Code2, Download, Calendar, Tag, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import ReactMarkdown from "react-markdown";

const Scripts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

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

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCat;
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
          </motion.div>

          {/* Filters */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
                >
                  {post.image_url && (
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
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
                    <h3 className="mt-2 font-heading text-base font-bold sm:text-lg">{post.title}</h3>
                    <div className={`mt-2 text-xs text-muted-foreground leading-relaxed ${expandedPost === post.id ? "" : "line-clamp-3"}`}>
                      <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      {expandedPost === post.id ? "Ver menos" : "Ler mais"}
                    </button>
                  </div>
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
