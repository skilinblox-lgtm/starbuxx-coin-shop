import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusLabels: Record<string, { label: string; color: string }> = {
  aguardando_pagamento: { label: "Aguardando Pagamento", color: "bg-yellow-500/10 text-yellow-600" },
  pago: { label: "Pago", color: "bg-blue-500/10 text-blue-600" },
  em_entrega: { label: "Em Entrega", color: "bg-purple-500/10 text-purple-600" },
  entregue: { label: "Entregue", color: "bg-green-500/10 text-green-600" },
  cancelado: { label: "Cancelado", color: "bg-red-500/10 text-red-600" },
};

const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-dark">
      <nav className="border-b border-border/50 bg-dark">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Star className="h-7 w-7 fill-primary text-primary" />
            <span className="font-heading text-xl font-bold text-[hsl(0,0%,100%)]">
              Star<span className="text-gradient-gold">buxx</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(0,0%,100%)]">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
      </nav>

      <div className="container py-10">
        <h1 className="font-heading text-3xl font-bold text-[hsl(0,0%,100%)]">Meus Pedidos</h1>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Carregando...</p>
        ) : orders.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 font-heading text-xl font-bold text-[hsl(0,0%,100%)]">Nenhum pedido ainda</h3>
            <p className="mt-2 text-muted-foreground">Seus pedidos aparecerão aqui depois da sua primeira compra.</p>
            <Link to="/#jogos" className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[var(--shadow-gold)]">
              Comprar Agora
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((o) => {
              const st = statusLabels[o.status] || { label: o.status, color: "bg-muted text-muted-foreground" };
              return (
                <div key={o.id} className="rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-card)]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-heading font-bold">{o.game_id} — {o.quantity} un</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Usuário: {o.game_username} • {new Date(o.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.color}`}>{st.label}</span>
                      <span className="font-heading text-lg font-bold text-gradient-gold">R$ {Number(o.total_price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
