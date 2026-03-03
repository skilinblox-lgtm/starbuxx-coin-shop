import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Star, ShieldCheck, ArrowLeft, ChevronRight, ChevronLeft, Clock, Lock, User,
  CreditCard, CheckCircle, Truck, Users, HelpCircle, Play, Gamepad2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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

  const isRobux = order?.gameId?.toLowerCase() === "roblox" || order?.gameId?.toLowerCase().includes("robux");

  const STEPS = isRobux
    ? [
        { id: 1, label: "Dados", icon: User },
        { id: 2, label: "Gamepass", icon: Gamepad2 },
        { id: 3, label: "Pagamento", icon: CreditCard },
        { id: 4, label: "Confirmação", icon: CheckCircle },
      ]
    : [
        { id: 1, label: "Dados", icon: User },
        { id: 2, label: "Pagamento", icon: CreditCard },
        { id: 3, label: "Confirmação", icon: CheckCircle },
      ];

  const totalSteps = STEPS.length;

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [gameUsername, setGameUsername] = useState("");
  const [discord, setDiscord] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [knowsGamepass, setKnowsGamepass] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!order) { navigate("/"); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setFullName(session.user.user_metadata?.full_name || "");
      }
    });
  }, [order, navigate]);

  if (!order) return null;

  const formatCPF = (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  const getPaymentStepIndex = () => isRobux ? 3 : 2;
  const getConfirmStepIndex = () => isRobux ? 4 : 3;

  const canAdvance = () => {
    if (step === 1) return fullName.trim() && cpf.replace(/\D/g, "").length === 11 && gameUsername.trim() && discord.trim();
    if (isRobux && step === 2) return knowsGamepass !== null;
    if (step === getPaymentStepIndex()) return !!paymentMethod;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Você precisa estar logado para comprar."); navigate("/auth"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id, game_id: order.gameId, quantity: order.quantity,
        total_price: order.totalPrice, payment_method: paymentMethod,
        game_username: gameUsername, full_name: fullName, cpf, discord_username: discord,
        product_id: order.productId || null,
      });
      if (error) throw error;
      toast.success("Pedido criado! Entre no nosso Discord para suporte.");
      navigate("/my-orders");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pedido");
    } finally { setLoading(false); }
  };

  const paymentMethods = [
    { id: "pix", label: "Pix", icon: iconPix, desc: "Aprovação instantânea", badge: "Recomendado", badgeColor: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
    { id: "cartao", label: "Cartão de Crédito/Débito", icon: iconCard, desc: "Visa, Master, Elo e mais", badge: null, badgeColor: "" },
    { id: "boleto", label: "Boleto Bancário", icon: iconBoleto, desc: "Até 3 dias úteis", badge: null, badgeColor: "" },
  ];

  const isPaymentStep = step === getPaymentStepIndex();
  const isConfirmStep = step === getConfirmStepIndex();
  const isGamepassStep = isRobux && step === 2;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5">
            <Star className="h-6 w-6 fill-primary text-primary" />
            <span className="font-heading text-lg font-bold">Star<span className="text-gradient-gold">buxx</span></span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--success))] sm:text-sm">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Checkout Seguro</span>
          </div>
        </div>
      </nav>

      <div className="container max-w-3xl px-4 py-6 sm:py-10">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> {step > 1 ? "Voltar" : "Voltar à loja"}
        </button>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
                step >= s.id
                  ? "bg-[hsl(var(--success))] text-white shadow-sm"
                  : step === s.id - 1
                  ? "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]"
                  : "bg-muted text-muted-foreground"
              }`}>
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-6 sm:w-12 ${step > s.id ? "bg-[hsl(var(--success))]" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Product summary */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            {order.imageUrl ? (
              <img src={order.imageUrl} alt={order.gameName} className="h-12 w-12 rounded-xl object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-xl font-bold text-primary">{order.gameName[0]}</div>
            )}
            <div className="flex-1">
              <h2 className="font-heading text-sm font-bold sm:text-base">{order.gameName}</h2>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-3 w-3" /> Entrega: até 20 min
                <span className="text-border">|</span>
                {order.quantity.toLocaleString("pt-BR")} un
              </div>
            </div>
            <span className="font-heading text-base font-bold text-gradient-gold sm:text-lg">R$ {order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Dados */}
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
                  { label: "Discord", value: discord, onChange: setDiscord, type: "text", placeholder: "usuario#0000 ou @usuario" },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                    <input type={field.type} value={field.value} onChange={e => field.onChange(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-[hsl(var(--info))] focus:ring-2 focus:ring-[hsl(var(--info))]/20"
                      placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Gamepass step (Robux only) */}
          {isGamepassStep && (
            <motion.div key="gamepass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h3 className="flex items-center gap-2 font-heading text-base font-bold sm:text-lg">
                <HelpCircle className="h-5 w-5 text-[hsl(var(--info))]" />
                Você sabe criar Gamepass no Roblox?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Para receber seus Robux, você precisará criar um Gamepass no Roblox com o valor do pedido.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => setKnowsGamepass(true)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
                    knowsGamepass === true ? "border-[hsl(var(--success))] bg-[hsl(var(--success))]/5" : "border-border hover:border-[hsl(var(--success))]/40"
                  }`}>
                  <CheckCircle className={`h-8 w-8 ${knowsGamepass === true ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`} />
                  <span className="text-sm font-bold">Sim, eu sei!</span>
                  <span className="text-[10px] text-muted-foreground">Ir para o pagamento</span>
                </button>
                <button onClick={() => setKnowsGamepass(false)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
                    knowsGamepass === false ? "border-[hsl(var(--info))] bg-[hsl(var(--info))]/5" : "border-border hover:border-[hsl(var(--info))]/40"
                  }`}>
                  <Play className={`h-8 w-8 ${knowsGamepass === false ? "text-[hsl(var(--info))]" : "text-muted-foreground"}`} />
                  <span className="text-sm font-bold">Não, me ensine</span>
                  <span className="text-[10px] text-muted-foreground">Assistir tutorial</span>
                </button>
              </div>

              {knowsGamepass === false && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 overflow-hidden">
                  <div className="rounded-xl border border-[hsl(var(--info))]/20 bg-[hsl(var(--info))]/5 p-4">
                    <h4 className="text-sm font-bold text-[hsl(var(--info))]">Tutorial: Como criar Gamepass</h4>
                    <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border">
                      <video className="h-full w-full object-cover" controls preload="metadata" playsInline>
                        <source src="/videos/starbuxx-promo.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Após assistir, clique em "Continuar" para prosseguir com o pagamento. Você poderá enviar o link do gamepass na área "Meus Pedidos".
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Payment step */}
          {isPaymentStep && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h3 className="font-heading text-base font-bold sm:text-lg">Método de Pagamento</h3>
              <p className="mt-1 text-xs text-muted-foreground">Escolha como deseja pagar</p>
              <div className="mt-5 space-y-3">
                {paymentMethods.map(pm => (
                  <button type="button" key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      paymentMethod === pm.id ? "border-[hsl(var(--success))] bg-[hsl(var(--success))]/5" : "border-border hover:border-[hsl(var(--success))]/30"
                    }`}>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === pm.id ? "border-[hsl(var(--success))]" : "border-muted-foreground/30"
                    }`}>
                      {paymentMethod === pm.id && <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success))]" />}
                    </div>
                    <img src={pm.icon} alt={pm.label} className="h-8 w-8 object-contain" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{pm.label}</p>
                        {pm.badge && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pm.badgeColor}`}>{pm.badge}</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{pm.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Confirmation step */}
          {isConfirmStep && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                <h3 className="font-heading text-base font-bold sm:text-lg">Resumo do Pedido</h3>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    { label: "Produto", value: order.gameName },
                    { label: "Quantidade", value: order.quantity.toLocaleString("pt-BR") },
                    { label: "Usuário no jogo", value: gameUsername },
                    { label: "Pagamento", value: paymentMethod === "pix" ? "Pix" : paymentMethod === "cartao" ? "Cartão" : "Boleto" },
                    { label: "Taxa", value: "Grátis", color: "text-[hsl(var(--success))]" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={`font-medium ${item.color || ""}`}>{item.value}</span>
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

              <div className="rounded-2xl border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                    <ShieldCheck className="h-5 w-5 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Compra 100% Segura</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                      Dados criptografados • Garantia de reembolso • <Link to="/reembolso" className="text-[hsl(var(--info))] underline">Ver política</Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--info))]/20 bg-[hsl(var(--info))]/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--info))]/10">
                    <Users className="h-5 w-5 text-[hsl(var(--info))]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Entre no nosso Discord</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                      Após finalizar, entre no Discord para acompanhar seu pedido e receber suporte.
                    </p>
                    <a href="https://discord.gg/lovable-dev" target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--info))] px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110">
                      Entrar no Discord
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium transition-all hover:border-foreground/20">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </button>
          )}
          {!isConfirmStep ? (
            <button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--success))] py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-40">
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--success))] py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 sm:py-4 sm:text-base">
              {loading ? "Processando..." : "Finalizar Compra"}
              {!loading && <Lock className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground sm:text-xs">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL Seguro</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Dados Protegidos</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Entrega Rápida</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
