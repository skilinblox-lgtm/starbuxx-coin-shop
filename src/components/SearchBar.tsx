import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const searchableItems = [
  { label: "Roblox - Robux", gameId: "roblox" },
  { label: "Clash Royale - Gemas", gameId: "clash-royale" },
  { label: "Brawl Stars - Gemas", gameId: "brawl-stars" },
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = query.length > 0
    ? searchableItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
        <Search className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border bg-background p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar jogos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={() => { setIsOpen(false); setQuery(""); }}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          {filtered.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-border pt-2">
              {filtered.map(item => (
                <a
                  key={item.gameId}
                  href="#jogos"
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-surface transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
          {query.length > 0 && filtered.length === 0 && (
            <p className="mt-2 border-t border-border pt-2 text-center text-xs text-muted-foreground">Nenhum resultado</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
