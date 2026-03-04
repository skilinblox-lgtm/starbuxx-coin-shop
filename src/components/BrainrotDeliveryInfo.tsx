import { Clock, Users, Shield, Server, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BrainrotDeliveryInfo = () => {
  const steps = [
    {
      icon: Clock,
      title: "Prazo de Entrega",
      desc: "Entrega em até 24h com vendedor online. Em períodos de alta demanda, pode levar até 48h.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Users,
      title: "Adicionamos como Amigo",
      desc: "Um de nossos vendedores irá adicionar você como amigo no jogo para realizar a transferência.",
      color: "text-[hsl(210,85%,65%)]",
      bg: "bg-[hsl(210,85%,65%)]/10",
    },
    {
      icon: Server,
      title: "Servidor Privado",
      desc: "Entramos em um servidor privado com você para garantir segurança total na transferência.",
      color: "text-[hsl(270,80%,72%)]",
      bg: "bg-[hsl(270,80%,72%)]/10",
    },
    {
      icon: Shield,
      title: "100% Seu",
      desc: "Transferimos o brainrot da nossa base para a sua, tornando-o 100% seu. Processo seguro e garantido.",
      color: "text-[hsl(145,70%,45%)]",
      bg: "bg-[hsl(145,70%,45%)]/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-12"
    >
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="font-heading text-xl font-bold sm:text-2xl">
            Como funciona a <span className="text-gradient-gold">entrega?</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Processo seguro e rápido para você receber seu brainrot
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center rounded-2xl border border-border bg-background p-4 text-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.bg}`}>
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>
              <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold">{step.title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground/30 lg:block" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
          <Clock className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold text-muted-foreground">
            <span className="text-foreground">Tempo médio:</span> 2-6 horas com vendedor disponível
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BrainrotDeliveryInfo;
