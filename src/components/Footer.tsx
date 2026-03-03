import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-dark text-[hsl(220,10%,70%)]">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-primary text-primary" />
              <span className="font-heading text-lg font-bold text-[hsl(0,0%,100%)]">
                Star<span className="text-gradient-gold">buxx</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Sua loja confiável de moedas virtuais para os melhores jogos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[hsl(0,0%,100%)]">
              Institucional
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="transition-colors hover:text-primary">Termos de Serviço</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Política de Privacidade</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Política de Reembolso</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[hsl(0,0%,100%)]">
              Suporte
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="transition-colors hover:text-primary">Central de Ajuda</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Contato</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Chat Online</a></li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[hsl(0,0%,100%)]">
              Formas de Pagamento
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Pix", "Visa", "Master", "Elo", "Boleto"].map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-[hsl(220,15%,20%)] bg-[hsl(220,20%,14%)] px-3 py-1.5 text-xs font-medium"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[hsl(220,15%,18%)] pt-6 text-center text-xs">
          <p>© 2026 Starbuxx - Todos os direitos reservados.</p>
          <p className="mt-1">CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
