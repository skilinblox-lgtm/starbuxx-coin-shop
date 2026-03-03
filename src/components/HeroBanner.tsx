import { ShieldCheck, ArrowRight, Star, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-14 sm:pt-16">
      <div className="container relative z-10 flex min-h-[400px] flex-col items-center justify-center px-4 py-10 sm:min-h-[480px] sm:flex-row sm:justify-between sm:py-14">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--success))] sm:px-4 sm:py-1.5 sm:text-sm">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Compra 100% Segura • Revendedor Autorizado
          </div>
          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl">
            Suas moedas com{" "}
            <span className="text-gradient-gold">entrega garantida</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
            Compre Robux, Gemas e Moedas para seus jogos favoritos de forma rápida, segura e com garantia de reembolso.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start sm:gap-5 sm:text-sm">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[hsl(var(--warning))]" /> Entrega em até 20 min</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-primary fill-primary" /> +5.000 entregas</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-[hsl(var(--info))]" /> 10K no Discord</span>
          </div>
          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            href="#jogos"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:mt-8 sm:px-8 sm:py-3.5 sm:text-base"
          >
            Comprar Agora
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.a>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mt-0"
        >
          <img
            src={heroBanner}
            alt="Starbuxx - Moedas de jogos"
            className="h-56 w-auto object-contain drop-shadow-2xl sm:h-72 lg:h-80"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
