import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const statusLabels: Record<string, { label: string; color: string }> = {
  aguardando_pagamento: { label: "Aguardando", color: "bg-primary/10 text-primary" },
  pago: { label: "Pago", color: "bg-[hsl(210,80%,55%)]/10 text-[hsl(210,80%,55%)]" },
  em_entrega: { label: "Em Entrega", color: "bg-[hsl(30,90%,55%)]/10 text-[hsl(30,90%,55%)]" },
  entregue: { label: "Entregue", color: "bg-[hsl(140,60%,45%)]/10 text-[hsl(140,60%,45%)]" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive" },
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
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
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Meus Pedidos</h1>

          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
          ) : orders.length === 0 ? (
            <div className="mt-12 flex flex-col items-center text-center sm:mt-16">
              <Package className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
              <h3 className="mt-3 font-heading text-lg font-bold sm:mt-4 sm:text-xl">Nenhum pedido ainda</h3>
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
                    className="rounded-2xl border border-border bg-card"
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
