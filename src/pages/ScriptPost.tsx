import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Code2, Calendar, Tag, Copy, Download, Star, Send, Youtube, ExternalLink, ArrowLeft, User, FileText, Gamepad2, Terminal, CheckCircle, Play, Shield, Zap, ClipboardCheck, BookOpen, MessageSquare, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscordFloat from "@/components/DiscordFloat";
import PageTransition from "@/components/PageTransition";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const CREATORS = [
  { name: "skilin", youtube: "https://www.youtube.com/@skilin7" },
  { name: "Novin77", youtube: "https://www.youtube.com/@Novin771" },
];

const ScriptPost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [sendingComment, setSendingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .eq("published", true)
        .single();
      setPost(data);
      setLoading(false);

      if (data) {
        const { data: related } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .neq("id", postId!)
          .limit(4);
        setRelatedPosts(related || []);
      }
    };

    const fetchComments = async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      setComments(data || []);
    };

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };

    fetchPost();
    fetchComments();
    fetchUser();
  }, [postId]);

  const copyScript = () => {
    if (!currentUser) {
      toast.error("Crie uma conta ou faça login para copiar o script!");
      return;
    }
    if (post?.script_code) {
      navigator.clipboard.writeText(post.script_code);
      setCopied(true);
      toast.success("Script copiado com sucesso!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadScript = () => {
    if (!currentUser) {
      toast.error("Crie uma conta ou faça login para fazer download!");
      return;
    }
    if (post?.script_code) {
      const blob = new Blob([post.script_code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${post.title.replace(/\s+/g, "_")}.lua`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
    }
  };

  const submitComment = async () => {
    if (!currentUser) { toast.error("Faça login para comentar"); return; }
    if (!newComment.trim()) { toast.error("Escreva um comentário"); return; }
    setSendingComment(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", currentUser.id)
        .single();

      const { error } = await supabase.from("blog_comments").insert({
        post_id: postId,
        user_id: currentUser.id,
        author_name: profile?.full_name || currentUser.email?.split("@")[0] || "Anônimo",
        comment: newComment,
        rating: newRating,
      });
      if (error) throw error;
      toast.success("Comentário enviado!");
      setNewComment("");
      setNewRating(5);
      const { data } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      setComments(data || []);
    } catch (e: any) { toast.error(e.message); }
    finally { setSendingComment(false); }
  };

  const avgRating = comments.length > 0
    ? (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1)
    : "0";

  if (loading) return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Terminal className="h-8 w-8 animate-pulse text-[hsl(var(--success))]" />
        </div>
      </div>
    </PageTransition>
  );

  if (!post) return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground">Post não encontrado.</p>
          <Link to="/scripts" className="mt-4 inline-block text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Voltar
          </Link>
        </div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 pb-12 pt-20 sm:pt-24">
          {/* Back button */}
          <Link to="/scripts" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[hsl(var(--success))] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Scripts
          </Link>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">

              {/* === 1. IMAGEM === */}
              {post.image_url && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="overflow-hidden rounded-2xl border border-[hsl(var(--success))]/20 shadow-[0_0_30px_-10px_hsl(var(--success)/0.15)]">
                  <img src={post.image_url} alt={post.title} className="w-full aspect-video object-cover" />
                </motion.div>
              )}

              {/* Title & meta */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    post.category === "executor" ? "bg-destructive/10 text-destructive border border-destructive/20" :
                    post.category === "tutorial" ? "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] border border-[hsl(var(--info))]/20" :
                    "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/20"
                  }`}>
                    <Tag className="h-3 w-3" />
                    {post.category === "executor" ? "Executor" : post.category === "tutorial" ? "Tutorial" : "Script"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  {comments.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Star className="h-3 w-3 fill-primary" /> {avgRating}
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl uppercase tracking-wide">{post.title}</h1>
                {post.game_compatible && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 px-3 py-1.5 text-xs font-medium text-[hsl(var(--success))]">
                    <Gamepad2 className="h-3.5 w-3.5" /> {post.game_compatible}
                  </div>
                )}
              </motion.div>

              {/* === 2. DESCRIÇÃO (aberta) === */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <Info className="h-4 w-4 text-[hsl(var(--success))]" />
                  <span className="font-heading text-sm font-bold sm:text-base">Descrição</span>
                </div>
                <div className="px-4 py-4 prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </motion.div>

              {/* === 3. COMO UTILIZAR (aberto) === */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <BookOpen className="h-4 w-4 text-[hsl(var(--success))]" />
                  <span className="font-heading text-sm font-bold sm:text-base">Como Utilizar</span>
                </div>
                <div className="px-4 py-4 text-sm text-muted-foreground space-y-3">
                  {[
                    { step: "1", icon: Copy, text: 'Copie o script abaixo clicando em "Copiar Script"' },
                    { step: "2", icon: Terminal, text: "Abra seu executor favorito (Delta, Volcano, etc.)" },
                    { step: "3", icon: Play, text: "Cole o script no executor e clique em Executar" },
                    { step: "4", icon: CheckCircle, text: "Pronto! Aproveite o script no jogo" },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))]/10 text-[10px] font-bold text-[hsl(var(--success))]">{s.step}</span>
                      <div className="flex items-center gap-2">
                        <s.icon className="h-4 w-4 flex-shrink-0 text-[hsl(var(--success))]/60" />
                        <span>{s.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* === 4. VÍDEO TUTORIAL === */}
              {post.video_url && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <Play className="h-4 w-4 text-destructive" />
                    <span className="font-heading text-sm font-bold sm:text-base">Vídeo Tutorial</span>
                  </div>
                  <div className="aspect-video">
                    <iframe
                      src={post.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </motion.div>
              )}

              {/* === 5. SCRIPT CODE (último, profissional) === */}
              {post.script_code && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-[hsl(var(--success))]/30 bg-[hsl(220,15%,8%)] overflow-hidden shadow-[0_0_40px_-15px_hsl(var(--success)/0.2)]">
                  {/* Terminal header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--success))]/15 bg-[hsl(220,15%,6%)]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success))]/60" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[hsl(var(--success))]/70">
                        <Terminal className="h-3.5 w-3.5" />
                        <span className="text-xs font-mono font-medium">{post.title.replace(/\s+/g, "_")}.lua</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={copyScript}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          copied
                            ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] border border-[hsl(var(--success))]/40"
                            : "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/20 hover:bg-[hsl(var(--success))]/20 hover:border-[hsl(var(--success))]/40"
                        }`}>
                        {copied ? <ClipboardCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copiado!" : "Copiar Script"}
                      </button>
                      <button onClick={downloadScript}
                        className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 hover:border-primary/50 transition-all">
                        <Download className="h-3.5 w-3.5" /> .lua
                      </button>
                    </div>
                   </div>
                  {/* Code area */}
                  {currentUser ? (
                    <div className="p-4 overflow-x-auto max-h-80 overflow-y-auto">
                      <div className="flex gap-4">
                        <div className="flex flex-col text-right font-mono text-[10px] text-[hsl(var(--success))]/25 select-none leading-[1.6]">
                          {post.script_code.split('\n').map((_: string, i: number) => (
                            <span key={i}>{i + 1}</span>
                          ))}
                        </div>
                        <pre className="flex-1 text-xs font-mono text-[hsl(var(--success))]/80 whitespace-pre-wrap break-all leading-[1.6]">
                          <code>{post.script_code}</code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
                      <Shield className="h-8 w-8 text-[hsl(var(--success))]/40" />
                      <p className="text-sm font-bold text-[hsl(var(--success))]/80">Crie uma conta para acessar o script</p>
                      <p className="text-xs text-muted-foreground">Faça login ou crie sua conta gratuitamente para copiar e baixar scripts.</p>
                      <Link to="/auth" className="mt-1 flex items-center gap-2 rounded-xl bg-[hsl(var(--success))]/15 border border-[hsl(var(--success))]/30 px-5 py-2.5 text-xs font-bold text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/25 transition-all">
                        <User className="h-4 w-4" /> Criar Conta / Login
                      </Link>
                    </div>
                  )}
                  {/* Footer status bar */}
                  <div className="flex items-center justify-between border-t border-[hsl(var(--success))]/10 bg-[hsl(220,15%,6%)] px-4 py-2">
                    <span className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--success))]/40 font-mono">
                      <Shield className="h-3 w-3" /> Verificado pela StarBuxx
                    </span>
                    <span className="text-[10px] text-[hsl(var(--success))]/30 font-mono">
                      Lua • {post.script_code.split('\n').length} linhas
                    </span>
                  </div>
                </motion.div>
              )}

              {/* === COMENTÁRIOS === */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-heading text-sm font-bold sm:text-base">Comentários ({comments.length})</span>
                </div>
                <div className="px-4 py-4 space-y-4">
                  {/* Add comment form */}
                  {currentUser ? (
                    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Sua nota:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setNewRating(s)}>
                              <Star className={`h-5 w-5 transition-all ${s <= newRating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Escreva seu comentário..."
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                          onKeyDown={e => e.key === "Enter" && submitComment()}
                        />
                        <button onClick={submitComment} disabled={sendingComment}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        <Link to="/auth" className="text-primary hover:underline font-medium">Faça login</Link> para comentar
                      </p>
                    </div>
                  )}

                  {/* Comments list */}
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3 rounded-xl border border-border bg-muted/20 p-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{c.author_name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < c.rating ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{c.comment}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      <MessageSquare className="mx-auto mb-1 h-5 w-5 text-muted-foreground/30" />
                      Nenhum comentário ainda. Seja o primeiro!
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Author card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card p-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  <User className="h-3.5 w-3.5" /> Autor
                </h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--success))] to-primary">
                    <span className="text-sm font-bold text-primary-foreground">S</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{post.author || "skilin"}</p>
                    <p className="text-[10px] text-muted-foreground">Criador de conteúdo</p>
                  </div>
                </div>
              </motion.div>

              {/* Creators / YouTube channels */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  <Youtube className="h-3.5 w-3.5 text-destructive" /> Criadores
                </h3>
                <div className="mt-3 space-y-2">
                  {CREATORS.map(c => (
                    <a key={c.name} href={c.youtube} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 text-sm font-medium transition-all hover:border-destructive/40 hover:bg-destructive/5">
                      <span className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10">
                          <Youtube className="h-3.5 w-3.5 text-destructive" />
                        </div>
                        {c.name}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
                <p className="mt-3 text-center text-[10px] text-muted-foreground">
                  <Zap className="mr-1 inline h-3 w-3 text-primary" /> Se inscreva nos canais!
                </p>
              </motion.div>

              {/* Tested with */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                className="rounded-2xl border border-border bg-card p-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--success))]" /> Testado Com
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Delta", "Volcano"].map(exec => (
                    <span key={exec} className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 px-3 py-1.5 text-xs font-medium text-[hsl(var(--success))]">
                      <Zap className="h-3 w-3" /> {exec}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Trust badges */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl border border-[hsl(var(--success))]/15 bg-[hsl(var(--success))]/5 p-4">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[hsl(var(--success))]" /> <span>Script verificado e seguro</span></div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" /> <span>Atualizado regularmente</span></div>
                  <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-[hsl(var(--success))]" /> <span>Sem detecção</span></div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-10">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold sm:text-xl">
                <FileText className="h-5 w-5 text-[hsl(var(--success))]" /> Scripts Semelhantes
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} to={`/scripts/${rp.id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-[hsl(var(--success))]/40 hover:shadow-[0_0_20px_-8px_hsl(var(--success)/0.15)]">
                    {rp.image_url && (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img src={rp.image_url} alt={rp.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rp.category === "executor" ? "bg-destructive/10 text-destructive" :
                        rp.category === "tutorial" ? "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]" :
                        "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                      }`}>
                        <Tag className="h-2.5 w-2.5" />
                        {rp.category === "executor" ? "Executor" : rp.category === "tutorial" ? "Tutorial" : "Script"}
                      </span>
                      <p className="mt-1.5 line-clamp-2 text-xs font-bold">{rp.title}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(rp.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
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

export default ScriptPost;
