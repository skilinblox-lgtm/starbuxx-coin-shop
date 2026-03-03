import { useState, useEffect } from "react";
import { Star, Menu, X, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
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
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-dark/95 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
          <Star className="h-6 w-6 fill-primary text-primary sm:h-7 sm:w-7" />
          <span className="font-heading text-lg font-bold text-[hsl(0,0%,100%)] sm:text-xl">
            Star<span className="text-gradient-gold">buxx</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          <a href="/#jogos" className="text-sm font-medium text-[hsl(220,10%,70%)] transition-colors hover:text-[hsl(0,0%,100%)]">Jogos</a>
          <a href="/#vantagens" className="text-sm font-medium text-[hsl(220,10%,70%)] transition-colors hover:text-[hsl(0,0%,100%)]">Vantagens</a>
          <a href="/#depoimentos" className="text-sm font-medium text-[hsl(220,10%,70%)] transition-colors hover:text-[hsl(0,0%,100%)]">Depoimentos</a>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <SearchBar />
          {user ? (
            <>
              <Link to="/my-orders" className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-[hsl(0,0%,100%)] transition-colors hover:bg-surface/10 sm:px-4 sm:py-2">
                Meus Pedidos
              </Link>
              <button onClick={handleLogout} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:px-4 sm:py-2">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-[hsl(0,0%,100%)] transition-colors hover:bg-surface/10 sm:px-4 sm:py-2">
                Entrar
              </Link>
              <Link to="/auth" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:px-4 sm:py-2">
                Cadastrar
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 sm:hidden">
          <SearchBar />
          {user && (
            <Link to="/my-orders" className="text-[hsl(0,0%,100%)]">
              <User className="h-5 w-5" />
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[hsl(0,0%,100%)] p-1">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border/50 bg-dark sm:hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              <a href="/#jogos" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-[hsl(220,10%,70%)] hover:text-[hsl(0,0%,100%)]">Jogos</a>
              <a href="/#vantagens" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-[hsl(220,10%,70%)] hover:text-[hsl(0,0%,100%)]">Vantagens</a>
              <a href="/#depoimentos" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-[hsl(220,10%,70%)] hover:text-[hsl(0,0%,100%)]">Depoimentos</a>
              <div className="border-t border-border/50 pt-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-[hsl(0,0%,100%)]">
                      Meus Pedidos
                    </Link>
                    <button onClick={handleLogout} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)]">
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-[hsl(0,0%,100%)]">
                      Entrar
                    </Link>
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)]">
                      Cadastrar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
