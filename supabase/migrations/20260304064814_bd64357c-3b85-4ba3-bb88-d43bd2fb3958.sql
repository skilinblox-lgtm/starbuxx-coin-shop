ALTER TABLE public.blog_posts 
ADD COLUMN has_key boolean NOT NULL DEFAULT false,
ADD COLUMN executors_compatible text[] NOT NULL DEFAULT '{}'::text[];