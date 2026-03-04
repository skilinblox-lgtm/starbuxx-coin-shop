import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck, ArrowLeft, ChevronRight, ChevronLeft, Lock, User,
  CreditCard, CheckCircle, Truck, Users, HelpCircle, Play, Gamepad2,
  QrCode, Landmark, Zap, Sparkles, BadgeCheck, Shield, Clock, Server,
  Copy, RefreshCw, Loader2
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

  // PIX payment state
  const [pixData, setPixData] = useState<{ qrCode?: string; qrCodeBase64?: string; copyPaste?: string; transactionId?: string; orderId?: string } | null>(null);
  const [pixStatus, setPixStatus] = useState<"idle" | "generating" | "waiting" | "confirmed" | "error">("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!order) { navigate("/"); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setFullName(session.user.user_metadata?.full_name || "");
      } else {
        toast.error("Você precisa estar logado para acessar o checkout.");
        navigate("/auth");
      }
    });
  }, [order, navigate]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // Poll for payment status
  const startPolling = (orderId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const { data: orderData } = await supabase.from("orders").select("status").eq("id", orderId).single();
        if (orderData?.status === "pago") {
          setPixStatus("confirmed");
          if (pollRef.current) clearInterval(pollRef.current);
          toast.success("Pagamento confirmado! 🎉");
          setTimeout(() => navigate("/my-orders"), 3000);
        }
      } catch {}
    }, 5000); // Check every 5 seconds
  };

  if (!order) return null;

  const getPaymentStepIndex = () => (isRobux || isBrainrot) ? 3 : 2;
  const getConfirmStepIndex = () => (isRobux || isBrainrot) ? 4 : 3;

  const canAdvance = () => {
    if (step === 1) return fullName.trim() && gameUsername.trim() && discord.trim();
    if (isRobux && step === 2) return knowsGamepass !== null;
    if (isBrainrot && step === 2) return true;
    if (step === getPaymentStepIndex()) return !!paymentMethod;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Você precisa estar logado para comprar."); navigate("/auth"); return; }
    setLoading(true);
    try {
      // Create the order
      const { data: newOrder, error } = await supabase.from("orders").insert({
        user_id: user.id, game_id: order.gameId, quantity: order.quantity,
        total_price: order.totalPrice, payment_method: paymentMethod,
        game_username: gameUsername, full_name: fullName, cpf: "N/A", discord_username: discord,
        product_id: (!isBrainrot && order.productId && order.productId.length > 10) ? order.productId : null,
      }).select().single();
      if (error) throw error;

      toast.success("Pedido criado! Gerando PIX...");

      // Generate PIX QR Code
      setPixStatus("generating");
      try {
        const { data: pixResult, error: pixError } = await supabase.functions.invoke("pix-create", {
          body: { orderId: newOrder.id },
        });

        if (pixError) throw pixError;

        if (pixResult?.success) {
          setPixData({
            qrCode: pixResult.qrCode,
            qrCodeBase64: pixResult.qrCodeBase64,
            copyPaste: pixResult.copyPaste,
            transactionId: pixResult.transactionId,
            orderId: newOrder.id,
          });
          setPixStatus("waiting");
          startPolling(newOrder.id);
        } else {
          throw new Error(pixResult?.error || "Erro ao gerar PIX");
        }
      } catch (pixErr: any) {
        console.error("PIX generation error:", pixErr);
        setPixStatus("error");
        toast.error("PIX gerado com erro. Vá em Meus Pedidos para tentar novamente.");
        // Still redirect since order was created
        setTimeout(() => navigate("/my-orders"), 3000);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pedido");
      setPixStatus("idle");
    } finally { setLoading(false); }
  };

  const paymentMethods = [
    { id: "pix", label: "Pix", icon: QrCode, desc: "Aprovação instantânea", badge: "⚡ Instantâneo", badgeColor: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]", disabled: false },
    { id: "cartao", label: "Cartão de Crédito", icon: CreditCard, desc: "Em manutenção — disponível em breve", badge: "🔧 Manutenção", badgeColor: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", disabled: true },
    { id: "boleto", label: "Boleto Bancário", icon: Landmark, desc: "Em manutenção — disponível em breve", badge: "🔧 Manutenção", badgeColor: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]", disabled: true },
  ];

  const isPaymentStep = step === getPaymentStepIndex();
  const isConfirmStep = step === getConfirmStepIndex();
  const isGamepassStep = isRobux && step === 2;
  const isBrainrotDeliveryStep = isBrainrot && step === 2;

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

              {/* Brainrot delivery step */}
              {isBrainrotDeliveryStep && (
                <motion.div key="brainrot-delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white">Como funciona a entrega</h3>
                  </div>
                  <p className="text-sm text-white/40 mb-6 ml-[42px]">Entenda o processo de entrega do seu Brainrot</p>

                  <div className="space-y-4">
                    {[
                      { icon: Clock, title: "Prazo", desc: "Entrega em até 24h com vendedor online. Em alta demanda, pode levar até 48h.", color: "text-primary", bg: "bg-primary/10" },
                      { icon: Users, title: "Adicionamos como amigo", desc: "Um vendedor irá adicionar você como amigo no jogo para realizar a transferência.", color: "text-[hsl(210,85%,65%)]", bg: "bg-[hsl(210,85%,65%)]/10" },
                      { icon: Server, title: "Servidor privado", desc: "Entramos em um servidor privado com você para garantir total segurança.", color: "text-[hsl(270,80%,72%)]", bg: "bg-[hsl(270,80%,72%)]/10" },
                      { icon: Shield, title: "100% seu", desc: "Transferimos o brainrot da nossa base para a sua. Processo seguro e garantido.", color: "text-[hsl(145,70%,45%)]", bg: "bg-[hsl(145,70%,45%)]/10" },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${step.bg}`}>
                          <step.icon className={`h-5 w-5 ${step.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{step.title}</p>
                          <p className="mt-0.5 text-xs text-white/40">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="text-xs text-white/50">
                      <span className="font-bold text-white">Fique tranquilo!</span> Ao confirmar a compra, nosso time já será notificado para iniciar a entrega.
                    </p>
                  </div>
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
                      <button type="button" key={pm.id}
                        onClick={() => !pm.disabled && setPaymentMethod(pm.id)}
                        disabled={pm.disabled}
                        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                          pm.disabled
                            ? "border-white/[0.04] opacity-40 cursor-not-allowed"
                            : paymentMethod === pm.id
                            ? "border-primary bg-primary/[0.04] shadow-[0_0_30px_hsl(var(--primary)/0.08)]"
                            : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]"
                        }`}>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                          pm.disabled ? "bg-white/[0.03] text-white/20" : paymentMethod === pm.id ? "bg-primary text-[hsl(var(--dark))]" : "bg-white/[0.05] text-white/30"
                        }`}>
                          <pm.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${pm.disabled ? "text-white/40" : "text-white"}`}>{pm.label}</p>
                            {pm.badge && <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${pm.badgeColor}`}>{pm.badge}</span>}
                          </div>
                          <p className="text-xs text-white/35 mt-0.5">{pm.desc}</p>
                        </div>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                          pm.disabled ? "border-white/10" : paymentMethod === pm.id ? "border-primary bg-primary" : "border-white/15"
                        }`}>
                          {!pm.disabled && paymentMethod === pm.id && <CheckCircle className="h-3 w-3 text-[hsl(var(--dark))]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Confirmation step */}
              {isConfirmStep && pixStatus === "idle" && (
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

              {/* PIX Payment Screen */}
              {isConfirmStep && (pixStatus === "generating" || pixStatus === "waiting" || pixStatus === "confirmed") && (
                <motion.div key="pix-payment" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
                  
                  {pixStatus === "generating" && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="mt-4 text-sm font-bold text-white">Gerando QR Code PIX...</p>
                      <p className="mt-1 text-xs text-white/40">Aguarde um momento</p>
                    </div>
                  )}

                  {pixStatus === "waiting" && pixData && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                          <QrCode className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mt-3 font-heading text-lg font-bold text-white">Pague via PIX</h3>
                        <p className="mt-1 text-xs text-white/40">Escaneie o QR Code ou copie o código abaixo</p>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center">
                        {pixData.qrCodeBase64 ? (
                          <div className="rounded-2xl border-2 border-white/10 bg-white p-4">
                            <img src={pixData.qrCodeBase64.startsWith("data:") ? pixData.qrCodeBase64 : `data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" className="h-48 w-48" />
                          </div>
                        ) : pixData.qrCode ? (
                          <div className="rounded-2xl border-2 border-white/10 bg-white p-4">
                            <img src={pixData.qrCode} alt="QR Code PIX" className="h-48 w-48" />
                          </div>
                        ) : null}
                      </div>

                      {/* Copy paste code */}
                      {pixData.copyPaste && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-white/50 text-center">Copia e Cola</p>
                          <div className="relative">
                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 pr-14 overflow-hidden">
                              <p className="text-xs text-white/60 font-mono break-all line-clamp-3">{pixData.copyPaste}</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(pixData.copyPaste!);
                                toast.success("Código PIX copiado!");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-[hsl(var(--dark))] hover:brightness-110"
                            >
                              <Copy className="h-3 w-3" /> Copiar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Value */}
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                        <p className="text-xs text-white/40">Valor a pagar</p>
                        <p className="font-heading text-2xl font-bold text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</p>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/5 py-3">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-[hsl(var(--warning))]" />
                        <span className="text-xs font-bold text-[hsl(var(--warning))]">Aguardando pagamento...</span>
                      </div>
                      <p className="text-center text-[10px] text-white/25">O status será atualizado automaticamente após a confirmação do pagamento</p>
                    </div>
                  )}

                  {pixStatus === "confirmed" && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--success))]/10 ring-4 ring-[hsl(var(--success))]/20">
                          <CheckCircle className="h-10 w-10 text-[hsl(var(--success))]" />
                        </div>
                      </motion.div>
                      <h3 className="font-heading text-xl font-bold text-white">Pagamento Confirmado! 🎉</h3>
                      <p className="text-sm text-white/40 text-center">Seu pagamento foi recebido. A entrega será processada em breve.</p>
                      <p className="text-xs text-white/25">Redirecionando para Meus Pedidos...</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* PIX Error */}
              {isConfirmStep && pixStatus === "error" && (
                <motion.div key="pix-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldCheck className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Erro ao gerar PIX</h3>
                  <p className="text-xs text-white/40">Seu pedido foi criado. Acesse Meus Pedidos para acompanhar.</p>
                  <p className="text-xs text-white/25">Redirecionando...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-6 flex gap-3">
              {step > 1 && pixStatus === "idle" && (
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
              ) : pixStatus === "idle" ? (
                <button onClick={handleSubmit} disabled={loading}
                  className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-4 text-sm font-bold text-[hsl(var(--dark))] transition-all hover:brightness-110 hover:shadow-[var(--shadow-gold)] disabled:opacity-50 sm:text-base">
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</> : <>Pagar com PIX <QrCode className="h-4 w-4" /></>}
                  </span>
                </button>
              ) : null}
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
