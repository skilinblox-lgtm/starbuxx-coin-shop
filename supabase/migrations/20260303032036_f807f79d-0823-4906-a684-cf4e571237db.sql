
-- Table for brainrot posts (memes/characters with price tracking)
CREATE TABLE public.brainrot_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  current_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Price history for brainrot chart
CREATE TABLE public.brainrot_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brainrot_id UUID NOT NULL REFERENCES public.brainrot_posts(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brainrot_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brainrot_price_history ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view brainrot posts" ON public.brainrot_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can view brainrot price history" ON public.brainrot_price_history FOR SELECT USING (true);

-- Admin-only write access
CREATE POLICY "Admins can manage brainrot posts" ON public.brainrot_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage brainrot price history" ON public.brainrot_price_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_brainrot_posts_updated_at
  BEFORE UPDATE ON public.brainrot_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for brainrot images
INSERT INTO storage.buckets (id, name, public) VALUES ('brainrot-images', 'brainrot-images', true);

CREATE POLICY "Anyone can view brainrot images" ON storage.objects FOR SELECT USING (bucket_id = 'brainrot-images');
CREATE POLICY "Admins can upload brainrot images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brainrot-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update brainrot images" ON storage.objects FOR UPDATE USING (bucket_id = 'brainrot-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete brainrot images" ON storage.objects FOR DELETE USING (bucket_id = 'brainrot-images' AND public.has_role(auth.uid(), 'admin'));
