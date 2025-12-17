-- Achievements (Başarılar) Tablosu
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Politikaları

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements FOR SELECT
USING (true);

-- Sadece authenticated kullanıcılar güncelleyebilir
CREATE POLICY "Authenticated users can update achievements"
ON public.achievements FOR UPDATE
TO authenticated
USING (true);

-- Sadece authenticated kullanıcılar ekleyebilir
CREATE POLICY "Authenticated users can insert achievements"
ON public.achievements FOR INSERT
TO authenticated
WITH CHECK (true);

-- İlk varsayılan kaydı oluştur
INSERT INTO public.achievements (image)
VALUES ('https://picsum.photos/450/600?random=20')
ON CONFLICT DO NOTHING;
