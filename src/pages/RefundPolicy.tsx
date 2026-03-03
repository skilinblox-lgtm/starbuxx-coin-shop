import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ShieldCheck, Clock, MailCheck } from "lucide-react";

const RefundPolicy = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl px-4 pb-12 pt-20 sm:pt-24">
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Política de Reembolso</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 03 de Março de 2026</p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "100% Garantido", desc: "Reembolso integral se não entregarmos" },
              { icon: Clock, title: "Até 7 dias", desc: "Prazo para solicitar reembolso" },
              { icon: MailCheck, title: "Fácil e Rápido", desc: "Basta entrar em contato conosco" },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-4 text-center">
                <item.icon className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-base font-bold text-foreground">Quando posso solicitar reembolso?</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Se a entrega não for realizada no prazo de 48 horas.</li>
                <li>Se houver erro na quantidade de moedas entregues.</li>
                <li>Se a entrega for feita na conta errada por falha nossa.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">Quando NÃO posso solicitar reembolso?</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Se você informou o nome de usuário errado e a entrega já foi realizada.</li>
                <li>Se o pedido já foi entregue corretamente e confirmado.</li>
                <li>Após 7 dias da data da compra.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">Como solicitar?</h2>
              <p className="mt-2">
                Envie um e-mail para contato@starbuxx.com com o número do seu pedido e a descrição do problema. Respondemos em até 24 horas.
              </p>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default RefundPolicy;
