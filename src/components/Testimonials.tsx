import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Lucas M.",
    game: "Roblox",
    text: "Recebi meus Robux em menos de 24h! Super confiável e fácil de usar.",
    rating: 5,
  },
  {
    name: "Ana P.",
    game: "Clash Royale",
    text: "Comprei gemas pela primeira vez e deu tudo certo. Recomendo demais!",
    rating: 5,
  },
  {
    name: "Pedro S.",
    game: "Brawl Stars",
    text: "Melhor preço que encontrei. O suporte respondeu super rápido quando tive dúvida.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="depoimentos" className="bg-surface py-20">
      <div className="container">
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">
          O que nossos <span className="text-gradient-gold">clientes</span> dizem
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                "{t.text}"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.game}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
