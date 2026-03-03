import { ShieldCheck, ArrowRight, Star, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,14%)] to-[hsl(220,20%,8%)] pt-14 sm:pt-16">
      <div className="container relative z-10 flex min-h-[440px] flex-col items-center justify-center px-4 py-12 sm:min-h-[520px] sm:flex-row sm:justify-between sm:py-16">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(45,100%,51%)]/30 bg-[hsl(45,100%,51%)]/10 px-3 py-1 text-xs font-medium text-[hsl(45,100%,55%)] sm:px-4 sm:py-1.5 sm:text-sm">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Compra 100% Segura • Revendedor Autorizado
          </div>
          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-[hsl(0,0%,100%)] sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl">
            Suas moedas com{" "}
            <span className="text-gradient-gold">entrega garantida</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[hsl(220,10%,70%)] sm:mt-4 sm:text-base lg:text-lg">
            Compre Robux, Gemas e Moedas para seus jogos favoritos de forma rápida, segura e com garantia de reembolso.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[hsl(220,10%,65%)] sm:justify-start sm:gap-5 sm:text-sm">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[hsl(45,100%,55%)]" /> Entrega em até 20 min</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[hsl(45,100%,55%)]" /> +5.000 entregas</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-[hsl(45,100%,55%)]" /> 10K no Discord</span>
          </div>
          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            href="#jogos"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(45,100%,51%)] px-6 py-3 text-sm font-bold text-[hsl(220,20%,10%)] shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:mt-8 sm:px-8 sm:py-3.5 sm:text-base"
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
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroBanner;
