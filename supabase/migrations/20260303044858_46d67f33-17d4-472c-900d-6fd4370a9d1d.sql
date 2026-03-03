
-- Rename email column to discord_username in orders table
ALTER TABLE public.orders RENAME COLUMN email TO discord_username;
