import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Star, ShieldCheck, ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import iconPix from "@/assets/icon-pix.png";
import iconCard from "@/assets/icon-card.png";
import iconBoleto from "@/assets/icon-boleto.png";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state as {
    gameId: string; gameName: string; currency: string;
    quantity: number; pricePerUnit: number; totalPrice: number;
    productId?: string; imageUrl?: string;
  } | null;

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [gameUsername, setGameUsername] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!order) { navigate("/"); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setEmail(session.user.email || "");
        setFullName(session.user.user_metadata?.full_name || "");
      }
    });
  }, [order, navigate]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Você precisa estar logado para comprar."); navigate("/auth"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id, game_id: order.gameId, quantity: order.quantity,
        total_price: order.totalPrice, payment_method: paymentMethod,
        game_username: gameUsername, full_name: fullName, cpf, email,
        product_id: order.productId || null,
      });
      if (error) throw error;
      toast.success("Pedido criado com sucesso!");
      navigate("/my-orders");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pedido");
    } finally { setLoading(false); }
  };

  const paymentMethods = [
    { id: "pix", label: "Pix", icon: iconPix, desc: "Aprovação instantânea" },
    { id: "cartao", label: "Cartão de Crédito/Débito", icon: iconCard, desc: "Visa, Master, Elo e mais" },
    { id: "boleto", label: "Boleto Bancário", icon: iconBoleto, desc: "Até 3 dias úteis" },
  ];

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Clean header */}
      <nav className="border-b border-border bg-background">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <Star className="h-6 w-6 fill-primary text-primary sm:h-7 sm:w-7" />
            <span className="font-heading text-lg font-bold sm:text-xl">
              Star<span className="text-gradient-gold">buxx</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-primary sm:text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-medium">Checkout Seguro</span>
          </div>
        </div>
      </nav>

      <div className="container max-w-4xl px-4 py-6 sm:py-10">
        {/* Back link */}
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>

        {/* Product summary card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4 sm:p-5"
        >
          <div className="flex items-center gap-4">
            {order.imageUrl ? (
              <img src={order.imageUrl} alt={order.gameName} className="h-14 w-14 rounded-xl object-contain drop-shadow-lg sm:h-16 sm:w-16" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-2xl font-bold text-primary">
                {order.gameName[0]}
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-heading text-base font-bold sm:text-lg">{order.gameName}</h2>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <Clock className="h-3 w-3" />
                <span>Tempo de entrega: 20 min</span>
                <span className="text-border">|</span>
                <span>Quantidade: {order.quantity.toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:space-y-6">
          {/* Personal data */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <h3 className="font-heading text-sm font-bold sm:text-base">Dados Pessoais</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Seu nome completo" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">CPF</label>
                <input type="text" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} required
                  placeholder="000.000.000-00"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Usuário no Jogo</label>
                <input type="text" value={gameUsername} onChange={e => setGameUsername(e.target.value)} required
                  placeholder="Seu nome no jogo"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="seu@email.com"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </motion.div>

          {/* Payment method */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <h3 className="font-heading text-sm font-bold sm:text-base">Método de Pagamento</h3>
            <div className="mt-4 space-y-2.5">
              {paymentMethods.map(pm => (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === pm.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    paymentMethod === pm.id ? "border-primary" : "border-muted-foreground/30"
                  }`}>
                    {paymentMethod === pm.id && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <img src={pm.icon} alt={pm.label} className="h-8 w-8 object-contain" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{pm.label}</p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">{pm.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <h3 className="font-heading text-sm font-bold sm:text-base">Resumo do Pedido</h3>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço do pedido</span>
                <span className="font-medium">R$ {order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de pagamento</span>
                <span className="font-medium">R$ 0,00</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-base font-bold sm:text-lg">
                  <span>Total:</span>
                  <span className="text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-bold text-background shadow-lg transition-all hover:opacity-90 disabled:opacity-50 sm:py-4 sm:text-base"
            >
              {loading ? "Processando..." : "Continuar para pagamento"}
              {!loading && <ChevronRight className="h-4 w-4" />}
            </button>

            <p className="mt-3 text-center text-[10px] text-muted-foreground sm:text-xs">
              Tem um código de desconto? <button type="button" className="text-primary underline">Clique aqui</button>
            </p>
          </motion.div>

          {/* Trust footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(140,60%,45%)]/10">
                <ShieldCheck className="h-4 w-4 text-[hsl(140,60%,45%)]" />
              </div>
              <div>
                <p className="text-xs font-bold sm:text-sm">Pagamento Seguro e Protegido</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                  100% de garantia de segurança pela Starbuxx e nossa{" "}
                  <a href="#" className="text-primary underline">Política de Reembolso</a>
                </p>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
