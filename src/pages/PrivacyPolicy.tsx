import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const PrivacyPolicy = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-3xl px-4 pb-12 pt-20 sm:pt-24">
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Política de Privacidade</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última atualização: 03 de Março de 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-base font-bold text-foreground">1. Dados Coletados</h2>
              <p className="mt-2">Coletamos apenas os dados necessários para processar sua compra: nome completo, CPF, e-mail e nome de usuário no jogo. Não compartilhamos seus dados com terceiros.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">2. Uso dos Dados</h2>
              <p className="mt-2">Seus dados são utilizados exclusivamente para processar pedidos, realizar entregas e entrar em contato quando necessário sobre o andamento da compra.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">3. Segurança</h2>
              <p className="mt-2">Utilizamos criptografia SSL para proteger todas as informações transmitidas. Seus dados de pagamento são processados por gateways seguros e nunca armazenados em nossos servidores.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">4. Cookies</h2>
              <p className="mt-2">Utilizamos cookies apenas para manter sua sessão ativa e melhorar sua experiência de navegação. Nenhum dado pessoal é armazenado em cookies.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground">5. Seus Direitos</h2>
              <p className="mt-2">Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato pelo e-mail: contato@starbuxx.com</p>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;
