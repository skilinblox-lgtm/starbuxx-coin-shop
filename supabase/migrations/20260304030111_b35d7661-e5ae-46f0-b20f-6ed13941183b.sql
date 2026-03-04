ALTER TABLE public.brainrot_posts ADD COLUMN featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.brainrot_posts ADD COLUMN tags text[] NOT NULL DEFAULT '{}'::text[];