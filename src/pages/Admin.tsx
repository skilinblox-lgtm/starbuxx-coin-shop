import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Package, ShoppingCart, Users, MessageSquare, DollarSign, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tab = "orders" | "products" | "users" | "reviews";

const statusOptions = [
  { value: "aguardando_pagamento", label: "Aguardando Pagamento" },
  { value: "pago", label: "Pago" },
  { value: "em_entrega", label: "Em Entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

const Admin = () => {
  const [tab, setTab] = useState<Tab>("orders");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Data
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
      if (!data) { toast.error("Acesso negado"); navigate("/"); return; }
      setIsAdmin(true);
      setLoading(false);
      fetchAll();
    };
    checkAdmin();
  }, [navigate]);

  const fetchAll = async () => {
    const [o, p, r, u] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("name"),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o.data || []);
    setProducts(p.data || []);
    setReviews(r.data || []);
    setProfiles(u.data || []);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === "pago") updateData.payment_approved_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    fetchAll();
  };

  const toggleProduct = async (id: string, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    toast.success("Produto atualizado!");
    fetchAll();
  };

  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("Avaliação removida!");
    fetchAll();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-dark text-[hsl(0,0%,100%)]">Carregando...</div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: "orders" as Tab, label: "Pedidos", icon: ShoppingCart, count: orders.length },
    { id: "products" as Tab, label: "Produtos", icon: Package, count: products.length },
    { id: "users" as Tab, label: "Usuários", icon: Users, count: profiles.length },
    { id: "reviews" as Tab, label: "Avaliações", icon: MessageSquare, count: reviews.length },
  ];

  const totalRevenue = orders.filter(o => o.status !== "cancelado").reduce((sum, o) => sum + Number(o.total_price), 0);

  return (
    <div className="min-h-screen bg-dark">
      <nav className="border-b border-border/50 bg-dark">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Star className="h-7 w-7 fill-primary text-primary" />
            <span className="font-heading text-xl font-bold text-[hsl(0,0%,100%)]">
              Star<span className="text-gradient-gold">buxx</span> Admin
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(0,0%,100%)]">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Site
          </Link>
        </div>
      </nav>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background p-5">
            <DollarSign className="h-5 w-5 text-primary" />
            <p className="mt-2 text-2xl font-bold text-gradient-gold">R$ {totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Receita Total</p>
          </div>
          {tabs.map(t => (
            <div key={t.id} className="rounded-2xl border border-border bg-background p-5">
              <t.icon className="h-5 w-5 text-primary" />
              <p className="mt-2 text-2xl font-bold">{t.count}</p>
              <p className="text-xs text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-surface"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {tab === "orders" && (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-bold">{o.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {o.game_id} • {o.quantity} un • {o.game_username} • {o.payment_method}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gradient-gold">R$ {Number(o.total_price).toFixed(2)}</span>
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
                      >
                        {statusOptions.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum pedido ainda.</p>}
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border bg-background p-5">
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.game_id} • {p.currency} • R$ {Number(p.price_per_unit).toFixed(2)}/un</p>
                  </div>
                  <button
                    onClick={() => toggleProduct(p.id, p.active)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold ${p.active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-3">
              {profiles.map(u => (
                <div key={u.id} className="flex items-center justify-between rounded-2xl border border-border bg-background p-5">
                  <div>
                    <p className="font-bold">{u.full_name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground">ID: {u.user_id?.slice(0, 8)}... • {new Date(u.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum usuário ainda.</p>}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-background p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{r.author_name}</p>
                      {r.is_fake && <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600">Fake</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.game_id} • {"⭐".repeat(r.rating)} • {r.comment}</p>
                  </div>
                  <button onClick={() => deleteReview(r.id)} className="text-sm text-red-500 hover:underline">Remover</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
