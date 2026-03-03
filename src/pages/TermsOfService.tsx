import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const TermsOfService = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl px-4 pb-12 pt-20 sm:pt-24">
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Termos de Serviço</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 03 de Março de 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-base font-bold text-foreground">1. Sobre a StarBuxx</h2>
              <p className="mt-2">
                A StarBuxx é um serviço terceirizado de revenda de moedas virtuais adquiridas em jogos populares da plataforma Roblox. <strong className="text-foreground">Não somos uma empresa oficial, nem possuímos qualquer vínculo, afiliação ou patrocínio com a Roblox Corporation ou seus desenvolvedores.</strong> As moedas comercializadas são adquiridas de forma legítima dentro dos próprios jogos e revendidas aos nossos clientes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">2. Aceitação dos Termos</h2>
              <p className="mt-2">
                Ao utilizar nosso site e realizar qualquer compra, você concorda integralmente com estes Termos de Serviço. Caso não concorde com algum item, não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">3. Serviços Oferecidos</h2>
              <p className="mt-2">
                Oferecemos a revenda de moedas virtuais para jogos na plataforma Roblox. A entrega é feita diretamente na conta do jogo informada pelo comprador, em até 48 horas após a confirmação do pagamento.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">4. Responsabilidades do Comprador</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Informar corretamente o nome de usuário do jogo para recebimento das moedas.</li>
                <li>Garantir que a conta do jogo esteja ativa e apta a receber transferências.</li>
                <li>Não utilizar as moedas adquiridas para atividades que violem os termos de uso do jogo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">5. Política de Entrega</h2>
              <p className="mt-2">
                O prazo estimado de entrega é de até 48 horas úteis após a confirmação do pagamento. Em períodos de alta demanda, o prazo pode ser estendido. Você será notificado sobre o status do seu pedido.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">6. Política de Reembolso</h2>
              <p className="mt-2">
                Caso a entrega não seja realizada no prazo estipulado ou haja qualquer problema na transferência, o valor pago será integralmente reembolsado. Solicitações de reembolso devem ser feitas dentro de 7 dias após a compra.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">7. Isenção de Responsabilidade</h2>
              <p className="mt-2">
                A Starbuxx não se responsabiliza por penalidades aplicadas pela Roblox Corporation ou pelos desenvolvedores dos jogos à conta do comprador. A utilização do serviço é de inteira responsabilidade do usuário.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">8. Alterações nos Termos</h2>
              <p className="mt-2">
                Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação no site.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">9. Contato</h2>
              <p className="mt-2">
                Em caso de dúvidas, entre em contato conosco pelo e-mail: contato@starbuxx.com
              </p>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default TermsOfService;
