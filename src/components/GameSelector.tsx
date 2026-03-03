import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClashRoyale from "@/assets/icon-clash-royale.png";
import iconBrawlStars from "@/assets/icon-brawl-stars.png";

interface Game {
  id: string;
  name: string;
  currency: string;
  pricePerUnit: number;
  icon: string;
  color: string;
}

const games: Game[] = [
  { id: "roblox", name: "Roblox", currency: "Robux", pricePerUnit: 0.07, icon: iconRoblox, color: "from-[hsl(0,70%,55%)] to-[hsl(350,70%,45%)]" },
  { id: "clash-royale", name: "Clash Royale", currency: "Gemas", pricePerUnit: 0.05, icon: iconClashRoyale, color: "from-[hsl(210,80%,50%)] to-[hsl(230,80%,40%)]" },
  { id: "brawl-stars", name: "Brawl Stars", currency: "Gemas", pricePerUnit: 0.04, icon: iconBrawlStars, color: "from-[hsl(130,60%,45%)] to-[hsl(150,60%,35%)]" },
];

const GameSelector = () => {
  const [selectedGame, setSelectedGame] = useState<Game>(games[0]);
  const [quantity, setQuantity] = useState<number>(100);
  const navigate = useNavigate();

  const totalPrice = (quantity * selectedGame.pricePerUnit).toFixed(2);

  const handleBuy = () => {
    navigate("/checkout", {
      state: {
        gameId: selectedGame.id,
        gameName: selectedGame.name,
        currency: selectedGame.currency,
        quantity,
        pricePerUnit: selectedGame.pricePerUnit,
        totalPrice: parseFloat(totalPrice),
      },
    });
  };

  return (
    <section id="jogos" className="bg-surface py-12 sm:py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="font-heading text-2xl font-bold sm:text-3xl md:text-4xl">
            Escolha seu <span className="text-gradient-gold">Jogo</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            Selecione o jogo e a quantidade de moedas que deseja comprar
          </p>
        </motion.div>

        {/* Game Cards */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
          {games.map((game, i) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedGame(game); setQuantity(100); }}
              className={`group relative flex-shrink-0 w-[200px] overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 sm:w-auto sm:p-6 ${
                selectedGame.id === game.id
                  ? "border-primary bg-background shadow-[var(--shadow-gold)] scale-[1.02]"
                  : "border-border bg-background hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
              }`}
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${game.color} shadow-lg overflow-hidden sm:h-14 sm:w-14`}>
                <img src={game.icon} alt={game.name} className="h-8 w-8 object-contain sm:h-10 sm:w-10" />
              </div>
              <h3 className="mt-3 font-heading text-base font-bold sm:mt-4 sm:text-xl">{game.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                {game.currency} • R$ {game.pricePerUnit.toFixed(2)}/un
              </p>
              {selectedGame.id === game.id && (
                <motion.div
                  layoutId="game-indicator"
                  className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary sm:right-4 sm:top-4 sm:h-3 sm:w-3"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Calculator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGame.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-card)] sm:mt-12 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${selectedGame.color} overflow-hidden sm:h-10 sm:w-10`}>
                <img src={selectedGame.icon} alt={selectedGame.name} className="h-6 w-6 object-contain sm:h-7 sm:w-7" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold sm:text-base">{selectedGame.name}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{selectedGame.currency}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                Quantidade de {selectedGame.currency}
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 sm:mt-2 sm:px-4 sm:py-3 sm:text-lg"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl bg-surface p-3 sm:mt-6 sm:flex-row sm:items-end sm:justify-between sm:p-4">
              <div>
                <p className="text-xs text-muted-foreground sm:text-sm">Preço Total</p>
                <p className="font-heading text-2xl font-bold text-gradient-gold sm:text-3xl">
                  R$ {totalPrice}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:px-6 sm:py-3 sm:text-base"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Comprar
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GameSelector;
