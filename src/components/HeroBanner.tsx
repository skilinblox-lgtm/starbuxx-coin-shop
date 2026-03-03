import { ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden pt-14 sm:pt-16">
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Moedas virtuais flutuando"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/85 to-dark/50 sm:via-dark/80 sm:to-dark/40" />
      </div>
      <div className="container relative z-10 flex min-h-[400px] flex-col items-start justify-center px-4 py-12 sm:min-h-[520px] sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm"
        >
          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Compra 100% Segura
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-4 max-w-2xl font-heading text-3xl font-bold leading-tight text-[hsl(0,0%,100%)] sm:mt-6 sm:text-4xl md:text-6xl"
        >
          Seus <span className="text-gradient-gold">Robux</span> com entrega garantida!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-3 max-w-lg text-sm leading-relaxed text-[hsl(220,10%,70%)] sm:mt-4 sm:text-lg"
        >
          Compre moedas virtuais para Roblox, Clash Royale e Brawl Stars com segurança e entrega em até 48h.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          href="#jogos"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:mt-8 sm:px-8 sm:py-4 sm:text-lg"
        >
          Comprar Agora
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.a>
      </div>
    </section>
  );
};

export default HeroBanner;
