import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Package, MessageSquare, Send, Bot, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import PageTransition from "@/components/PageTransition";

const statusLabels: Record<string, { label: string; color: string }> = {
  aguardando_pagamento: { label: "Aguardando", color: "bg-[hsl(45,100%,51%)]/10 text-[hsl(45,100%,45%)]" },
  pago: { label: "Pago", color: "bg-[hsl(210,80%,55%)]/10 text-[hsl(210,80%,55%)]" },
  em_entrega: { label: "Em Entrega", color: "bg-[hsl(30,90%,55%)]/10 text-[hsl(30,90%,55%)]" },
  entregue: { label: "Entregue", color: "bg-[hsl(140,60%,45%)]/10 text-[hsl(140,60%,45%)]" },
  cancelado: { label: "Cancelado", color: "bg-[hsl(0,70%,55%)]/10 text-[hsl(0,70%,55%)]" },
};

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // Chat
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Realtime chat
  useEffect(() => {
    if (!chatOrderId) return;
    const channel = supabase
      .channel(`customer-chat-${chatOrderId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `order_id=eq.${chatOrderId}`,
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatOrderId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const openChat = async (orderId: string) => {
    setChatOrderId(orderId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    setChatMessages(data || []);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !chatOrderId) return;
    setSending(true);
    const msg = chatInput;
    setChatInput("");
    try {
      await supabase.from("chat_messages").insert({
        order_id: chatOrderId,
        sender_id: userId,
        sender_role: "customer",
        message: msg,
      });

      // Trigger AI response
      await supabase.functions.invoke("chat-ai", {
        body: {
          orderId: chatOrderId,
          message: msg,
          chatHistory: [...chatMessages, { sender_role: "customer", message: msg }].slice(-10),
        },
      });
    } catch (e: any) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark">
        <nav className="border-b border-border/50 bg-dark">
          <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <Star className="h-6 w-6 fill-primary text-primary sm:h-7 sm:w-7" />
              <span className="font-heading text-lg font-bold text-[hsl(0,0%,100%)] sm:text-xl">
                Star<span className="text-gradient-gold">buxx</span>
              </span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[hsl(0,0%,100%)] sm:gap-2 sm:text-sm">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Voltar
            </Link>
          </div>
        </nav>

        <div className="container px-4 py-6 sm:py-10">
          <h1 className="font-heading text-2xl font-bold text-[hsl(0,0%,100%)] sm:text-3xl">Meus Pedidos</h1>

          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
          ) : orders.length === 0 ? (
            <div className="mt-12 flex flex-col items-center text-center sm:mt-16">
              <Package className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
              <h3 className="mt-3 font-heading text-lg font-bold text-[hsl(0,0%,100%)] sm:mt-4 sm:text-xl">Nenhum pedido ainda</h3>
              <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">Seus pedidos aparecerão aqui depois da sua primeira compra.</p>
              <Link to="/#jogos" className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] sm:mt-6 sm:px-6 sm:py-3">
                Comprar Agora
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
              {orders.map((o) => {
                const st = statusLabels[o.status] || { label: o.status, color: "bg-muted text-muted-foreground" };
                return (
                  <motion.div
                    key={o.id}
                    layout
                    className="rounded-2xl border border-border bg-background shadow-[var(--shadow-card)]"
                  >
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6">
                      <div>
                        <p className="font-heading text-sm font-bold sm:text-base">{o.game_id} — {o.quantity} un</p>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                          Usuário: {o.game_username} • {new Date(o.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold sm:px-3 sm:py-1 sm:text-xs ${st.color}`}>{st.label}</span>
                        <span className="font-heading text-base font-bold text-gradient-gold sm:text-lg">R$ {Number(o.total_price).toFixed(2)}</span>
                        <button
                          onClick={() => chatOrderId === o.id ? setChatOrderId(null) : openChat(o.id)}
                          className={`rounded-lg p-2 transition-all ${chatOrderId === o.id ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline chat */}
                    <AnimatePresence>
                      {chatOrderId === o.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-border"
                        >
                          <div className="flex flex-col" style={{ height: 320 }}>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                              <div className="space-y-2">
                                {chatMessages.length === 0 && (
                                  <p className="py-8 text-center text-xs text-muted-foreground">
                                    Envie uma mensagem para falar com nosso suporte
                                  </p>
                                )}
                                {chatMessages.map(m => (
                                  <div key={m.id} className={`flex ${m.sender_role === "customer" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs sm:text-sm ${
                                      m.sender_role === "customer"
                                        ? "bg-primary text-primary-foreground"
                                        : m.sender_role === "ai"
                                        ? "bg-primary/10 text-foreground border border-primary/20"
                                        : "bg-surface text-foreground"
                                    }`}>
                                      {m.sender_role === "ai" && (
                                        <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-primary">
                                          <Bot className="h-3 w-3" /> Assistente
                                        </span>
                                      )}
                                      {m.sender_role === "admin" && (
                                        <span className="mb-1 text-[10px] font-medium text-muted-foreground">Atendente</span>
                                      )}
                                      <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown>{m.message}</ReactMarkdown>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div ref={chatEndRef} />
                              </div>
                            </div>

                            {/* Input */}
                            <div className="border-t border-border p-3">
                              <div className="flex gap-2">
                                <input
                                  value={chatInput}
                                  onChange={e => setChatInput(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                  placeholder="Digite sua mensagem..."
                                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                />
                                <button
                                  onClick={sendMessage}
                                  disabled={sending || !chatInput.trim()}
                                  className="rounded-xl bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
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
