-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- Orders tablosuna email ve phone kolonlarını ekler

-- Önce kolonları ekle (NOT NULL değil, çünkü mevcut kayıtlar olabilir)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
