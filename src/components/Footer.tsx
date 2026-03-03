import { ShieldCheck, Clock, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-primary text-primary sm:h-6 sm:w-6" />
              <span className="font-heading text-base font-bold sm:text-lg">
                Star<span className="text-gradient-gold">buxx</span>
              </span>
            </Link>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
              Revendedor terceirizado de moedas virtuais adquiridas em jogos populares do Roblox. Não somos afiliados ou patrocinados pela Roblox Corporation.
            </p>
            <a
              href="https://discord.gg/EQTankyt8R"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[hsl(235,86%,65%)]/10 px-3 py-1.5 text-xs font-medium text-[hsl(235,86%,65%)] transition-colors hover:bg-[hsl(235,86%,65%)]/20"
            >
              <Users className="h-3.5 w-3.5" /> Discord • 10K+ membros
            </a>
          </div>

          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider sm:text-sm">Institucional</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground sm:mt-4 sm:space-y-2 sm:text-sm">
              <li><Link to="/termos" className="transition-colors hover:text-primary">Termos de Serviço</Link></li>
              <li><Link to="/privacidade" className="transition-colors hover:text-primary">Política de Privacidade</Link></li>
              <li><Link to="/reembolso" className="transition-colors hover:text-primary">Política de Reembolso</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider sm:text-sm">Suporte</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground sm:mt-4 sm:space-y-2 sm:text-sm">
              <li><Link to="/ajuda" className="transition-colors hover:text-primary">Central de Ajuda</Link></li>
              <li><a href="https://discord.gg/EQTankyt8R" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">Discord</a></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider sm:text-sm">Pagamento</h4>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              {["Pix", "Visa", "Master", "Elo", "Boleto"].map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-6 sm:mt-8 sm:gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Pagamento Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Entrega Rápida</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            <span>Garantia de Reembolso</span>
          </div>
        </div>

        <div className="mt-4 text-center text-[10px] text-muted-foreground sm:mt-6 sm:text-xs">
          <p>© 2026 Starbuxx — Todos os direitos reservados.</p>
          <p className="mt-1">Revendedor independente de moedas virtuais. Não possuímos vínculo oficial com Roblox Corporation ou seus desenvolvedores.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
