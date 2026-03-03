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
    <section id="depoimentos" className="bg-surface py-20">
      <div className="container">
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">
          O que nossos <span className="text-gradient-gold">clientes</span> dizem
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                "{r.comment}"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary">
                  {r.author_name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{r.author_name}</p>
                  <p className="text-xs text-muted-foreground">{r.game_id}</p>
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
