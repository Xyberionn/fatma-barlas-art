-- Blogs tablosu için RLS politikalarını düzelt
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Blogs are viewable by everyone" ON public.blogs;

-- RLS'i aktif et (zaten aktif ama emin olmak için)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Doğru politikaları oluştur

-- Herkes okuyabilir
CREATE POLICY "Blogs are viewable by everyone"
ON public.blogs FOR SELECT
USING (true);

-- Sadece authenticated kullanıcılar ekleyebilir
CREATE POLICY "Authenticated users can insert blogs"
ON public.blogs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Sadece authenticated kullanıcılar güncelleyebilir
CREATE POLICY "Authenticated users can update blogs"
ON public.blogs FOR UPDATE
TO authenticated
USING (true);

-- Sadece authenticated kullanıcılar silebilir
CREATE POLICY "Authenticated users can delete blogs"
ON public.blogs FOR DELETE
TO authenticated
USING (true);
