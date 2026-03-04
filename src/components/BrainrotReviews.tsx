import { useState, useEffect } from "react";
import { Star, MessageSquare, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface BrainrotReviewsProps {
  brainrotId?: string; // if provided, filter by brainrot
}

const BrainrotReviews = ({ brainrotId }: BrainrotReviewsProps) => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      let query = supabase.from("brainrot_reviews" as any).select("*").order("created_at", { ascending: false }).limit(12);
      if (brainrotId) {
        query = query.eq("brainrot_id", brainrotId);
      }
      const { data } = await query;
      setReviews(data || []);
    };
    fetch();
  }, [brainrotId]);

  if (reviews.length === 0) return null;

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-10"
    >
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold sm:text-xl">Avaliações dos Clientes</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-primary">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({reviews.length} avaliações)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-background/80 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">{review.author_name}</span>
                      <BadgeCheck className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                    </div>
                    <div className="flex mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BrainrotReviews;
