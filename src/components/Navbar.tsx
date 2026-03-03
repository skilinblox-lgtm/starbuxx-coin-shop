import { useState, useEffect } from "react";
import { Star, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-dark/95 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Star className="h-7 w-7 fill-primary text-primary" />
          <span className="font-heading text-xl font-bold text-[hsl(0,0%,100%)]">
            Star<span className="text-gradient-gold">buxx</span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="/#jogos" className="text-sm font-medium text-[hsl(220,10%,70%)] transition-colors hover:text-[hsl(0,0%,100%)]">
            Jogos
          </a>
          <a href="/#vantagens" className="text-sm font-medium text-[hsl(220,10%,70%)] transition-colors hover:text-[hsl(0,0%,100%)]">
            Vantagens
          </a>
          <a href="/#depoimentos" className="text-sm font-medium text-[hsl(220,10%,70%)] transition-colors hover:text-[hsl(0,0%,100%)]">
            Depoimentos
          </a>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar />
          {user ? (
            <>
              <Link to="/my-orders" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-[hsl(0,0%,100%)] transition-colors hover:bg-surface/10">
                Meus Pedidos
              </Link>
              <button onClick={handleLogout} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-[hsl(0,0%,100%)] transition-colors hover:bg-surface/10">
                Entrar
              </Link>
              <Link to="/auth" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110">
                Cadastrar
              </Link>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[hsl(0,0%,100%)]">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-border/50 bg-dark p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="/#jogos" onClick={() => setMobileOpen(false)} className="text-sm text-[hsl(220,10%,70%)]">Jogos</a>
            <a href="/#vantagens" onClick={() => setMobileOpen(false)} className="text-sm text-[hsl(220,10%,70%)]">Vantagens</a>
            <a href="/#depoimentos" onClick={() => setMobileOpen(false)} className="text-sm text-[hsl(220,10%,70%)]">Depoimentos</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
