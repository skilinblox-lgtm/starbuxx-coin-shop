import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ReviewSection = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="depoimentos" className="bg-surface py-12 sm:py-20">
      <div className="container px-4">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl md:text-4xl">
          O que nossos <span className="text-gradient-gold">clientes</span> dizem
        </h2>
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="w-[280px] flex-shrink-0 rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-card)] sm:w-auto sm:p-6"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary sm:h-4 sm:w-4" />
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-foreground sm:mt-4 sm:text-sm">
                "{r.comment}"
              </p>
              <div className="mt-3 flex items-center gap-2 sm:mt-4 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-heading font-bold text-primary sm:h-10 sm:w-10">
                  {r.author_name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold sm:text-sm">{r.author_name}</p>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">{r.game_id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
