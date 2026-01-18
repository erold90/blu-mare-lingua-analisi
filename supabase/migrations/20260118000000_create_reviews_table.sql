-- Tabella per le recensioni Google Business Profile
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  relative_time TEXT, -- "2 mesi fa", "1 anno fa", etc.
  review_date TIMESTAMP WITH TIME ZONE,
  profile_photo_url TEXT,
  google_review_id TEXT UNIQUE, -- Per evitare duplicati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per query veloci
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_date ON reviews(review_date DESC);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Tutti possono leggere le recensioni (pubbliche)
CREATE POLICY "Reviews are publicly readable"
  ON reviews FOR SELECT
  USING (true);

-- Solo admin può inserire/modificare
CREATE POLICY "Only authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update reviews"
  ON reviews FOR UPDATE
  USING (auth.role() = 'authenticated');
