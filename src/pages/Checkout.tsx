import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck, ArrowLeft, ChevronRight, ChevronLeft, Lock, User,
  CreditCard, CheckCircle, Truck, Users, HelpCircle, Play, Gamepad2,
  QrCode, Landmark, Zap, Sparkles, BadgeCheck, Shield, Clock, Server
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
  const isBrainrot = order?.gameId?.toLowerCase() === "brainrot";

  const STEPS = isRobux
    ? [
        { id: 1, label: "Dados", icon: User },
        { id: 2, label: "Gamepass", icon: Gamepad2 },
        { id: 3, label: "Pagamento", icon: CreditCard },
        { id: 4, label: "Confirmar", icon: CheckCircle },
      ]
    : isBrainrot
    ? [
        { id: 1, label: "Dados", icon: User },
        { id: 2, label: "Entrega", icon: Truck },
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

  const getPaymentStepIndex = () => (isRobux || isBrainrot) ? 3 : 2;
  const getConfirmStepIndex = () => (isRobux || isBrainrot) ? 4 : 3;

  const canAdvance = () => {
    if (step === 1) return fullName.trim() && gameUsername.trim() && discord.trim();
    if (isRobux && step === 2) return knowsGamepass !== null;
    if (isBrainrot && step === 2) return true; // just informational
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
    { id: "pix", label: "Pix", icon: QrCode, desc: "Aprovação instantânea", badge: "⚡ Instantâneo", badgeColor: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" },
    { id: "cartao", label: "Cartão de Crédito", icon: CreditCard, desc: "Visa, Mastercard, Elo e mais", badge: null, badgeColor: "" },
    { id: "boleto", label: "Boleto Bancário", icon: Landmark, desc: "Compensação em até 3 dias úteis", badge: null, badgeColor: "" },
  ];

  const isPaymentStep = step === getPaymentStepIndex();
  const isConfirmStep = step === getConfirmStepIndex();
  const isGamepassStep = isRobux && step === 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(220,20%,9%)] via-[hsl(220,20%,7%)] to-[hsl(220,20%,5%)]">
      {/* Top nav */}
      <nav className="border-b border-white/5 bg-[hsl(220,20%,8%)]/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="font-heading text-lg font-bold text-white">Star<span className="text-gradient-gold">Buxx</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              <span className="text-[11px] font-semibold text-[hsl(var(--success))]">Compra Segura</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <Lock className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-bold text-primary tracking-wide">CHECKOUT</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container max-w-3xl px-4 py-6 sm:py-10">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="mb-6 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> {step > 1 ? "Voltar" : "Voltar à loja"}
        </button>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
                  step > s.id
                    ? "bg-[hsl(var(--success))] text-white shadow-[0_0_20px_hsl(var(--success)/0.3)]"
                    : step === s.id
                    ? "bg-primary text-[hsl(var(--dark))] shadow-[var(--shadow-gold)] scale-110"
                    : "bg-white/5 text-white/25 border border-white/10"
                }`}>
                  {step > s.id ? <CheckCircle className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${
                  step > s.id ? "text-[hsl(var(--success))]" : step === s.id ? "text-primary" : "text-white/25"
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative mx-3 h-0.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={`absolute inset-y-0 left-0 rounded-full ${step > s.id ? "bg-[hsl(var(--success))]" : "bg-primary"}`}
                    initial={{ width: "0%" }}
                    animate={{ width: step > s.id ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div>
            <AnimatePresence mode="wait">
              {/* Step 1: Dados */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white">Seus Dados</h3>
                  </div>
                  <p className="text-sm text-white/40 mb-6 ml-[42px]">Informações para a entrega do pedido</p>
                  <div className="space-y-5">
                    {[
                      { label: "Nome Completo", value: fullName, onChange: setFullName, placeholder: "Seu nome completo", icon: User },
                      { label: "Usuário no Jogo", value: gameUsername, onChange: setGameUsername, placeholder: "Seu nick no jogo", icon: Gamepad2 },
                      { label: "Discord", value: discord, onChange: setDiscord, placeholder: "usuario#0000 ou @usuario", icon: Users },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="text-xs font-semibold text-white/50 mb-2 block">{field.label}</label>
                        <div className="relative group">
                          <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                          <input type="text" value={field.value} onChange={e => field.onChange(e.target.value)}
                            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                            placeholder={field.placeholder} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Gamepass step (Robux only) */}
              {isGamepassStep && (
                <motion.div key="gamepass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--info))]/10">
                      <HelpCircle className="h-4 w-4 text-[hsl(var(--info))]" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white">Você sabe criar Gamepass?</h3>
                  </div>
                  <p className="text-sm text-white/40 mb-6 ml-[42px]">
                    Para receber Robux, você precisará criar um Gamepass com o valor do pedido.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setKnowsGamepass(true)}
                      className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200 ${
                        knowsGamepass === true ? "border-primary bg-primary/5 shadow-[0_0_30px_hsl(var(--primary)/0.1)]" : "border-white/[0.08] hover:border-primary/30 hover:bg-white/[0.02]"
                      }`}>
                      <CheckCircle className={`h-8 w-8 ${knowsGamepass === true ? "text-primary" : "text-white/20"}`} />
                      <span className="text-sm font-bold text-white">Sim, sei!</span>
                      <span className="text-[11px] text-white/30">Ir para pagamento</span>
                    </button>
                    <button onClick={() => setKnowsGamepass(false)}
                      className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200 ${
                        knowsGamepass === false ? "border-[hsl(var(--info))] bg-[hsl(var(--info))]/5 shadow-[0_0_30px_hsl(var(--info)/0.1)]" : "border-white/[0.08] hover:border-[hsl(var(--info))]/30 hover:bg-white/[0.02]"
                      }`}>
                      <Play className={`h-8 w-8 ${knowsGamepass === false ? "text-[hsl(var(--info))]" : "text-white/20"}`} />
                      <span className="text-sm font-bold text-white">Me ensine</span>
                      <span className="text-[11px] text-white/30">Ver tutorial</span>
                    </button>
                  </div>

                  {knowsGamepass === false && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 overflow-hidden">
                      <div className="rounded-xl border border-[hsl(var(--info))]/15 bg-[hsl(var(--info))]/5 p-5">
                        <h4 className="text-sm font-bold text-[hsl(var(--info))]">📹 Tutorial: Como criar Gamepass</h4>
                        <div className="mt-3 aspect-video overflow-hidden rounded-xl border border-white/[0.06]">
                          <video className="h-full w-full object-cover" controls preload="metadata" playsInline>
                            <source src="/videos/starbuxx-promo.mp4" type="video/mp4" />
                          </video>
                        </div>
                        <p className="mt-3 text-xs text-white/40">
                          Após assistir, clique em "Continuar". Você enviará o link do gamepass em "Meus Pedidos".
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Payment step */}
              {isPaymentStep && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white">Forma de Pagamento</h3>
                  </div>
                  <p className="text-sm text-white/40 mb-6 ml-[42px]">Selecione como deseja pagar</p>
                  <div className="space-y-3">
                    {paymentMethods.map(pm => (
                      <button type="button" key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                          paymentMethod === pm.id
                            ? "border-primary bg-primary/[0.04] shadow-[0_0_30px_hsl(var(--primary)/0.08)]"
                            : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]"
                        }`}>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                          paymentMethod === pm.id ? "bg-primary text-[hsl(var(--dark))]" : "bg-white/[0.05] text-white/30"
                        }`}>
                          <pm.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">{pm.label}</p>
                            {pm.badge && <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${pm.badgeColor}`}>{pm.badge}</span>}
                          </div>
                          <p className="text-xs text-white/35 mt-0.5">{pm.desc}</p>
                        </div>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                          paymentMethod === pm.id ? "border-primary bg-primary" : "border-white/15"
                        }`}>
                          {paymentMethod === pm.id && <CheckCircle className="h-3 w-3 text-[hsl(var(--dark))]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Confirmation step */}
              {isConfirmStep && (
                <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-white">Resumo do Pedido</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Produto", value: order.gameName },
                        { label: "Quantidade", value: `${order.quantity.toLocaleString("pt-BR")} ${order.currency}` },
                        { label: "Nick no Jogo", value: gameUsername },
                        { label: "Discord", value: discord },
                        { label: "Pagamento", value: paymentMethod === "pix" ? "Pix" : paymentMethod === "cartao" ? "Cartão de Crédito" : "Boleto Bancário" },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between py-1">
                          <span className="text-white/40">{item.label}</span>
                          <span className="font-medium text-white">{item.value}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/[0.06] pt-4 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/40">Total</span>
                          <span className="font-heading text-2xl font-bold text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discord CTA */}
                  <div className="rounded-2xl border border-[hsl(235,86%,65%)]/15 bg-[hsl(235,86%,65%)]/[0.04] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(235,86%,65%)]/10">
                        <Users className="h-5 w-5 text-[hsl(235,86%,65%)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Suporte via Discord</p>
                        <p className="text-[11px] text-white/35">
                          Após a compra, entre no nosso Discord para acompanhar.
                        </p>
                      </div>
                      <a href="https://discord.gg/EQTankyt8R" target="_blank" rel="noopener noreferrer"
                        className="rounded-lg bg-[hsl(235,86%,65%)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 hover:shadow-[0_0_20px_hsl(235,86%,65%,0.3)]">
                        Entrar
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-3.5 text-sm font-medium text-white/50 transition-all hover:border-white/20 hover:text-white hover:bg-white/[0.03]">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
              )}
              {!isConfirmStep ? (
                <button onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-[hsl(var(--dark))] transition-all hover:brightness-110 hover:shadow-[var(--shadow-gold)] disabled:opacity-20 disabled:hover:shadow-none">
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-4 text-sm font-bold text-[hsl(var(--dark))] transition-all hover:brightness-110 hover:shadow-[var(--shadow-gold)] disabled:opacity-50 sm:text-base">
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? "Processando..." : "Finalizar Compra"}
                    {!loading && <Lock className="h-4 w-4" />}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - order summary & trust */}
          <div className="hidden lg:block space-y-4">
            {/* Order card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5 sticky top-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-4">Seu Pedido</h4>
              <div className="flex items-center gap-3 mb-4">
                {order.imageUrl ? (
                  <img src={order.imageUrl} alt={order.gameName} className="h-12 w-12 rounded-xl object-contain" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">{order.gameName[0]}</div>
                )}
                <div>
                  <p className="text-sm font-bold text-white">{order.gameName}</p>
                  <p className="text-xs text-white/35">
                    {order.quantity.toLocaleString("pt-BR")} {order.currency}
                  </p>
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-white/35">Subtotal</span>
                  <span className="text-xs text-white/60">R$ {order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="font-heading text-lg font-bold text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-3">
              {[
                { icon: ShieldCheck, text: "Garantia de reembolso", color: "text-[hsl(var(--success))]" },
                { icon: Lock, text: "Dados criptografados", color: "text-primary" },
                { icon: BadgeCheck, text: "+5.000 entregas realizadas", color: "text-[hsl(var(--info))]" },
                { icon: Zap, text: "Entrega rápida e segura", color: "text-primary" },
              ].map(t => (
                <div key={t.text} className="flex items-center gap-2.5">
                  <t.icon className={`h-4 w-4 ${t.color}`} />
                  <span className="text-xs text-white/50">{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: product summary (when on small screens) */}
        <div className="lg:hidden mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            {order.imageUrl ? (
              <img src={order.imageUrl} alt={order.gameName} className="h-11 w-11 rounded-xl object-contain" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">{order.gameName[0]}</div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-sm font-bold text-white truncate">{order.gameName}</h2>
              <p className="text-xs text-white/35">
                {order.quantity.toLocaleString("pt-BR")} {order.currency}
              </p>
            </div>
            <span className="font-heading text-lg font-bold text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-white/25">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Compra Segura</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> SSL Criptografado</span>
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" /> Revendedor Verificado</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
