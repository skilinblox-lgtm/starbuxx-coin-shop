import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Package, Gamepad2, Clock, CheckCircle, Truck, XCircle,
  CreditCard, RefreshCw, Send, MessageCircle, ChevronDown, ChevronUp,
  Link2, Timer, AlertCircle, CalendarClock, Star, ExternalLink,
  Image as ImageIcon, X, Eye, ShieldCheck, Wifi, WifiOff, Play,
  Zap, Users, Info, Hash, User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; step: number; barColor: string }> = {
  aguardando_pagamento: { label: "Pendente", icon: Clock, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10", step: 1, barColor: "bg-[hsl(var(--warning))]" },
  pago: { label: "Pago", icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10", step: 2, barColor: "bg-[hsl(var(--success))]" },
  em_entrega: { label: "Em Entrega", icon: Truck, color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10", step: 3, barColor: "bg-[hsl(var(--info))]" },
  entregue: { label: "Entregue", icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10", step: 4, barColor: "bg-[hsl(var(--success))]" },
  cancelado: { label: "Recusado", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", step: 0, barColor: "bg-destructive" },
};

const GAMEPASS_VALID_DOMAIN = "roblox.com/pt/game-pass/";
const GAMEPASS_WRONG_DOMAIN = "create.roblox.com";

const TUTORIAL_STEPS = [
  {
    title: "1. Entre no Roblox e acesse seu perfil",
    desc: "No canto superior direito, clique no seu avatar e vá em 'Perfil'.",
    image: "/images/tutorial-step1.png",
  },
  {
    title: "2. Acesse suas criações",
    desc: "Na aba 'Criações', encontre sua experiência criada automaticamente.",
    image: "/images/tutorial-step2.png",
  },
  {
    title: "3. Vá em 'Loja' na sua criação",
    desc: "Dentro da experiência, clique na aba 'Loja' para ver/criar passes.",
    image: "/images/tutorial-step3.png",
  },
  {
    title: "4. Clique na sua Gamepass",
    desc: "Clique em cima da gamepass com o valor correto. Lembrando: NÃO cobrimos a taxa de 30% do Roblox. Se comprou 1.000 Robux, coloque o preço de 1.000 Robux (não 1.429).",
    image: "/images/tutorial-step4.png",
  },
  {
    title: "5. Copie a URL e nos envie",
    desc: "Copie a URL lá em cima (do navegador) e cole aqui no chat. Deve ser algo como: roblox.com/pt/game-pass/...",
    image: "/images/tutorial-step5.png",
  },
];

// VIDEO_TUTORIAL_URL - placeholder until user provides real video
const VIDEO_TUTORIAL_URL = "/videos/starbuxx-promo.mp4";

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [gamepassLink, setGamepassLink] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<string | null>(null);
  const [gamepassSent, setGamepassSent] = useState<Record<string, boolean>>({});
  const [adminOnline, setAdminOnline] = useState(false);
  const [lastAdminActivity, setLastAdminActivity] = useState<string | null>(null);
  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Detect admin online status based on recent admin messages
  const checkAdminOnline = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("created_at")
      .eq("sender_role", "admin")
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const lastMsg = new Date(data[0].created_at);
      const diffMin = (Date.now() - lastMsg.getTime()) / 60000;
      setAdminOnline(diffMin < 30); // online if admin replied within 30 min
      setLastAdminActivity(data[0].created_at);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      
      const { data: brReviews } = await supabase.from("brainrot_reviews").select("order_id").eq("user_id", session.user.id);
      const reviewedSet = new Set<string>();
      brReviews?.forEach(r => { if (r.order_id) reviewedSet.add(r.order_id); });
      setReviewedOrders(reviewedSet);

      if (data) {
        const sentMap: Record<string, boolean> = {};
        for (const o of data) {
          if (getOrderCategory(o) === "robux") {
            const { data: msgs } = await supabase.from("chat_messages").select("message").eq("order_id", o.id).eq("sender_role", "customer");
            const hasLink = msgs?.some(m => m.message.includes("roblox.com/pt/game-pass/"));
            if (hasLink) sentMap[o.id] = true;
          }
        }
        setGamepassSent(sentMap);
      }
      setLoading(false);
    };
    fetchOrders();
    checkAdminOnline();
    const interval = setInterval(checkAdminOnline, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (!expandedOrder) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages").select("*").eq("order_id", expandedOrder).order("created_at", { ascending: true });
      setMessages(prev => ({ ...prev, [expandedOrder]: data || [] }));
    };
    fetchMessages();
    const channel = supabase
      .channel(`order-chat-${expandedOrder}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `order_id=eq.${expandedOrder}` },
        (payload) => { setMessages(prev => ({ ...prev, [expandedOrder]: [...(prev[expandedOrder] || []), payload.new] })); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [expandedOrder]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, expandedOrder]);

  const canRefund = (order: any) => {
    if (order.status === "cancelado" || order.status === "aguardando_pagamento") return false;
    if (!order.payment_approved_at) return false;
    return (new Date().getTime() - new Date(order.payment_approved_at).getTime()) / (1000 * 60 * 60) >= 48;
  };

  const getRefundCountdown = (order: any) => {
    if (!order.payment_approved_at || order.status === "cancelado") return null;
    const diff = new Date(order.payment_approved_at).getTime() + 48 * 3600000 - Date.now();
    if (diff <= 0) return null;
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}min`;
  };

  const getEstimatedDelivery = (order: any) => {
    if (order.status === "entregue" || order.status === "cancelado") return null;
    const category = getOrderCategory(order);
    if (category === "robux") {
      return adminOnline ? "Estimativa: 2-6 horas" : "Estimativa: até 24 horas";
    }
    return adminOnline ? "Estimativa: 1-4 horas" : "Estimativa: até 24 horas";
  };

  const requestRefund = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "cancelado" }).eq("id", orderId);
    if (error) { toast.error("Erro ao solicitar reembolso"); return; }
    toast.success("Reembolso solicitado!");
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelado" } : o));
  };

  const sendMessage = async (orderId: string) => {
    if (!newMessage.trim() || !userId) return;
    await supabase.from("chat_messages").insert({ order_id: orderId, sender_id: userId, sender_role: "customer", message: newMessage.trim() });
    setNewMessage("");
  };

  const validateGamepassUrl = (url: string): { valid: boolean; wrongDomain: boolean } => {
    const trimmed = url.trim();
    if (trimmed.includes(GAMEPASS_WRONG_DOMAIN)) {
      return { valid: false, wrongDomain: true };
    }
    if (trimmed.includes(GAMEPASS_VALID_DOMAIN) || trimmed.includes("roblox.com/game-pass/")) {
      return { valid: true, wrongDomain: false };
    }
    return { valid: false, wrongDomain: false };
  };

  const sendGamepassLink = async (orderId: string) => {
    if (!gamepassLink.trim() || !userId) return;
    
    const validation = validateGamepassUrl(gamepassLink);
    
    if (validation.wrongDomain) {
      toast.error("⚠️ Link incorreto! Esse é o link do painel de criação, não da gamepass.");
      setShowTutorial(orderId);
      return;
    }
    
    if (!validation.valid) {
      toast.error("Link inválido. O link deve ser do tipo: roblox.com/pt/game-pass/...");
      setShowTutorial(orderId);
      return;
    }

    // Valid link - hide tutorial and send
    setShowTutorial(null);
    await supabase.from("chat_messages").insert({ 
      order_id: orderId, sender_id: userId, sender_role: "customer", 
      message: `✅ Link do Gamepass: ${gamepassLink.trim()}` 
    });
    setGamepassSent(prev => ({ ...prev, [orderId]: true }));
    toast.success("Link enviado com sucesso! 🎉");
    setGamepassLink("");
  };

  const submitReview = async (order: any) => {
    if (!userId || !reviewText.trim()) return;
    setReviewSubmitting(true);
    try {
      const gameId = order.game_id?.toLowerCase() || "";
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", userId).single();
      const authorName = profile?.full_name || order.full_name || "Cliente";

      if (gameId === "brainrot" && order.product_id) {
        await supabase.from("brainrot_reviews").insert({
          brainrot_id: order.product_id,
          user_id: userId,
          author_name: authorName,
          comment: reviewText.trim(),
          rating: reviewRating,
          order_id: order.id,
        });
      } else {
        await supabase.from("reviews").insert({
          game_id: order.game_id,
          user_id: userId,
          author_name: authorName,
          comment: reviewText.trim(),
          rating: reviewRating,
        });
      }

      // Send to Discord webhook
      const reviewType = (gameId === "brainrot") ? "brainrot" : "game";
      supabase.functions.invoke("discord-review", {
        body: {
          author_name: authorName,
          rating: reviewRating,
          comment: reviewText.trim(),
          game_id: order.game_id,
          type: reviewType,
        },
      }).catch((err) => console.error("Discord webhook error:", err));
      
      setReviewedOrders(prev => new Set(prev).add(order.id));
      setReviewText("");
      setReviewRating(5);
      toast.success("Avaliação enviada! Obrigado! ⭐");
    } catch (err) {
      toast.error("Erro ao enviar avaliação");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getOrderCategory = (order: any) => {
    const gid = order.game_id?.toLowerCase() || "";
    return (gid === "roblox" || gid.includes("robux")) ? "robux" : "chat";
  };

  const isPaid = (order: any) => order.status !== "aguardando_pagamento";

  // Admin online indicator component
  const AdminStatusBadge = () => (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
      adminOnline 
        ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" 
        : "bg-muted text-muted-foreground"
    }`}>
      <span className={`h-2 w-2 rounded-full ${adminOnline ? "bg-[hsl(var(--success))] animate-pulse" : "bg-muted-foreground"}`} />
      {adminOnline ? "Vendedor Online" : "Vendedor Offline"}
    </div>
  );

  const ChatMessages = ({ msgs }: { msgs: any[] }) => (
    <>
      {msgs.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender_role === "customer" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
            msg.sender_role === "customer" ? "bg-[hsl(var(--info))]/10 text-foreground" : "bg-muted text-foreground"
          }`}>
            {msg.sender_role !== "customer" && <span className="mb-1 block text-[10px] font-bold text-[hsl(var(--info))]">StarBuxx</span>}
            <p className="break-words">{msg.message}</p>
            <span className="mt-1 block text-[9px] text-muted-foreground">
              {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      ))}
    </>
  );

  const ProgressBar = ({ order }: { order: any }) => {
    const st = statusConfig[order.status] || statusConfig.aguardando_pagamento;
    if (order.status === "cancelado") return (
      <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-center">
        <span className="text-xs font-bold text-destructive">Pedido Cancelado / Recusado</span>
      </div>
    );

    const steps = [
      { step: 1, label: "Pagamento", color: "bg-[hsl(var(--warning))]" },
      { step: 2, label: "Confirmado", color: "bg-[hsl(var(--success))]" },
      { step: 3, label: "Entregando", color: "bg-[hsl(var(--info))]" },
      { step: 4, label: "Entregue", color: "bg-[hsl(var(--success))]" },
    ];

    return (
      <div className="mb-5">
        <div className="flex items-center justify-between">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-1 flex-col items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                st.step >= s.step ? s.color : "bg-muted text-muted-foreground"
              }`}>
                {st.step > s.step ? <CheckCircle className="h-4 w-4" /> : s.step}
              </div>
              <span className={`mt-1 text-[10px] ${st.step >= s.step ? "font-bold text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-1 flex max-w-[80%] gap-0">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${
              st.step > i
                ? i === 0 ? "bg-[hsl(var(--warning))]" : i === 1 ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--info))]"
                : "bg-muted"
            }`} />
          ))}
        </div>
        {/* Estimated delivery */}
        {getEstimatedDelivery(order) && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground">{getEstimatedDelivery(order)}</span>
          </div>
        )}
      </div>
    );
  };

  // Video tutorial section - always visible for Robux orders
  const VideoTutorialSection = () => (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 border-b border-border">
        <Play className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-bold">📹 Vídeo Tutorial - Como copiar o link</span>
      </div>
      <video
        src={VIDEO_TUTORIAL_URL}
        controls
        className="w-full max-h-[200px] object-contain bg-black/5"
        preload="metadata"
        playsInline
      />
    </div>
  );

  // Detailed order info card
  const OrderDetailCard = ({ order }: { order: any }) => {
    const category = getOrderCategory(order);
    const createdDate = new Date(order.created_at);
    const paidDate = order.payment_approved_at ? new Date(order.payment_approved_at) : null;

    return (
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="flex items-center justify-between bg-muted/30 px-3 py-2 border-b border-border">
          <span className="text-[11px] font-bold flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary" /> Detalhes do Pedido
          </span>
          <AdminStatusBadge />
        </div>
        <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-border sm:grid-cols-3">
          <div className="p-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Hash className="h-3 w-3" /> ID do Pedido</span>
            <p className="mt-0.5 text-xs font-mono font-bold truncate">{order.id.slice(0, 8)}...</p>
          </div>
          <div className="p-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><User className="h-3 w-3" /> Jogador</span>
            <p className="mt-0.5 text-xs font-bold">{order.game_username}</p>
          </div>
          <div className="p-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MessageCircle className="h-3 w-3" /> Discord</span>
            <p className="mt-0.5 text-xs font-bold text-[hsl(235,86%,65%)]">{order.discord_username}</p>
          </div>
          <div className="p-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Package className="h-3 w-3" /> Quantidade</span>
            <p className="mt-0.5 text-xs font-bold">{order.quantity.toLocaleString("pt-BR")} {category === "robux" ? "Robux" : "un"}</p>
          </div>
          <div className="p-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><CreditCard className="h-3 w-3" /> Total</span>
            <p className="mt-0.5 text-xs font-bold text-gradient-gold">R$ {Number(order.total_price).toFixed(2)}</p>
          </div>
          <div className="p-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" /> Criado em</span>
            <p className="mt-0.5 text-xs font-bold">{createdDate.toLocaleDateString("pt-BR")} {createdDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          {paidDate && (
            <div className="p-3 col-span-2 sm:col-span-1">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><CheckCircle className="h-3 w-3" /> Pago em</span>
              <p className="mt-0.5 text-xs font-bold text-[hsl(var(--success))]">{paidDate.toLocaleDateString("pt-BR")} {paidDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          )}
        </div>
        {/* Trust badges */}
        <div className="flex items-center gap-3 border-t border-border px-3 py-2 bg-muted/20">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-[hsl(var(--success))]" /> Pagamento Seguro
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" /> Entrega Rápida
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users className="h-3 w-3 text-[hsl(var(--info))]" /> +2.000 entregas
          </div>
        </div>
      </div>
    );
  };

  // Delivered success section for Robux
  const DeliveredRobuxSection = ({ order }: { order: any }) => (
    <div className="mt-4 space-y-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success))]/10 ring-4 ring-[hsl(var(--success))]/20">
          <CheckCircle className="h-7 w-7 text-[hsl(var(--success))]" />
        </div>
        <h3 className="mt-3 font-heading text-lg font-bold">Pedido Entregue! 🎉</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Seus Robux foram enviados com sucesso! Para verificar seus Robux pendentes, acesse o link abaixo:
        </p>
        <a href="https://www.roblox.com/pt/transactions" target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--success))] px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110">
          <ExternalLink className="h-4 w-4" /> Ver Robux Pendentes
        </a>
      </motion.div>

      <div className="rounded-xl border border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/5 p-4">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--warning))]" />
          <div className="text-xs text-muted-foreground">
            <p className="font-bold text-foreground">⏳ Prazo do Roblox</p>
            <p className="mt-1">
              Após o pagamento da gamepass, o Roblox demora de <strong className="text-foreground">2 a 7 dias úteis</strong> para 
              liberar os Robux na sua conta. Isso é uma política do próprio Roblox e não depende de nós.
            </p>
            <p className="mt-1 font-semibold text-foreground">Fique tranquilo, seus Robux estão a caminho! 💎</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Delivered success for non-robux
  const DeliveredChatSection = ({ order }: { order: any }) => (
    <div className="mt-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success))]/10 ring-4 ring-[hsl(var(--success))]/20">
          <CheckCircle className="h-7 w-7 text-[hsl(var(--success))]" />
        </div>
        <h3 className="mt-3 font-heading text-lg font-bold">Pedido Entregue! 🎉</h3>
        <p className="mt-2 text-sm text-muted-foreground">Seu item foi entregue com sucesso. Obrigado por comprar na StarBuxx!</p>
      </motion.div>
    </div>
  );

  // Review Section
  const ReviewSection = ({ order }: { order: any }) => {
    if (order.status !== "entregue" || reviewedOrders.has(order.id)) return null;
    return (
      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h4 className="flex items-center gap-2 text-sm font-bold">
          <Star className="h-4 w-4 text-primary" /> Avalie sua compra
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">Conte como foi sua experiência!</p>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110">
              <Star className={`h-6 w-6 ${star <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder="Conte como foi sua experiência de compra..."
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
        />
        <button onClick={() => submitReview(order)} disabled={reviewSubmitting || !reviewText.trim()}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50">
          {reviewSubmitting ? "Enviando..." : "Enviar Avaliação"} <Star className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  // Robux order section - tutorial ONLY on error
  const RobuxOrderSection = ({ order, orderMessages }: { order: any; orderMessages: any[] }) => {
    const paid = isPaid(order);
    const linkSent = gamepassSent[order.id];

    if (order.status === "entregue") return (
      <>
        <DeliveredRobuxSection order={order} />
        <ReviewSection order={order} />
      </>
    );

    if (!paid) return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-[hsl(var(--warning))]" />
        <div>
          <p className="text-sm font-bold text-[hsl(var(--warning))]">Aguardando pagamento</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Realize o pagamento para enviar o link do gamepass.</p>
        </div>
      </div>
    );

    return (
      <div className="mt-4 space-y-4">
        {/* Order details */}
        <OrderDetailCard order={order} />

        {/* Gamepass link sent success */}
        {linkSent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[hsl(var(--success))]" />
              <div>
                <p className="text-sm font-bold text-[hsl(var(--success))]">Link enviado com sucesso! ✅</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fique tranquilo! Nossa equipe de entregadores já foi notificada e logo logo vai pagar sua gamepass. 
                  O prazo é de <strong className="text-foreground">até 48h úteis</strong>.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Após o pagamento, o Roblox demora de <strong className="text-foreground">2 a 7 dias úteis</strong> para enviar os Robux para sua conta.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Gamepass link input */}
            <div className="rounded-xl border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4">
              <h4 className="flex items-center gap-2 font-heading text-sm font-bold">
                <Link2 className="h-4 w-4 text-[hsl(var(--success))]" />
                Enviar Link do Gamepass
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Crie um gamepass com o valor exato de <strong className="text-foreground">{order.quantity.toLocaleString("pt-BR")} Robux</strong> e cole o link abaixo.
              </p>
              <div className="mt-3 flex gap-2">
                <input type="url" value={gamepassLink} onChange={(e) => setGamepassLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendGamepassLink(order.id)}
                  placeholder="https://www.roblox.com/pt/game-pass/..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[hsl(var(--success))] focus:ring-2 focus:ring-[hsl(var(--success))]/20" />
                <button onClick={() => sendGamepassLink(order.id)} disabled={!gamepassLink.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--success))] px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50">
                  <Send className="h-3.5 w-3.5" /> Enviar
                </button>
              </div>
            </div>

            {/* Tutorial ONLY on error */}
            <AnimatePresence>
              {showTutorial === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> ⚠️ Link incorreto! Siga o passo a passo:
                      </h4>
                      <button onClick={() => setShowTutorial(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="rounded-lg border border-destructive/10 bg-background p-3 mb-3">
                      <p className="text-xs text-destructive font-bold">❌ Links como <code className="bg-destructive/10 px-1 rounded">create.roblox.com/dashboard/...</code> estão ERRADOS!</p>
                      <p className="text-xs text-muted-foreground mt-1">✅ O link correto é: <code className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] px-1 rounded">roblox.com/pt/game-pass/...</code></p>
                    </div>

                    <div className="space-y-3">
                      {TUTORIAL_STEPS.map((step, i) => (
                        <div key={i} className="rounded-xl border border-border bg-background overflow-hidden">
                          <div className="p-3">
                            <p className="text-xs font-bold text-foreground">{step.title}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{step.desc}</p>
                          </div>
                          <img src={step.image} alt={step.title} className="w-full border-t border-border" loading="lazy" />
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Após copiar a URL correta, cole no campo acima e clique em <strong className="text-foreground">Enviar</strong>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Small video tutorial - always visible */}
        <VideoTutorialSection />

        {/* Robux delivery info */}
        <div className="rounded-xl border border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/5 p-3">
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--warning))]" />
            <div className="text-xs text-muted-foreground">
              <p className="font-bold text-foreground">Prazo de entrega Robux</p>
              <p className="mt-1">Nossa equipe paga a gamepass em <strong className="text-foreground">até 48h</strong>. Após isso, o Roblox demora de <strong className="text-foreground">2 a 7 dias úteis</strong> para enviar os Robux.</p>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold">
            <MessageCircle className="h-4 w-4 text-[hsl(var(--info))]" /> Chat com a StarBuxx
            <AdminStatusBadge />
          </h4>
          <div className="mt-2 flex max-h-48 min-h-[100px] flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
            {orderMessages.length === 0 ? (
              <p className="my-auto text-center text-xs text-muted-foreground">Envie o link do gamepass para iniciar</p>
            ) : <ChatMessages msgs={orderMessages} />}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-2 flex gap-2">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(order.id)} placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--info))] focus:ring-2 focus:ring-[hsl(var(--info))]/20" />
            <button onClick={() => sendMessage(order.id)} disabled={!newMessage.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--info))] px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Chat order section (brainrot, gamepass, frutas)
  const ChatOrderSection = ({ order, orderMessages }: { order: any; orderMessages: any[] }) => {
    const paid = isPaid(order);

    if (order.status === "entregue") return (
      <>
        <DeliveredChatSection order={order} />
        <ReviewSection order={order} />
      </>
    );

    if (!paid) return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-[hsl(var(--warning))]" />
        <div>
          <p className="text-sm font-bold text-[hsl(var(--warning))]">Aguardando pagamento</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Realize o pagamento para iniciar o processo de entrega.</p>
        </div>
      </div>
    );

    return (
      <div className="mt-4 space-y-4">
        {/* Order details */}
        <OrderDetailCard order={order} />

        {/* Highlight discord + game username */}
        <div className="rounded-xl border border-[hsl(var(--info))]/20 bg-[hsl(var(--info))]/5 p-3">
          <p className="text-xs font-bold text-[hsl(var(--info))] mb-2">📋 Informações para entrega</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-background p-2.5">
              <span className="text-[10px] text-muted-foreground">Nick no Roblox</span>
              <p className="mt-0.5 text-sm font-bold text-foreground">{order.game_username}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-2.5">
              <span className="text-[10px] text-muted-foreground">Discord</span>
              <p className="mt-0.5 text-sm font-bold text-[hsl(235,86%,65%)]">{order.discord_username}</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Nosso entregador vai te adicionar no jogo. Fique atento às solicitações de amizade!
          </p>
        </div>

        {/* Chat fully open */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold">
            <MessageCircle className="h-4 w-4 text-[hsl(var(--info))]" /> Chat com a StarBuxx
            <AdminStatusBadge />
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">Converse conosco para combinar a entrega do seu item</p>
          <div className="mt-2 flex max-h-64 min-h-[120px] flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
            {orderMessages.length === 0 ? (
              <p className="my-auto text-center text-xs text-muted-foreground">Nenhuma mensagem ainda. Envie uma para iniciar!</p>
            ) : <ChatMessages msgs={orderMessages} />}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-2 flex gap-2">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(order.id)} placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--info))] focus:ring-2 focus:ring-[hsl(var(--info))]/20" />
            <button onClick={() => sendMessage(order.id)} disabled={!newMessage.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--info))] px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
            <Link to="/" className="flex items-center gap-1.5">
              <span className="font-heading text-lg font-bold">Star<span className="text-gradient-gold">Buxx</span></span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </Link>
          </div>
        </nav>

        <div className="container px-4 py-6 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--info))]/10">
              <Package className="h-5 w-5 text-[hsl(var(--info))]" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold sm:text-2xl">Meus Pedidos</h1>
              <p className="text-xs text-muted-foreground">Acompanhe e gerencie suas compras</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : orders.length === 0 ? (
            <div className="mt-12 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted"><Package className="h-10 w-10 text-muted-foreground" /></div>
              <h3 className="mt-4 font-heading text-lg font-bold">Nenhum pedido ainda</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">Seus pedidos aparecerão aqui depois da sua primeira compra.</p>
              <Link to="/#jogos" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--success))] px-6 py-3 text-sm font-bold text-white">
                <Gamepad2 className="h-4 w-4" /> Comprar Agora
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {orders.map((o) => {
                const st = statusConfig[o.status] || statusConfig.aguardando_pagamento;
                const StatusIcon = st.icon;
                const isExpanded = expandedOrder === o.id;
                const showRefund = canRefund(o);
                const countdown = getRefundCountdown(o);
                const category = getOrderCategory(o);
                const orderMessages = messages[o.id] || [];

                return (
                  <motion.div key={o.id} layout className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                    <button onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                      className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30 sm:p-5">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${st.bg}`}>
                        <StatusIcon className={`h-5 w-5 ${st.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-heading text-sm font-bold sm:text-base">
                            {o.game_id.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${st.bg} ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {o.quantity.toLocaleString("pt-BR")} un • {o.game_username} • {new Date(o.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-heading text-base font-bold text-gradient-gold sm:text-lg">R$ {Number(o.total_price).toFixed(2)}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="border-t border-border px-4 py-4 sm:px-5">
                            {/* Progress bar */}
                            <ProgressBar order={o} />

                            {/* Refund */}
                            {o.status !== "cancelado" && (
                              <div className="mb-3 flex items-center gap-3">
                                {showRefund ? (
                                  <button onClick={() => requestRefund(o.id)}
                                    className="flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-destructive/90">
                                    <RefreshCw className="h-3.5 w-3.5" /> Solicitar Reembolso
                                  </button>
                                ) : countdown ? (
                                  <div className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 px-3 py-2 text-xs text-[hsl(var(--warning))]">
                                    <Timer className="h-3.5 w-3.5" />
                                    Reembolso disponível em <span className="font-bold">{countdown}</span>
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {/* Category-specific section */}
                            {o.status !== "cancelado" && (
                              category === "robux" 
                                ? <RobuxOrderSection order={o} orderMessages={orderMessages} />
                                : <ChatOrderSection order={o} orderMessages={orderMessages} />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MyOrders;
