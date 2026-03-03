import { ShieldCheck, Headphones, Award, Lock } from "lucide-react";
import { motion } from "framer-motion";

const TrustSection = () => {
  return (
    <section className="bg-background py-12 sm:py-20">
      <div className="container px-4">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
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
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">Transações protegidas com criptografia SSL de ponta a ponta</span>
            </div>
          </motion.div>

          {/* Trust cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6"
            >
              <ShieldCheck className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
              <h3 className="mt-3 font-heading text-sm font-bold sm:text-base">Garantia de Reembolso</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Receba seu pedido ou tenha seu dinheiro de volta. Proteção total em todas as compras.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <Headphones className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
              <h3 className="mt-3 font-heading text-sm font-bold sm:text-base">Suporte 24/7</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Nossa equipe está disponível a qualquer hora para te ajudar com dúvidas ou problemas.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <Award className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
              <h3 className="mt-3 font-heading text-sm font-bold sm:text-base">Vendedor Confiável</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Milhares de entregas realizadas com sucesso. Confira nossos depoimentos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <Lock className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
              <h3 className="mt-3 font-heading text-sm font-bold sm:text-base">Dados Protegidos</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Seus dados pessoais e de pagamento são criptografados e jamais compartilhados.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
