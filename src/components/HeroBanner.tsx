import { ShieldCheck, ArrowRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Moedas virtuais flutuando"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-dark/40" />
      </div>
      <div className="container relative z-10 flex min-h-[520px] flex-col items-start justify-center py-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
          <ShieldCheck className="h-4 w-4" />
          Compra 100% Segura
        </div>
        <h1 className="mt-6 max-w-2xl font-heading text-4xl font-bold leading-tight text-[hsl(0,0%,100%)] md:text-6xl">
          Seus <span className="text-gradient-gold">Robux</span> com entrega garantida!
        </h1>
        <p className="mt-4 max-w-lg text-lg text-[hsl(220,10%,70%)]">
          Compre moedas virtuais para Roblox, Clash Royale e Brawl Stars com segurança e entrega em até 48h.
        </p>
        <a
          href="#jogos"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 hover:scale-105"
        >
          Comprar Agora
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
};

export default HeroBanner;
