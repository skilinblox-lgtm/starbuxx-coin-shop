CREATE TABLE public.brainrot_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brainrot_id uuid NOT NULL REFERENCES public.brainrot_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL,
  is_fake boolean DEFAULT false,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brainrot_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view brainrot reviews" ON public.brainrot_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create review for delivered orders" ON public.brainrot_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      is_fake = true OR
      EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = brainrot_reviews.order_id
        AND orders.user_id = auth.uid()
        AND orders.status = 'entregue'
      )
    )
  );

CREATE POLICY "Admins can manage brainrot reviews" ON public.brainrot_reviews
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));