import { Truck, ShieldCheck, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const advantages = [
  { icon: Truck, title: "Entrega em até 48h", description: "Receba suas moedas de forma rápida e garantida após a confirmação do pagamento." },
  { icon: ShieldCheck, title: "Pagamento Seguro", description: "Transações protegidas com certificado SSL e gateway de pagamento confiável." },
  { icon: Headphones, title: "Suporte Online", description: "Equipe disponível para ajudar com suas dúvidas e acompanhar sua entrega." },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.15, ease: "easeOut" as const },
  }),
};

const Advantages = () => {
  return (
    <section id="vantagens" className="bg-background py-12 sm:py-20">
      <div className="container px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="text-center font-heading text-2xl font-bold sm:text-3xl md:text-4xl"
        >
          Por que escolher a <span className="text-gradient-gold">Starbuxx</span>?
        </motion.h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[var(--shadow-gold)] sm:flex-col sm:items-center sm:p-8 sm:text-center"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:mx-auto sm:h-16 sm:w-16">
                <adv.icon className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold sm:mt-5 sm:text-lg">{adv.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
                  {adv.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
