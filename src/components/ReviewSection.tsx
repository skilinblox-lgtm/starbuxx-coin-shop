import { useEffect, useState, useRef } from "react";
import { Star, Gamepad2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import iconRoblox from "@/assets/icon-roblox.png";
import iconClash from "@/assets/icon-clash-royale.png";
import iconBrawl from "@/assets/icon-brawl-stars.png";

const gameIcons: Record<string, string> = {
  roblox: iconRoblox,
  "clash-royale": iconClash,
  "brawl-stars": iconBrawl,
};

const gameLabels: Record<string, string> = {
  roblox: "Roblox",
  "clash-royale": "Clash Royale",
  "brawl-stars": "Brawl Stars",
};

const ReviewSection = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(9);
      setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  if (loading) return null;

  const itemsPerView = typeof window !== "undefined" && window.innerWidth >= 640 ? 3 : 1;
  const maxIndex = Math.max(0, reviews.length - itemsPerView);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section id="depoimentos" className="bg-muted/50 py-12 sm:py-20">
      <div className="container px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl md:text-4xl">
              O que nossos <span className="text-gradient-gold">clientes</span> dizem
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Avaliações reais de jogadores que já compraram</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-foreground"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden sm:mt-12" ref={containerRef}>
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {reviews.map((r) => {
              const icon = gameIcons[r.game_id];
              const label = gameLabels[r.game_id] || r.game_id;
              return (
                <div
                  key={r.id}
                  className="w-full flex-shrink-0 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:w-[calc(33.333%-0.67rem)] sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {icon ? (
                        <img src={icon} alt={label} className="h-6 w-6 object-contain" />
                      ) : (
                        <Gamepad2 className="h-5 w-5 text-primary" />
                      )}
                      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(r.created_at)}</span>
                      <span>•</span>
                      <span>{formatTime(r.created_at)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-primary text-primary" : "text-border"}`} />
                    ))}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-foreground">
                    "{r.comment}"
                  </p>

                  <div className="mt-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-heading font-bold text-primary">
                      {r.author_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{r.author_name}</p>
                      <p className="text-[10px] text-muted-foreground">Comprador verificado</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
