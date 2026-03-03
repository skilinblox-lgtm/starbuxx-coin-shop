import { ShieldCheck, Headphones, Award, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";

const TrustSection = () => {
  return (
    <section className="bg-background py-12 sm:py-20">
      <div className="container px-4">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl font-bold sm:text-3xl md:text-4xl">
              Compra <span className="text-gradient-gold">Segura</span> e Fácil
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Somos um revendedor terceirizado especializado em moedas virtuais de jogos populares do Roblox. Todas as moedas são adquiridas de forma legítima e entregues com total segurança.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              É rápido e fácil — escolha o produto, faça o pagamento, receba suas moedas e volte a jogar!
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)]">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">Transações protegidas com criptografia SSL</span>
              </div>
              <a href="https://discord.gg/EQTankyt8R" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-[hsl(235,86%,65%)]/20 bg-[hsl(235,86%,65%)]/5 px-4 py-3">
                <Users className="h-4 w-4 text-[hsl(235,86%,65%)]" />
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">Comunidade Discord com 10.000+ membros ativos</span>
              </a>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Garantia de Reembolso", desc: "Receba seu pedido ou tenha seu dinheiro de volta. Proteção total.", color: "border-primary/20 bg-primary/5" },
              { icon: Headphones, title: "Suporte 24/7", desc: "Nossa equipe está disponível no Discord a qualquer hora.", color: "border-border bg-card" },
              { icon: Award, title: "+5.000 Entregas", desc: "Milhares de clientes satisfeitos. Confira nossos depoimentos.", color: "border-border bg-card" },
              { icon: Lock, title: "Dados Protegidos", desc: "Seus dados pessoais e de pagamento são criptografados.", color: "border-border bg-card" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] sm:p-6 ${item.color}`}
              >
                <item.icon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                <h3 className="mt-3 font-heading text-sm font-bold sm:text-base">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
