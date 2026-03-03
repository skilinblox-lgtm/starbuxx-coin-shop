import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-dark text-[hsl(220,10%,70%)]">
      <div className="container px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-primary text-primary sm:h-6 sm:w-6" />
              <span className="font-heading text-base font-bold text-[hsl(0,0%,100%)] sm:text-lg">
                Star<span className="text-gradient-gold">buxx</span>
              </span>
            </Link>
            <p className="mt-2 text-xs leading-relaxed sm:mt-3 sm:text-sm">
              Sua loja confiável de moedas virtuais para os melhores jogos.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,100%)] sm:text-sm">Institucional</h4>
            <ul className="mt-2 space-y-1.5 text-xs sm:mt-4 sm:space-y-2 sm:text-sm">
              <li><a href="#" className="transition-colors hover:text-primary">Termos de Serviço</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Política de Privacidade</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Política de Reembolso</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,100%)] sm:text-sm">Suporte</h4>
            <ul className="mt-2 space-y-1.5 text-xs sm:mt-4 sm:space-y-2 sm:text-sm">
              <li><a href="#" className="transition-colors hover:text-primary">Central de Ajuda</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Contato</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Chat Online</a></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,100%)] sm:text-sm">Pagamento</h4>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              {["Pix", "Visa", "Master", "Elo", "Boleto"].map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-[hsl(220,15%,20%)] bg-[hsl(220,20%,14%)] px-2 py-1 text-[10px] font-medium sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[hsl(220,15%,18%)] pt-4 text-center text-[10px] sm:mt-10 sm:pt-6 sm:text-xs">
          <p>© 2026 Starbuxx - Todos os direitos reservados.</p>
          <p className="mt-0.5 sm:mt-1">CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
