import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck, ArrowLeft, ChevronRight, ChevronLeft, Lock, User,
  CreditCard, CheckCircle, Truck, Users, HelpCircle, Play, Gamepad2,
  QrCode, Landmark, Zap, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
        { id: 4, label: "Confirmar", icon: CheckCircle },
      ]
    : [
        { id: 1, label: "Dados", icon: User },
        { id: 2, label: "Pagamento", icon: CreditCard },
        { id: 3, label: "Confirmar", icon: CheckCircle },
      ];

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
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

  const getPaymentStepIndex = () => isRobux ? 3 : 2;
  const getConfirmStepIndex = () => isRobux ? 4 : 3;

  const canAdvance = () => {
    if (step === 1) return fullName.trim() && gameUsername.trim() && discord.trim();
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
        game_username: gameUsername, full_name: fullName, cpf: "N/A", discord_username: discord,
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
    { id: "pix", label: "Pix", icon: QrCode, desc: "Aprovação instantânea", badge: "⚡ Rápido", badgeColor: "bg-primary/10 text-primary" },
    { id: "cartao", label: "Cartão", icon: CreditCard, desc: "Visa, Master, Elo e mais", badge: null, badgeColor: "" },
    { id: "boleto", label: "Boleto", icon: Landmark, desc: "Até 3 dias úteis", badge: null, badgeColor: "" },
  ];

  const isPaymentStep = step === getPaymentStepIndex();
  const isConfirmStep = step === getConfirmStepIndex();
  const isGamepassStep = isRobux && step === 2;

  return (
    <div className="min-h-screen bg-[hsl(var(--dark))]">
      {/* Gamer nav */}
      <nav className="border-b border-[hsl(var(--dark-muted))]/50 bg-[hsl(var(--dark-card))]">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="font-heading text-lg font-bold text-white">Star<span className="text-gradient-gold">Buxx</span></span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-primary sm:text-sm">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-heading font-bold tracking-wide uppercase">Checkout</span>
          </div>
        </div>
      </nav>

      <div className="container max-w-2xl px-4 py-6 sm:py-10">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="mb-6 flex items-center gap-1.5 text-xs text-[hsl(var(--dark-muted))] hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> {step > 1 ? "Voltar" : "Voltar à loja"}
        </button>

        {/* Step indicator - gamer style */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  step >= s.id
                    ? "bg-primary text-[hsl(var(--dark))] shadow-[var(--shadow-gold)]"
                    : "bg-[hsl(var(--dark-card))] text-[hsl(var(--dark-muted))] border border-[hsl(var(--dark-muted))]/20"
                }`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${step >= s.id ? "text-primary" : "text-[hsl(var(--dark-muted))]"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded-full transition-all ${step > s.id ? "bg-primary" : "bg-[hsl(var(--dark-muted))]/20"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Product summary - compact gamer card */}
        <div className="mb-6 rounded-xl border border-[hsl(var(--dark-muted))]/20 bg-[hsl(var(--dark-card))] p-4">
          <div className="flex items-center gap-3">
            {order.imageUrl ? (
              <img src={order.imageUrl} alt={order.gameName} className="h-11 w-11 rounded-lg object-contain" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">{order.gameName[0]}</div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-sm font-bold text-white truncate">{order.gameName}</h2>
              <p className="text-xs text-[hsl(var(--dark-muted))]">
                {order.quantity.toLocaleString("pt-BR")} {order.currency} • {isRobux ? "Via Gamepass" : "Entrega rápida"}
              </p>
            </div>
            <div className="text-right">
              <span className="font-heading text-lg font-bold text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Dados */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}
              className="rounded-xl border border-[hsl(var(--dark-muted))]/20 bg-[hsl(var(--dark-card))] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-base font-bold text-white">Seus Dados</h3>
              </div>
              <p className="text-xs text-[hsl(var(--dark-muted))] mb-5">Preencha para prosseguir com a compra</p>
              <div className="space-y-4">
                {[
                  { label: "Nome Completo", value: fullName, onChange: setFullName, placeholder: "Seu nome completo", icon: User },
                  { label: "Usuário no Jogo", value: gameUsername, onChange: setGameUsername, placeholder: "Seu nick no jogo", icon: Gamepad2 },
                  { label: "Discord", value: discord, onChange: setDiscord, placeholder: "usuario#0000 ou @usuario", icon: Users },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--dark-muted))]">{field.label}</label>
                    <div className="relative mt-1.5">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--dark-muted))]" />
                      <input type="text" value={field.value} onChange={e => field.onChange(e.target.value)}
                        className="w-full rounded-lg border border-[hsl(var(--dark-muted))]/20 bg-[hsl(var(--dark))] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[hsl(var(--dark-muted))]/60 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                        placeholder={field.placeholder} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Gamepass step (Robux only) */}
          {isGamepassStep && (
            <motion.div key="gamepass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}
              className="rounded-xl border border-[hsl(var(--dark-muted))]/20 bg-[hsl(var(--dark-card))] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-base font-bold text-white">Você sabe criar Gamepass?</h3>
              </div>
              <p className="text-xs text-[hsl(var(--dark-muted))] mb-5">
                Para receber Robux, você precisará criar um Gamepass com o valor do pedido.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setKnowsGamepass(true)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
                    knowsGamepass === true ? "border-primary bg-primary/5" : "border-[hsl(var(--dark-muted))]/20 hover:border-primary/40"
                  }`}>
                  <CheckCircle className={`h-7 w-7 ${knowsGamepass === true ? "text-primary" : "text-[hsl(var(--dark-muted))]"}`} />
                  <span className="text-sm font-bold text-white">Sim!</span>
                  <span className="text-[10px] text-[hsl(var(--dark-muted))]">Ir para pagamento</span>
                </button>
                <button onClick={() => setKnowsGamepass(false)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
                    knowsGamepass === false ? "border-[hsl(var(--info))] bg-[hsl(var(--info))]/5" : "border-[hsl(var(--dark-muted))]/20 hover:border-[hsl(var(--info))]/40"
                  }`}>
                  <Play className={`h-7 w-7 ${knowsGamepass === false ? "text-[hsl(var(--info))]" : "text-[hsl(var(--dark-muted))]"}`} />
                  <span className="text-sm font-bold text-white">Me ensine</span>
                  <span className="text-[10px] text-[hsl(var(--dark-muted))]">Ver tutorial</span>
                </button>
              </div>

              {knowsGamepass === false && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 overflow-hidden">
                  <div className="rounded-lg border border-[hsl(var(--info))]/20 bg-[hsl(var(--info))]/5 p-4">
                    <h4 className="text-sm font-bold text-[hsl(var(--info))]">Tutorial: Como criar Gamepass</h4>
                    <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-[hsl(var(--dark-muted))]/20">
                      <video className="h-full w-full object-cover" controls preload="metadata" playsInline>
                        <source src="/videos/starbuxx-promo.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <p className="mt-3 text-xs text-[hsl(var(--dark-muted))]">
                      Após assistir, clique em "Continuar". Você enviará o link do gamepass em "Meus Pedidos".
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Payment step */}
          {isPaymentStep && (
            <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}
              className="rounded-xl border border-[hsl(var(--dark-muted))]/20 bg-[hsl(var(--dark-card))] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-base font-bold text-white">Como quer pagar?</h3>
              </div>
              <p className="text-xs text-[hsl(var(--dark-muted))] mb-5">Escolha o método de pagamento</p>
              <div className="space-y-2.5">
                {paymentMethods.map(pm => (
                  <button type="button" key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 p-3.5 text-left transition-all ${
                      paymentMethod === pm.id ? "border-primary bg-primary/5" : "border-[hsl(var(--dark-muted))]/20 hover:border-primary/30"
                    }`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      paymentMethod === pm.id ? "bg-primary text-[hsl(var(--dark))]" : "bg-[hsl(var(--dark))] text-[hsl(var(--dark-muted))]"
                    }`}>
                      <pm.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{pm.label}</p>
                        {pm.badge && <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${pm.badgeColor}`}>{pm.badge}</span>}
                      </div>
                      <p className="text-[11px] text-[hsl(var(--dark-muted))]">{pm.desc}</p>
                    </div>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === pm.id ? "border-primary" : "border-[hsl(var(--dark-muted))]/30"
                    }`}>
                      {paymentMethod === pm.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Confirmation step */}
          {isConfirmStep && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
              <div className="rounded-xl border border-[hsl(var(--dark-muted))]/20 bg-[hsl(var(--dark-card))] p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-base font-bold text-white">Resumo</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: "Produto", value: order.gameName },
                    { label: "Quantidade", value: order.quantity.toLocaleString("pt-BR") },
                    { label: "Nick", value: gameUsername },
                    { label: "Discord", value: discord },
                    { label: "Pagamento", value: paymentMethod === "pix" ? "Pix" : paymentMethod === "cartao" ? "Cartão" : "Boleto" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-[hsl(var(--dark-muted))]">{item.label}</span>
                      <span className="font-medium text-white">{item.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-[hsl(var(--dark-muted))]/20 pt-3 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--dark-muted))]">Total</span>
                      <span className="font-heading text-xl font-bold text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discord CTA */}
              <div className="rounded-xl border border-[hsl(var(--info))]/20 bg-[hsl(var(--info))]/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--info))]/10">
                    <Users className="h-4 w-4 text-[hsl(var(--info))]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Suporte via Discord</p>
                    <p className="text-[10px] text-[hsl(var(--dark-muted))]">
                      Após a compra, entre no Discord para acompanhar seu pedido.
                    </p>
                  </div>
                  <a href="https://discord.gg/EQTankyt8R" target="_blank" rel="noopener noreferrer"
                    className="rounded-lg bg-[hsl(var(--info))] px-3 py-2 text-xs font-bold text-white transition-all hover:brightness-110">
                    Entrar
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 rounded-lg border border-[hsl(var(--dark-muted))]/20 px-5 py-3 text-sm font-medium text-[hsl(var(--dark-muted))] transition-all hover:border-primary/30 hover:text-white">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </button>
          )}
          {!isConfirmStep ? (
            <button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-[hsl(var(--dark))] transition-all hover:brightness-110 disabled:opacity-30">
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-[hsl(var(--dark))] transition-all hover:brightness-110 disabled:opacity-50 sm:py-4 sm:text-base">
              {loading ? "Processando..." : "Finalizar Compra"}
              {!loading && <Lock className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-[hsl(var(--dark-muted))]">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Seguro</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Criptografado</span>
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Rápido</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
