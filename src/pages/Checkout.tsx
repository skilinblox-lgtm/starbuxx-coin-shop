import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Star, ShieldCheck, ArrowLeft, ChevronRight, ChevronLeft, Clock, Lock, User, CreditCard, CheckCircle, Truck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import iconPix from "@/assets/icon-pix.png";
import iconCard from "@/assets/icon-card.png";
import iconBoleto from "@/assets/icon-boleto.png";

const STEPS = [
  { id: 1, label: "Dados", icon: User },
  { id: 2, label: "Pagamento", icon: CreditCard },
  { id: 3, label: "Confirmação", icon: CheckCircle },
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state as {
    gameId: string; gameName: string; currency: string;
    quantity: number; pricePerUnit: number; totalPrice: number;
    productId?: string; imageUrl?: string;
  } | null;

  const [step, setStep] = useState(1);
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

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const canAdvance = () => {
    if (step === 1) return fullName.trim() && cpf.replace(/\D/g, "").length === 11 && gameUsername.trim() && email.trim();
    if (step === 2) return !!paymentMethod;
    return true;
  };

  const handleSubmit = async () => {
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
    { id: "pix", label: "Pix", icon: iconPix, desc: "Aprovação instantânea", badge: "Recomendado" },
    { id: "cartao", label: "Cartão de Crédito/Débito", icon: iconCard, desc: "Visa, Master, Elo e mais", badge: null },
    { id: "boleto", label: "Boleto Bancário", icon: iconBoleto, desc: "Até 3 dias úteis", badge: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <Star className="h-6 w-6 fill-primary text-primary sm:h-7 sm:w-7" />
            <span className="font-heading text-lg font-bold sm:text-xl">
              Star<span className="text-gradient-gold">buxx</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--success))] sm:text-sm">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Checkout Seguro</span>
          </div>
        </div>
      </nav>

      <div className="container max-w-3xl px-4 py-6 sm:py-10">
        {/* Back */}
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5" /> {step > 1 ? "Voltar" : "Voltar à loja"}
        </button>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                step >= s.id
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "bg-muted text-muted-foreground"
              }`}>
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-16 ${step > s.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Product summary */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            {order.imageUrl ? (
              <img src={order.imageUrl} alt={order.gameName} className="h-12 w-12 rounded-xl object-contain sm:h-14 sm:w-14" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-xl font-bold text-primary">
                {order.gameName[0]}
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-heading text-sm font-bold sm:text-base">{order.gameName}</h2>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-3 w-3" />
                <span>Entrega: até 20 min</span>
                <span className="text-border">|</span>
                <span>{order.quantity.toLocaleString("pt-BR")} un</span>
              </div>
            </div>
            <span className="font-heading text-base font-bold text-gradient-gold sm:text-lg">R$ {order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Steps content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h3 className="font-heading text-base font-bold sm:text-lg">Dados Pessoais</h3>
              <p className="mt-1 text-xs text-muted-foreground">Preencha seus dados para prosseguir</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: "Nome Completo", value: fullName, onChange: setFullName, type: "text", placeholder: "Seu nome completo" },
                  { label: "CPF", value: cpf, onChange: (v: string) => setCpf(formatCPF(v)), type: "text", placeholder: "000.000.000-00" },
                  { label: "Usuário no Jogo", value: gameUsername, onChange: setGameUsername, type: "text", placeholder: "Seu nome no jogo" },
                  { label: "E-mail", value: email, onChange: setEmail, type: "email", placeholder: "seu@email.com" },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                    <input type={field.type} value={field.value} onChange={e => field.onChange(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h3 className="font-heading text-base font-bold sm:text-lg">Método de Pagamento</h3>
              <p className="mt-1 text-xs text-muted-foreground">Escolha como deseja pagar</p>
              <div className="mt-5 space-y-3">
                {paymentMethods.map(pm => (
                  <button type="button" key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      paymentMethod === pm.id ? "border-primary bg-primary/5 shadow-[var(--shadow-gold)]" : "border-border hover:border-primary/30"
                    }`}>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === pm.id ? "border-primary" : "border-muted-foreground/30"
                    }`}>
                      {paymentMethod === pm.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <img src={pm.icon} alt={pm.label} className="h-8 w-8 object-contain" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{pm.label}</p>
                        {pm.badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{pm.badge}</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{pm.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                <h3 className="font-heading text-base font-bold sm:text-lg">Resumo do Pedido</h3>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    { label: "Produto", value: order.gameName },
                    { label: "Quantidade", value: order.quantity.toLocaleString("pt-BR") },
                    { label: "Usuário no jogo", value: gameUsername },
                    { label: "Pagamento", value: paymentMethod === "pix" ? "Pix" : paymentMethod === "cartao" ? "Cartão" : "Boleto" },
                    { label: "Taxa", value: "Grátis", highlight: true },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={`font-medium ${item.highlight ? "text-[hsl(var(--success))]" : ""}`}>{item.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                    <ShieldCheck className="h-5 w-5 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Compra 100% Segura</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                      Dados criptografados • Garantia de reembolso • <Link to="/reembolso" className="text-primary underline">Ver política</Link>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium transition-all hover:border-primary/40">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-40 sm:py-4">
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50 sm:py-4 sm:text-base">
              {loading ? "Processando..." : "Finalizar Compra"}
              {!loading && <Lock className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Security footer */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground sm:text-xs">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL Seguro</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Dados Protegidos</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Entrega Rápida</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 10K+ Discord</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
