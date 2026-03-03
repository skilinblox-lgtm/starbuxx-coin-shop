import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Star, ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import iconPix from "@/assets/icon-pix.png";
import iconCard from "@/assets/icon-card.png";
import iconBoleto from "@/assets/icon-boleto.png";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClashRoyale from "@/assets/icon-clash-royale.png";
import iconBrawlStars from "@/assets/icon-brawl-stars.png";

const gameIcons: Record<string, string> = {
  roblox: iconRoblox,
  "clash-royale": iconClashRoyale,
  "brawl-stars": iconBrawlStars,
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state as {
    gameId: string; gameName: string; currency: string;
    quantity: number; pricePerUnit: number; totalPrice: number;
  } | null;

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [gameUsername, setGameUsername] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!order) { navigate("/"); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setEmail(session.user.email || "");
        setFullName(session.user.user_metadata?.full_name || "");
      }
    });
  }, [order, navigate]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Você precisa estar logado para comprar."); navigate("/auth"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id, game_id: order.gameId, quantity: order.quantity,
        total_price: order.totalPrice, payment_method: paymentMethod,
        game_username: gameUsername, full_name: fullName, cpf, email,
      });
      if (error) throw error;
      toast.success("Pedido criado com sucesso!");
      navigate("/my-orders");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pedido");
    } finally { setLoading(false); }
  };

  const paymentMethods = [
    { id: "pix", label: "Pix", icon: iconPix, desc: "Aprovação instantânea" },
    { id: "cartao", label: "Cartão", icon: iconCard, desc: "Crédito ou débito" },
    { id: "boleto", label: "Boleto", icon: iconBoleto, desc: "Até 3 dias úteis" },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <nav className="border-b border-border/50 bg-dark">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <Star className="h-6 w-6 fill-primary text-primary sm:h-7 sm:w-7" />
            <span className="font-heading text-lg font-bold text-[hsl(0,0%,100%)] sm:text-xl">
              Star<span className="text-gradient-gold">buxx</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[hsl(0,0%,100%)] sm:gap-2 sm:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Voltar
          </Link>
        </div>
      </nav>

      <div className="container px-4 py-6 sm:py-10">
        <h1 className="font-heading text-2xl font-bold text-[hsl(0,0%,100%)] sm:text-3xl">Checkout</h1>
        <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-primary sm:mt-2 sm:gap-2 sm:text-sm">
          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Compra 100% Segura
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Order Summary - top on mobile, sidebar on desktop */}
          <div className="lg:order-last lg:col-span-1">
            <div className="rounded-2xl border border-border bg-background p-4 shadow-[var(--shadow-card)] sm:p-6">
              <h3 className="font-heading text-base font-bold sm:text-lg">Resumo do Pedido</h3>
              <div className="mt-3 flex items-center gap-3 sm:mt-4">
                <img src={gameIcons[order.gameId]} alt={order.gameName} className="h-10 w-10 rounded-lg object-contain sm:h-12 sm:w-12" />
                <div>
                  <p className="text-sm font-bold sm:text-base">{order.gameName}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">{order.quantity} {order.currency}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs sm:mt-4 sm:space-y-2 sm:pt-4 sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço unitário</span>
                  <span>R$ {order.pricePerUnit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade</span>
                  <span>{order.quantity}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold sm:text-lg">
                  <span>Total</span>
                  <span className="text-gradient-gold">R$ {order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-background p-4 shadow-[var(--shadow-card)] sm:p-6">
              <h3 className="font-heading text-base font-bold sm:text-lg">Seus Dados</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground sm:text-sm">Nome Completo</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground sm:text-sm">CPF</label>
                  <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required placeholder="000.000.000-00" className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground sm:text-sm">Usuário no Jogo</label>
                  <input type="text" value={gameUsername} onChange={(e) => setGameUsername(e.target.value)} required className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground sm:text-sm">E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4 shadow-[var(--shadow-card)] sm:p-6">
              <h3 className="font-heading text-base font-bold sm:text-lg">Forma de Pagamento</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3">
                {paymentMethods.map((pm) => (
                  <button
                    type="button" key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all sm:p-4 ${
                      paymentMethod === pm.id
                        ? "border-primary bg-primary/5 shadow-[var(--shadow-gold)]"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <img src={pm.icon} alt={pm.label} className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
                    <div>
                      <p className="text-sm font-bold">{pm.label}</p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{pm.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-base font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50 sm:py-4 sm:text-lg"
            >
              {loading ? "Processando..." : `Finalizar Pedido • R$ ${order.totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
