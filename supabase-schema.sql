-- Fatma Barlas Art Portfolio Database Schema
-- Bu SQL kodunu Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Artworks (Eserler) Tablosu
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Blog Posts Tablosu
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. About Data Tablosu (tek satır)
CREATE TABLE IF NOT EXISTS public.about_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image1 TEXT NOT NULL,
  image2 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders (Siparişler) Tablosu
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Politikaları

-- Artworks için RLS
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Artworks are viewable by everyone"
ON public.artworks FOR SELECT
USING (true);

-- Sadece authenticated kullanıcılar ekleyebilir/güncelleyebilir/silebilir
CREATE POLICY "Authenticated users can insert artworks"
ON public.artworks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update artworks"
ON public.artworks FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete artworks"
ON public.artworks FOR DELETE
TO authenticated
USING (true);

-- Blog Posts için RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog posts are viewable by everyone"
ON public.blog_posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert blog posts"
ON public.blog_posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
ON public.blog_posts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete blog posts"
ON public.blog_posts FOR DELETE
TO authenticated
USING (true);

-- About Data için RLS
ALTER TABLE public.about_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "About data is viewable by everyone"
ON public.about_data FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can update about data"
ON public.about_data FOR UPDATE
TO authenticated
USING (true);

-- Orders için RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Sadece authenticated kullanıcılar siparişleri görebilir
CREATE POLICY "Only authenticated users can view orders"
ON public.orders FOR SELECT
TO authenticated
USING (true);

-- Herkes sipariş oluşturabilir (anonim kullanıcılar da)
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Sadece authenticated kullanıcılar silebilir
CREATE POLICY "Authenticated users can delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (true);

-- İlk about data kaydını oluştur (varsayılan değerler)
INSERT INTO public.about_data (title, content, image1, image2)
VALUES (
  'Yolculuğum',
  '1969 yılında memur bir ailenin ilk çocuğu olarak dünyaya geldim...',
  'https://picsum.photos/600/800?random=10',
  'https://picsum.photos/600/600?random=11'
)
ON CONFLICT DO NOTHING;

-- Storage bucket oluşturma (görseller için)
-- Not: Bu komut sadece bir kez çalıştırılmalı
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT DO NOTHING;

-- Storage için RLS politikaları
CREATE POLICY "Anyone can view artwork images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');

CREATE POLICY "Authenticated users can upload artwork images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artworks');

CREATE POLICY "Authenticated users can update artwork images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'artworks');

CREATE POLICY "Authenticated users can delete artwork images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'artworks');
