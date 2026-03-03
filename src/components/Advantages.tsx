import { Truck, ShieldCheck, Headphones } from "lucide-react";

const advantages = [
  {
    icon: Truck,
    title: "Entrega em até 48h",
    description: "Receba suas moedas de forma rápida e garantida após a confirmação do pagamento.",
  },
  {
    icon: ShieldCheck,
    title: "Pagamento Seguro",
    description: "Transações protegidas com certificado SSL e gateway de pagamento confiável.",
  },
  {
    icon: Headphones,
    title: "Suporte Online",
    description: "Equipe disponível para ajudar com suas dúvidas e acompanhar sua entrega.",
  },
];

const Advantages = () => {
  return (
    <section id="vantagens" className="bg-background py-20">
      <div className="container">
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">
          Por que escolher a <span className="text-gradient-gold">Starbuxx</span>?
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {advantages.map((adv) => (
            <div
              key={adv.title}
              className="group rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-[var(--shadow-gold)]"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <adv.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-bold">{adv.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {adv.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
