import { useState, useEffect } from "react";
import { Menu, X, User, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => { subscription.unsubscribe(); window.removeEventListener("scroll", onScroll); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
    navigate("/");
  };

  const navLinks = [
    { href: "/#jogos", label: "Jogos" },
    { href: "/brainrot", label: "Brainrot", isLink: true },
    { href: "/scripts", label: "Scripts", isLink: true },
    { href: "/#depoimentos", label: "Depoimentos" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "border-b border-border bg-card/95 shadow-sm backdrop-blur-xl" : "bg-[hsl(220,20%,10%)]/95 backdrop-blur-xl"
    }`}>
      <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
          <span className={`font-heading text-lg font-extrabold tracking-tight sm:text-xl ${scrolled ? "text-foreground" : "text-[hsl(0,0%,100%)]"}`}>
            Star<span className="text-gradient-gold">buxx</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map(item => item.isLink ? (
            <Link key={item.label} to={item.href} className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? "text-muted-foreground" : "text-[hsl(220,10%,70%)]"}`}>{item.label}</Link>
          ) : (
            <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? "text-muted-foreground" : "text-[hsl(220,10%,70%)]"}`}>{item.label}</a>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <ThemeToggle className={scrolled ? "text-foreground" : "text-[hsl(0,0%,100%)]"} />
          {user ? (
            <>
              <Link to="/my-orders" className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
                scrolled ? "border-border text-foreground hover:bg-muted" : "border-[hsl(150,15%,22%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(150,15%,15%)]"
              }`}>
                <ShoppingBag className="h-4 w-4" /> Pedidos
              </Link>
              <button onClick={handleLogout} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:px-4 sm:py-2">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
                scrolled ? "border-border text-foreground hover:bg-muted" : "border-[hsl(220,15%,25%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(220,15%,18%)]"
              }`}>
                Entrar
              </Link>
              <Link to="/auth" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:px-4 sm:py-2">
                Cadastrar
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle className={scrolled ? "text-foreground" : "text-[hsl(0,0%,100%)]"} />
          {user && (
            <Link to="/my-orders" className={scrolled ? "text-foreground" : "text-[hsl(0,0%,100%)]"}>
              <User className="h-5 w-5" />
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-1 ${scrolled ? "text-foreground" : "text-[hsl(0,0%,100%)]"}`}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-card sm:hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              <a href="/#jogos" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Jogos</a>
              <Link to="/brainrot" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Brainrot</Link>
              <Link to="/scripts" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Executor & Scripts</Link>
              <a href="/#depoimentos" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Depoimentos</a>
              <div className="border-t border-border pt-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium">
                      Meus Pedidos
                    </Link>
                    <button onClick={handleLogout} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)]">
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium">
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
