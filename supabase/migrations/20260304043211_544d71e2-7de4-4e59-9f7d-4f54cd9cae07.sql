
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- Set initial display_order based on current order
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM public.products
)
UPDATE public.products SET display_order = ordered.rn FROM ordered WHERE products.id = ordered.id;
