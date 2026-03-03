import { Truck, ShieldCheck, Headphones, Zap, RefreshCw, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const advantages = [
  { icon: Zap, title: "Entrega Instantânea", description: "Receba suas moedas em minutos após a confirmação. A maioria dos pedidos é entregue em até 20 minutos." },
  { icon: ShieldCheck, title: "Pagamento Seguro", description: "Transações protegidas com criptografia SSL. Seus dados estão sempre seguros conosco." },
  { icon: Headphones, title: "Suporte no Discord", description: "Nossa comunidade de 10.000+ membros está pronta para ajudar a qualquer momento." },
  { icon: RefreshCw, title: "Garantia de Reembolso", description: "Se a entrega não for realizada, devolvemos 100% do valor pago. Compra sem risco." },
  { icon: CreditCard, title: "Pix, Cartão e Boleto", description: "Pague da forma que preferir — Pix com aprovação instantânea é o mais popular." },
  { icon: Truck, title: "Rastreamento em Tempo Real", description: "Acompanhe o status do seu pedido a cada etapa, do pagamento à entrega." },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: "easeOut" as const },
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
        <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
          Revendedor terceirizado de moedas virtuais com entrega garantida
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <adv.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold sm:text-base">{adv.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{adv.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
