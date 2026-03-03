import { ShieldCheck, Zap, RefreshCw, Play } from "lucide-react";
import { motion } from "framer-motion";

const PromoVideo = () => {
  return (
    <section className="bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,14%)] to-[hsl(220,20%,8%)] py-12 sm:py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Por que comprar na <span className="text-gradient-gold">Starbuxx</span>?
          </h2>
          <p className="mt-2 text-sm text-[hsl(220,10%,65%)] sm:text-base">
            Assista e descubra como funciona
          </p>
        </motion.div>

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl border border-[hsl(220,15%,20%)] shadow-2xl"
          >
            <video
              className="aspect-video w-full object-cover"
              controls
              preload="metadata"
              playsInline
              poster=""
            >
              <source src="/videos/starbuxx-promo.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                icon: Zap,
                title: "Entrega Ultra Rápida",
                desc: "Suas moedas chegam em até 20 minutos após confirmação do pagamento. Sem enrolação.",
              },
              {
                icon: ShieldCheck,
                title: "Segurança Total",
                desc: "Todas as transações são protegidas. Seus dados nunca são compartilhados com terceiros.",
              },
              {
                icon: RefreshCw,
                title: "Reembolso Garantido",
                desc: "Se algo der errado, devolvemos 100% do seu dinheiro. Compra sem risco nenhum.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-[hsl(220,15%,20%)] bg-[hsl(220,20%,12%)] p-4 sm:p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-white sm:text-base">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[hsl(220,10%,60%)] sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoVideo;
