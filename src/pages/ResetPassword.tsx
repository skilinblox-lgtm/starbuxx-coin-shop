import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Link inválido ou expirado.");
      navigate("/auth");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      navigate("/");
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
          <span className="font-heading text-xl font-bold">
            Star<span className="text-gradient-gold">Buxx</span>
          </span>
        </Link>
        <h2 className="text-center font-heading text-2xl font-bold">Nova Senha</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nova Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Redefinir Senha"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
