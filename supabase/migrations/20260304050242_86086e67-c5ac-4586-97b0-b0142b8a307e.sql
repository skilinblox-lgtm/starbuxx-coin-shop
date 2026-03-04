CREATE TABLE public.brainrot_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brainrot_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage flags" ON public.brainrot_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view flags" ON public.brainrot_flags FOR SELECT USING (true);