import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Star className="h-7 w-7 fill-primary text-primary" />
          <span className="font-heading text-xl font-bold">
            Star<span className="text-gradient-gold">buxx</span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#jogos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Jogos
          </a>
          <a href="#vantagens" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Vantagens
          </a>
          <a href="#depoimentos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Depoimentos
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface">
            Entrar
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110">
            Cadastrar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
