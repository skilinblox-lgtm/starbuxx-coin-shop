import { useState } from "react";
import { ShoppingCart } from "lucide-react";

interface Game {
  id: string;
  name: string;
  currency: string;
  pricePerUnit: number;
  emoji: string;
  color: string;
}

const games: Game[] = [
  {
    id: "roblox",
    name: "Roblox",
    currency: "Robux",
    pricePerUnit: 0.07,
    emoji: "🎮",
    color: "from-[hsl(0,70%,55%)] to-[hsl(350,70%,45%)]",
  },
  {
    id: "clash-royale",
    name: "Clash Royale",
    currency: "Gemas",
    pricePerUnit: 0.05,
    emoji: "⚔️",
    color: "from-[hsl(210,80%,50%)] to-[hsl(230,80%,40%)]",
  },
  {
    id: "brawl-stars",
    name: "Brawl Stars",
    currency: "Gemas",
    pricePerUnit: 0.04,
    emoji: "💥",
    color: "from-[hsl(130,60%,45%)] to-[hsl(150,60%,35%)]",
  },
];

const GameSelector = () => {
  const [selectedGame, setSelectedGame] = useState<Game>(games[0]);
  const [quantity, setQuantity] = useState<number>(100);

  const totalPrice = (quantity * selectedGame.pricePerUnit).toFixed(2);

  return (
    <section id="jogos" className="bg-surface py-20">
      <div className="container">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            Escolha seu <span className="text-gradient-gold">Jogo</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Selecione o jogo e a quantidade de moedas que deseja comprar
          </p>
        </div>

        {/* Game Cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                setSelectedGame(game);
                setQuantity(100);
              }}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                selectedGame.id === game.id
                  ? "border-primary bg-background shadow-[var(--shadow-gold)] scale-[1.02]"
                  : "border-border bg-background hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
              }`}
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${game.color} text-2xl shadow-lg`}>
                {game.emoji}
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold">{game.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {game.currency} • R$ {game.pricePerUnit.toFixed(2)}/un
              </p>
              {selectedGame.id === game.id && (
                <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-primary animate-pulse-gold" />
              )}
            </button>
          ))}
        </div>

        {/* Quantity Calculator */}
        <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-border bg-background p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${selectedGame.color} text-lg`}>
              {selectedGame.emoji}
            </div>
            <div>
              <p className="font-heading font-bold">{selectedGame.name}</p>
              <p className="text-sm text-muted-foreground">{selectedGame.currency}</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground">
              Quantidade de {selectedGame.currency}
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mt-6 flex items-end justify-between rounded-xl bg-surface p-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço Total</p>
              <p className="font-heading text-3xl font-bold text-gradient-gold">
                R$ {totalPrice}
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 hover:scale-105">
              <ShoppingCart className="h-5 w-5" />
              Comprar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSelector;
