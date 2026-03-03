import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Cadastro realizado! Verifique seu e-mail.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar solicitação");
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
            <span className="font-heading text-lg font-bold sm:text-xl">
              Star<span className="text-gradient-gold">Buxx</span>
            </span>
          </Link>

          <h2 className="text-center font-heading text-xl font-bold sm:text-2xl">
            {isLogin ? "Entrar" : "Criar Conta"}
          </h2>
          <p className="mt-1.5 text-center text-xs text-muted-foreground sm:mt-2 sm:text-sm">
            {isLogin ? "Acesse sua conta para acompanhar seus pedidos" : "Crie sua conta para começar a comprar"}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-muted-foreground sm:text-sm">Nome Completo</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3"
                  placeholder="Seu nome completo" />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground sm:text-sm">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3"
                placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground sm:text-sm">Senha</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3 sm:pr-12"
                  placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground sm:right-3">
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <Link to="/forgot-password" className="block text-right text-xs text-primary hover:underline sm:text-sm">
                Esqueceu a senha?
              </Link>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50 sm:py-3"
            >
              {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground sm:mt-6 sm:text-sm">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:underline">
              {isLogin ? "Cadastre-se" : "Entrar"}
            </button>
          </p>

          <div className="mt-5 flex items-center justify-center gap-4 border-t border-border pt-4 text-[10px] text-muted-foreground sm:text-xs">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-primary" /> SSL Seguro</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3 text-primary" /> 10K+ membros</span>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Auth;
