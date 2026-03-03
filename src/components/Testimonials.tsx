import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Lucas M.", game: "Roblox", text: "Recebi meus Robux em menos de 24h! Super confiável e fácil de usar.", rating: 5 },
  { name: "Ana P.", game: "Clash Royale", text: "Comprei gemas pela primeira vez e deu tudo certo. Recomendo demais!", rating: 5 },
  { name: "Pedro S.", game: "Brawl Stars", text: "Melhor preço que encontrei. O suporte respondeu super rápido quando tive dúvida.", rating: 5 },
];

const Testimonials = () => {
  return (
    <section id="depoimentos" className="bg-surface py-20">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="text-center font-heading text-3xl font-bold md:text-4xl"
        >
          O que nossos <span className="text-gradient-gold">clientes</span> dizem
        </motion.h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.game}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
