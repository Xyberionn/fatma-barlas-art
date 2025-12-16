-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- Orders tablosuna email ve phone kolonlarını ekler

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';

-- Varsayılan değerleri kaldır (yeni kayıtlar için zorunlu olsun)
ALTER TABLE public.orders
ALTER COLUMN email DROP DEFAULT,
ALTER COLUMN phone DROP DEFAULT;
