import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Package, ShoppingCart, Users, MessageSquare, DollarSign, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tab = "orders" | "products" | "users" | "reviews";

const statusOptions = [
  { value: "aguardando_pagamento", label: "Aguardando" },
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
    setOrders(o.data || []); setProducts(p.data || []);
    setReviews(r.data || []); setProfiles(u.data || []);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === "pago") updateData.payment_approved_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!"); fetchAll();
  };

  const toggleProduct = async (id: string, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    toast.success("Produto atualizado!"); fetchAll();
  };

  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("Avaliação removida!"); fetchAll();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-dark text-[hsl(0,0%,100%)]">Carregando...</div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: "orders" as Tab, label: "Pedidos", shortLabel: "Pedidos", icon: ShoppingCart, count: orders.length },
    { id: "products" as Tab, label: "Produtos", shortLabel: "Prod.", icon: Package, count: products.length },
    { id: "users" as Tab, label: "Usuários", shortLabel: "Users", icon: Users, count: profiles.length },
    { id: "reviews" as Tab, label: "Avaliações", shortLabel: "Aval.", icon: MessageSquare, count: reviews.length },
  ];

  const totalRevenue = orders.filter(o => o.status !== "cancelado").reduce((sum, o) => sum + Number(o.total_price), 0);

  return (
    <div className="min-h-screen bg-dark">
      <nav className="border-b border-border/50 bg-dark">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <Star className="h-6 w-6 fill-primary text-primary sm:h-7 sm:w-7" />
            <span className="font-heading text-base font-bold text-[hsl(0,0%,100%)] sm:text-xl">
              Star<span className="text-gradient-gold">buxx</span>
              <span className="ml-1.5 text-xs font-normal text-muted-foreground sm:text-sm"> Admin</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[hsl(0,0%,100%)] sm:gap-2 sm:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Voltar ao Site</span><span className="sm:hidden">Voltar</span>
          </Link>
        </div>
      </nav>

      <div className="container px-4 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-5">
          <div className="col-span-2 rounded-2xl border border-border bg-background p-4 sm:col-span-1 sm:p-5">
            <DollarSign className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <p className="mt-1.5 text-xl font-bold text-gradient-gold sm:mt-2 sm:text-2xl">R$ {totalRevenue.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">Receita Total</p>
          </div>
          {tabs.map(t => (
            <div key={t.id} className="rounded-2xl border border-border bg-background p-3 sm:p-5">
              <t.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              <p className="mt-1 text-xl font-bold sm:mt-2 sm:text-2xl">{t.count}</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">{t.shortLabel}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto sm:mt-8 sm:gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-surface"
              }`}
            >
              <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4 sm:mt-6">
          {tab === "orders" && (
            <div className="space-y-2 sm:space-y-3">
              {orders.map(o => (
                <div key={o.id} className="rounded-2xl border border-border bg-background p-3 sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold sm:text-base">{o.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.game_id} • {o.quantity} un • {o.game_username}
                      </p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-sm font-bold text-gradient-gold">R$ {Number(o.total_price).toFixed(2)}</span>
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground sm:px-3 sm:py-1.5 sm:text-sm"
                      >
                        {statusOptions.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground sm:py-8 sm:text-sm">Nenhum pedido ainda.</p>}
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-2 sm:space-y-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3 sm:p-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold sm:text-base">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.currency} • R$ {Number(p.price_per_unit).toFixed(2)}/un</p>
                  </div>
                  <button
                    onClick={() => toggleProduct(p.id, p.active)}
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-bold sm:px-4 sm:py-1.5 sm:text-xs ${p.active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-2 sm:space-y-3">
              {profiles.map(u => (
                <div key={u.id} className="rounded-2xl border border-border bg-background p-3 sm:p-5">
                  <p className="text-sm font-bold sm:text-base">{u.full_name || "Sem nome"}</p>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">
                    ID: {u.user_id?.slice(0, 8)}... • {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
              {profiles.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground sm:py-8 sm:text-sm">Nenhum usuário ainda.</p>}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-2 sm:space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-3 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <p className="text-sm font-bold sm:text-base">{r.author_name}</p>
                      {r.is_fake && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary sm:px-2 sm:text-xs">Fake</span>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground sm:mt-1 sm:text-sm">{r.game_id} • {"⭐".repeat(r.rating)}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.comment}</p>
                  </div>
                  <button onClick={() => deleteReview(r.id)} className="flex-shrink-0 text-xs text-destructive hover:underline">Remover</button>
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
