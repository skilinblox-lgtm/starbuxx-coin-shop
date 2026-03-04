
-- Add new columns to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS script_code text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS game_compatible text DEFAULT 'steal-a-brainrot';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author text DEFAULT 'skilin';

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  author_name text NOT NULL,
  comment text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Anyone can view blog comments" ON public.blog_comments
  FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create blog comments" ON public.blog_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all comments
CREATE POLICY "Admins can manage blog comments" ON public.blog_comments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
