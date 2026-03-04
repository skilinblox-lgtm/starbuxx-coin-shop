import { useState } from "react";
import { Filter, SortDesc, SortAsc, X } from "lucide-react";
import { RARITY_CONFIG } from "@/components/RarityBadge";
import { motion, AnimatePresence } from "framer-motion";

interface BrainrotFiltersProps {
  onFilterChange: (filters: BrainrotFilterState) => void;
  filters: BrainrotFilterState;
}

export interface BrainrotFilterState {
  rarities: string[];
  sortPrice: "none" | "asc" | "desc";
  minPrice: string;
  maxPrice: string;
}

export const defaultFilters: BrainrotFilterState = {
  rarities: [],
  sortPrice: "none",
  minPrice: "",
  maxPrice: "",
};

const BrainrotFilters = ({ onFilterChange, filters }: BrainrotFiltersProps) => {
  const [open, setOpen] = useState(false);

  const toggleRarity = (key: string) => {
    const next = filters.rarities.includes(key)
      ? filters.rarities.filter(r => r !== key)
      : [...filters.rarities, key];
    onFilterChange({ ...filters, rarities: next });
  };

  const cycleSort = () => {
    const order: Array<"none" | "asc" | "desc"> = ["none", "desc", "asc"];
    const idx = order.indexOf(filters.sortPrice);
    onFilterChange({ ...filters, sortPrice: order[(idx + 1) % order.length] });
  };

  const hasActiveFilters = filters.rarities.length > 0 || filters.sortPrice !== "none" || filters.minPrice || filters.maxPrice;

  const clearAll = () => onFilterChange(defaultFilters);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
            open || hasActiveFilters
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Filtros
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
              {filters.rarities.length + (filters.sortPrice !== "none" ? 1 : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0)}
            </span>
          )}
        </button>

        <button
          onClick={cycleSort}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
            filters.sortPrice !== "none"
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          }`}
        >
          {filters.sortPrice === "desc" ? (
            <><SortDesc className="h-3.5 w-3.5" /> Maior preço</>
          ) : filters.sortPrice === "asc" ? (
            <><SortAsc className="h-3.5 w-3.5" /> Menor preço</>
          ) : (
            <><SortDesc className="h-3.5 w-3.5" /> Ordenar preço</>
          )}
        </button>

        {hasActiveFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 rounded-xl border border-destructive/30 px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10">
            <X className="h-3 w-3" /> Limpar
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-border bg-card p-4 space-y-4">
              {/* Rarity filter */}
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">Raridade</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => toggleRarity(key)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                        filters.rarities.includes(key)
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">Faixa de Preço</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={filters.minPrice}
                    onChange={e => onFilterChange({ ...filters, minPrice: e.target.value })}
                    placeholder="Mín"
                    className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <span className="text-xs text-muted-foreground">—</span>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.maxPrice}
                    onChange={e => onFilterChange({ ...filters, maxPrice: e.target.value })}
                    placeholder="Máx"
                    className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrainrotFilters;
