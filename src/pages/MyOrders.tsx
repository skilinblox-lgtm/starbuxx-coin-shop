import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Package, Gamepad2, Clock, CheckCircle, Truck, XCircle, CreditCard, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  aguardando_pagamento: { label: "Aguardando Pagamento", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  pago: { label: "Pago", icon: CreditCard, color: "text-[hsl(210,80%,55%)]", bg: "bg-[hsl(210,80%,55%)]/10" },
  em_entrega: { label: "Em Entrega", icon: Truck, color: "text-[hsl(30,90%,55%)]", bg: "bg-[hsl(30,90%,55%)]/10" },
  entregue: { label: "Entregue", icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
  cancelado: { label: "Cancelado", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [navigate]);

  const canRefund = (order: any) => {
    if (order.status === "cancelado" || order.status === "aguardando_pagamento") return false;
    if (!order.payment_approved_at) return false;
    const approvedAt = new Date(order.payment_approved_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - approvedAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 48;
  };

  const requestRefund = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "cancelado" }).eq("id", orderId);
    if (error) { toast.error("Erro ao solicitar reembolso"); return; }
    toast.success("Reembolso solicitado! Aguarde a aprovação do admin.");
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelado" } : o));
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <Star className="h-6 w-6 fill-primary text-primary sm:h-7 sm:w-7" />
              <span className="font-heading text-lg font-bold sm:text-xl">
                Star<span className="text-gradient-gold">buxx</span>
              </span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground sm:gap-2 sm:text-sm">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Voltar
            </Link>
          </div>
        </nav>

        <div className="container px-4 py-6 sm:py-10">
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">📦 Meus Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe o status de todas as suas compras</p>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-12 flex flex-col items-center text-center sm:mt-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold sm:text-xl">Nenhum pedido ainda</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">Seus pedidos aparecerão aqui depois da sua primeira compra. É super fácil!</p>
              <Link to="/#jogos" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)]">
                <Gamepad2 className="h-4 w-4" /> Comprar Agora
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3 sm:mt-8">
              {orders.map((o) => {
                const st = statusConfig[o.status] || { label: o.status, icon: Clock, color: "text-muted-foreground", bg: "bg-muted" };
                const StatusIcon = st.icon;
                const showRefund = canRefund(o);
                return (
                  <motion.div key={o.id} layout className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${st.bg}`}>
                          <StatusIcon className={`h-5 w-5 ${st.color}`} />
                        </div>
                        <div>
                          <p className="font-heading text-sm font-bold sm:text-base">{o.game_id.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {o.quantity.toLocaleString("pt-BR")} un • Jogador: {o.game_username}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${st.bg} ${st.color}`}>
                          <StatusIcon className="h-3 w-3" /> {st.label}
                        </span>
                        <span className="font-heading text-lg font-bold text-gradient-gold">R$ {Number(o.total_price).toFixed(2)}</span>
                        {showRefund && (
                          <button
                            onClick={() => requestRefund(o.id)}
                            className="flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5"
                          >
                            <RefreshCw className="h-3 w-3" /> Solicitar Reembolso
                          </button>
                        )}
                      </div>
                    </div>
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
