import { ShieldCheck, ArrowRight, Star, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-14 sm:pt-16">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBanner} alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      </div>

      <div className="container relative z-10 flex min-h-[420px] flex-col justify-center px-4 py-12 sm:min-h-[500px] sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--success))] sm:px-4 sm:py-1.5 sm:text-sm">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Compra 100% Segura
          </div>
          <h1 className="mt-5 font-heading text-3xl font-extrabold leading-[1.1] text-foreground sm:text-4xl md:text-5xl lg:text-[3.5rem]">
            Seus <span className="text-gradient-gold">Robux</span> com{"\n"}entrega garantida!
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Compre moedas virtuais para Roblox, Clash Royale e Brawl Stars com segurança e entrega em até 48h.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:gap-5 sm:text-sm">
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
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:px-8 sm:py-4 sm:text-base"
          >
            Comprar Agora
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
