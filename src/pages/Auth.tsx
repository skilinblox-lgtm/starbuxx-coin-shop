import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Users, Lock, Zap, ShoppingCart, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.redirectTo || "/";
  const comingFromPurchase = redirectTo !== "/" && redirectTo.startsWith("/product");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate(redirectTo);
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso! Você já pode fazer login.", { duration: 6000 });
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setFullName("");
        return;
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar solicitação");
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[hsl(150,25%,7%)] via-[hsl(150,25%,5%)] to-[hsl(150,25%,4%)] px-4 py-8">
        
        {/* Background effects */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-primary/3 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-[440px]">
          {/* Purchase redirect banner */}
          <AnimatePresence>
            {comingFromPurchase && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Falta pouco para finalizar sua compra!</p>
                    <p className="mt-1 text-xs text-white/50">
                      {isLogin 
                        ? "Faça login para continuar de onde parou. Após o login, você será redirecionado automaticamente."
                        : "Crie uma conta rápida para registrar seu pedido. Após o cadastro, você voltará direto para a compra."
                      }
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-primary">
                      <CheckCircle className="h-3 w-3" />
                      <span>Redirecionamento automático após {isLogin ? "login" : "cadastro"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:p-8"
          >
            {/* Logo */}
            <Link to="/" className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
              <span className="font-heading text-xl font-bold text-white sm:text-2xl">
                Star<span className="text-gradient-gold">Buxx</span>
              </span>
            </Link>

            {/* Title */}
            <div className="text-center">
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
              </h2>
              <p className="mt-1.5 text-xs text-white/40 sm:mt-2 sm:text-sm">
                {isLogin 
                  ? "Acesse sua conta para acompanhar pedidos" 
                  : comingFromPurchase
                    ? "Cadastre-se para finalizar sua compra com segurança"
                    : "Crie sua conta gratuita e comece a comprar"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:mt-6">
              {!isLogin && (
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block">Nome Completo</label>
                  <div className="relative group">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                      placeholder="Seu nome completo" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-white/50 mb-2 block">E-mail</label>
                <div className="relative group">
                  <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                    placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 mb-2 block">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                    placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <Link to="/forgot-password" className="block text-right text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  "Processando..."
                ) : (
                  <>
                    {isLogin ? "Entrar" : "Criar Conta"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              {comingFromPurchase && !isLogin && (
                <p className="text-center text-[10px] text-white/30">
                  Ao criar sua conta, você concorda com nossos{" "}
                  <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link> e{" "}
                  <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                </p>
              )}
            </form>

            <p className="mt-5 text-center text-xs text-white/40 sm:mt-6 sm:text-sm">
              {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:underline">
                {isLogin ? "Cadastre-se" : "Entrar"}
              </button>
            </p>

            {/* Security badges */}
            <div className="mt-5 flex items-center justify-center gap-3 border-t border-white/[0.06] pt-4 sm:gap-5">
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--success))]" /> SSL Seguro
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Lock className="h-3.5 w-3.5 text-primary" /> Dados Criptografados
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Zap className="h-3.5 w-3.5 text-primary" /> 10K+ membros
              </span>
            </div>
          </motion.div>

          {/* Steps indicator for purchase flow */}
          {comingFromPurchase && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
            >
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Como funciona</p>
              <div className="flex items-center gap-2">
                {[
                  { step: "1", label: isLogin ? "Login" : "Cadastro", active: true },
                  { step: "2", label: "Dados do Pedido", active: false },
                  { step: "3", label: "Pagamento", active: false },
                  { step: "4", label: "Entrega", active: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      s.active ? "bg-primary text-primary-foreground" : "bg-white/[0.06] text-white/25"
                    }`}>
                      {s.step}
                    </div>
                    <span className={`text-[10px] font-medium ${s.active ? "text-primary" : "text-white/20"}`}>{s.label}</span>
                    {i < 3 && <div className="flex-1 h-px bg-white/[0.06]" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
