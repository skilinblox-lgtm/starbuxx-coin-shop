import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Star, ArrowLeft, Package, Gamepad2, Clock, CheckCircle, Truck, XCircle,
  CreditCard, RefreshCw, Send, MessageCircle, ChevronDown, ChevronUp,
  Monitor, Smartphone, Link2, Timer, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; step: number }> = {
  aguardando_pagamento: { label: "Pendente", icon: Clock, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10", step: 1 },
  pago: { label: "Pago", icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10", step: 2 },
  em_entrega: { label: "Em Entrega", icon: Truck, color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10", step: 3 },
  entregue: { label: "Entregue", icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10", step: 4 },
  cancelado: { label: "Recusado", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", step: 0 },
};

const ROBUX_TUTORIAL_STEPS_MOBILE = [
  "Abra o Roblox no celular e vá em 'Criar'",
  "Toque em 'Criar Experiência' ou abra uma existente",
  "Vá em 'Passes' e toque em 'Criar Passe'",
  "Coloque o nome, imagem e o preço exato do pedido",
  "Após criar, copie o link do gamepass e cole aqui",
];

const ROBUX_TUTORIAL_STEPS_PC = [
  "Acesse roblox.com e vá em 'Criar' no menu",
  "Abra qualquer experiência que você possui",
  "Clique em 'Itens Associados' → 'Passes'",
  "Crie um novo passe com o preço exato do pedido",
  "Copie o link do gamepass e cole aqui",
];

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [gamepassLink, setGamepassLink] = useState("");
  const [tutorialTab, setTutorialTab] = useState<"mobile" | "pc">("mobile");
  const [userId, setUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
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

  const sendGamepassLink = async (orderId: string) => {
    if (!gamepassLink.trim() || !userId) return;
    if (!gamepassLink.includes("roblox.com")) { toast.error("Cole um link válido do Roblox"); return; }
    await supabase.from("chat_messages").insert({ order_id: orderId, sender_id: userId, sender_role: "customer", message: `🎮 Link do Gamepass: ${gamepassLink.trim()}` });
    toast.success("Link enviado! Aguarde o pagamento.");
    setGamepassLink("");
  };

  const getOrderCategory = (order: any) => {
    const gid = order.game_id?.toLowerCase() || "";
    return (gid === "roblox" || gid.includes("robux")) ? "robux" : "chat";
  };

  const isPaid = (order: any) => order.status !== "aguardando_pagamento";

  const ChatMessages = ({ msgs }: { msgs: any[] }) => (
    <>
      {msgs.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender_role === "customer" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
            msg.sender_role === "customer" ? "bg-[hsl(var(--info))]/10 text-foreground" : "bg-muted text-foreground"
          }`}>
            {msg.sender_role !== "customer" && <span className="mb-1 block text-[10px] font-bold text-[hsl(var(--info))]">Starbuxx</span>}
            <p className="break-words">{msg.message}</p>
            <span className="mt-1 block text-[9px] text-muted-foreground">
              {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
            <Link to="/" className="flex items-center gap-1.5">
              <Star className="h-6 w-6 fill-primary text-primary" />
              <span className="font-heading text-lg font-bold">Star<span className="text-gradient-gold">buxx</span></span>
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
                const paid = isPaid(o);

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
                            {/* Progress */}
                            {o.status !== "cancelado" && (
                              <div className="mb-5">
                                <div className="flex items-center justify-between">
                                  {[
                                    { step: 1, label: "Pagamento", color: "bg-[hsl(var(--warning))]" },
                                    { step: 2, label: "Confirmado", color: "bg-[hsl(var(--success))]" },
                                    { step: 3, label: "Entregando", color: "bg-[hsl(var(--info))]" },
                                    { step: 4, label: "Entregue", color: "bg-[hsl(var(--success))]" },
                                  ].map((s) => (
                                    <div key={s.step} className="flex flex-1 flex-col items-center">
                                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                                        st.step >= s.step ? s.color : "bg-muted text-muted-foreground"
                                      }`}>
                                        {st.step > s.step ? <CheckCircle className="h-4 w-4" /> : s.step}
                                      </div>
                                      <span className="mt-1 text-[10px] text-muted-foreground">{s.label}</span>
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
                              </div>
                            )}

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-3 text-xs sm:grid-cols-4 sm:p-4">
                              <div><span className="text-muted-foreground">Jogador</span><p className="mt-0.5 font-bold">{o.game_username}</p></div>
                              <div><span className="text-muted-foreground">Pagamento</span><p className="mt-0.5 font-bold capitalize">{o.payment_method}</p></div>
                              <div><span className="text-muted-foreground">Quantidade</span><p className="mt-0.5 font-bold">{o.quantity.toLocaleString("pt-BR")}</p></div>
                              <div><span className="text-muted-foreground">Total</span><p className="mt-0.5 font-bold text-gradient-gold">R$ {Number(o.total_price).toFixed(2)}</p></div>
                            </div>

                            {/* Refund */}
                            <div className="mt-4 flex items-center gap-3">
                              {showRefund ? (
                                <button onClick={() => requestRefund(o.id)}
                                  className="flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-destructive/90">
                                  <RefreshCw className="h-3.5 w-3.5" /> Solicitar Reembolso
                                </button>
                              ) : countdown ? (
                                <div className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 px-3 py-2 text-xs text-[hsl(var(--warning))]">
                                  <Timer className="h-3.5 w-3.5" />
                                  Reembolso em <span className="font-bold">{countdown}</span>
                                </div>
                              ) : null}
                            </div>

                            {/* ROBUX: Gamepass */}
                            {category === "robux" && o.status !== "cancelado" && (
                              <div className="mt-5">
                                {!paid ? (
                                  <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-4">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-[hsl(var(--warning))]" />
                                    <div>
                                      <p className="text-sm font-bold text-[hsl(var(--warning))]">Aguardando pagamento</p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">Realize o pagamento para enviar o link do gamepass.</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4">
                                    <h4 className="flex items-center gap-2 font-heading text-sm font-bold">
                                      <Link2 className="h-4 w-4 text-[hsl(var(--success))]" />
                                      Enviar Gamepass do Roblox
                                    </h4>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Crie um gamepass com o valor exato do pedido e cole o link abaixo.
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                      <input type="url" value={gamepassLink} onChange={(e) => setGamepassLink(e.target.value)}
                                        placeholder="https://www.roblox.com/game-pass/..."
                                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[hsl(var(--success))] focus:ring-2 focus:ring-[hsl(var(--success))]/20" />
                                      <button onClick={() => sendGamepassLink(o.id)} disabled={!gamepassLink.trim()}
                                        className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--success))] px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50">
                                        <Send className="h-3.5 w-3.5" /> Enviar
                                      </button>
                                    </div>

                                    {/* Tutorial */}
                                    <div className="mt-4">
                                      <p className="text-xs font-bold">Como criar um Gamepass:</p>
                                      <div className="mt-2 flex gap-2">
                                        {(["mobile", "pc"] as const).map(tab => (
                                          <button key={tab} onClick={() => setTutorialTab(tab)}
                                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                              tutorialTab === tab ? "bg-[hsl(var(--info))] text-white" : "bg-muted text-muted-foreground"
                                            }`}>
                                            {tab === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                                            {tab === "mobile" ? "Celular" : "Computador"}
                                          </button>
                                        ))}
                                      </div>
                                      <ol className="mt-3 space-y-2">
                                        {(tutorialTab === "mobile" ? ROBUX_TUTORIAL_STEPS_MOBILE : ROBUX_TUTORIAL_STEPS_PC).map((s, i) => (
                                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--info))]/10 text-[10px] font-bold text-[hsl(var(--info))]">{i + 1}</span>
                                            {s}
                                          </li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>
                                )}

                                {orderMessages.length > 0 && (
                                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
                                    <ChatMessages msgs={orderMessages} />
                                    <div ref={chatEndRef} />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* CHAT */}
                            {category === "chat" && o.status !== "cancelado" && (
                              <div className="mt-5">
                                <h4 className="flex items-center gap-2 text-sm font-bold">
                                  <MessageCircle className="h-4 w-4 text-[hsl(var(--info))]" /> Chat com a Starbuxx
                                </h4>
                                <p className="mt-1 text-xs text-muted-foreground">Converse conosco para combinar a entrega</p>
                                <div className="mt-3 flex max-h-64 min-h-[120px] flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
                                  {orderMessages.length === 0 ? (
                                    <p className="my-auto text-center text-xs text-muted-foreground">Nenhuma mensagem ainda. Envie uma para iniciar!</p>
                                  ) : <ChatMessages msgs={orderMessages} />}
                                  <div ref={chatEndRef} />
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage(o.id)} placeholder="Digite sua mensagem..."
                                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--info))] focus:ring-2 focus:ring-[hsl(var(--info))]/20" />
                                  <button onClick={() => sendMessage(o.id)} disabled={!newMessage.trim()}
                                    className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--info))] px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50">
                                    <Send className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
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
