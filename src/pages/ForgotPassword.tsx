import { useState } from "react";
import { Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("E-mail de recuperação enviado!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-[var(--shadow-card)]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Star className="h-7 w-7 fill-primary text-primary" />
          <span className="font-heading text-xl font-bold">
            Star<span className="text-gradient-gold">buxx</span>
          </span>
        </Link>

        {sent ? (
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold">E-mail enviado!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Verifique sua caixa de entrada para redefinir sua senha.</p>
            <Link to="/auth" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar para login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-center font-heading text-2xl font-bold">Recuperar Senha</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Digite seu e-mail para receber o link de recuperação
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
            <Link to="/auth" className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar para login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
