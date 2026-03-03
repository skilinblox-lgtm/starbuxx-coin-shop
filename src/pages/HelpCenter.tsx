import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { HelpCircle, ShoppingCart, Truck, CreditCard, UserCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    icon: ShoppingCart,
    question: "Como faço para comprar moedas?",
    answer: "Escolha o produto desejado na página inicial, selecione a quantidade, clique em 'Comprar Agora' e preencha seus dados no checkout. Após o pagamento, iniciaremos a entrega."
  },
  {
    icon: Truck,
    question: "Qual o prazo de entrega?",
    answer: "A entrega é realizada em até 48 horas após a confirmação do pagamento. Na maioria dos casos, entregamos em menos de 20 minutos."
  },
  {
    icon: CreditCard,
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos Pix (aprovação instantânea), Cartão de Crédito/Débito (Visa, Master, Elo e outros) e Boleto Bancário (até 3 dias úteis para compensação)."
  },
  {
    icon: UserCheck,
    question: "Vocês são uma loja oficial?",
    answer: "Não. A Starbuxx é um revendedor terceirizado independente. As moedas que vendemos são adquiridas de forma legítima dentro dos próprios jogos da plataforma Roblox. Não possuímos vínculo com a Roblox Corporation."
  },
  {
    icon: AlertTriangle,
    question: "E se eu não receber as moedas?",
    answer: "Caso a entrega não ocorra no prazo estipulado, garantimos o reembolso integral do valor pago. Entre em contato pelo e-mail contato@starbuxx.com."
  },
];

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl px-4 pb-12 pt-20 sm:pt-24">
          <div className="text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">Central de Ajuda</h1>
            <p className="mt-2 text-sm text-muted-foreground">Perguntas frequentes sobre nossos serviços</p>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <faq.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="flex-1 text-sm font-bold sm:text-base">{faq.question}</span>
                  <span className="text-muted-foreground">{openIndex === i ? "−" : "+"}</span>
                </div>
                {openIndex === i && (
                  <p className="mt-3 pl-8 text-xs leading-relaxed text-muted-foreground sm:text-sm">{faq.answer}</p>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-center sm:p-6">
            <p className="text-sm font-bold">Não encontrou o que procurava?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Entre em contato pelo e-mail <a href="mailto:contato@starbuxx.com" className="text-primary underline">contato@starbuxx.com</a>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default HelpCenter;
