import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroBrainrot from "@/assets/hero-brainrot.jpg";

const BrainrotBanner = () => {
  return (
    <section className="container px-4 py-8 sm:py-12">
      <Link to="/brainrot" className="group block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
        >
          <img
            src={heroBrainrot}
            alt="Brainrot Marketplace"
            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-52 lg:h-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-5 sm:px-8 lg:px-10">
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:text-xs">
                Marketplace
              </span>
              <h2 className="mt-2 font-heading text-xl font-bold text-[hsl(0,0%,100%)] sm:text-2xl lg:text-3xl">
                Compre seu <span className="text-gradient-gold">Brainrot</span> com segurança
              </h2>
              <p className="mt-1 max-w-sm text-xs text-[hsl(0,0%,100%)]/70 sm:text-sm">
                Rápido, fácil e 100% seguro. Entrega em até 24h com garantia total.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all group-hover:brightness-110 sm:text-sm">
                Ver Brainrots <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </section>
  );
};

export default BrainrotBanner;
