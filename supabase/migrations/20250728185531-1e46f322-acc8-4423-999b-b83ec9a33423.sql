-- Creazione tabelle per sistema prezzi dinamico Villa MareBlu

-- Tabella apartamenti aggiornata
DROP TABLE IF EXISTS apartments CASCADE;
CREATE TABLE apartments (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  beds INTEGER NOT NULL,
  description TEXT,
  features TEXT[],
  base_price DECIMAL(10,2),
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserimento dati appartamenti
INSERT INTO apartments VALUES 
  (1, 'Piano Terra con Veranda', 6, 'Appartamento al piano terra naturalmente fresco', '{"veranda", "barbecue", "naturally_cool"}', 400, 50),
  (2, 'Terrazza Vista Mare 8 posti', 8, 'Ampio appartamento con terrazza panoramica', '{"sea_view", "large_terrace", "air_conditioning"}', 500, 60),
  (3, 'Studio Vista Mare', 4, 'Intimo appartamento con vista mare', '{"sea_view", "terrace", "air_conditioning"}', 350, 40),
  (4, 'Famiglia con Veranda', 5, 'Appartamento familiare con veranda attrezzata', '{"veranda", "family_friendly", "air_conditioning"}', 375, 45);

-- Tabella periodi di prezzo
CREATE TABLE pricing_periods (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER REFERENCES apartments(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekly_price DECIMAL(10,2) NOT NULL,
  season_name VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(apartment_id, start_date, end_date)
);

-- Tabella prenotazioni confermate
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER REFERENCES apartments(id),
  guest_name VARCHAR(100) NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  guests_total INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'confirmed',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella richieste preventivi (per analytics)
CREATE TABLE quote_requests (
  id SERIAL PRIMARY KEY,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL,
  children_no_bed INTEGER NOT NULL,
  selected_apartments INTEGER[],
  has_pet BOOLEAN DEFAULT false,
  pet_apartment INTEGER,
  linen_requested BOOLEAN DEFAULT false,
  base_total DECIMAL(10,2),
  discount_total DECIMAL(10,2),
  extras_total DECIMAL(10,2),
  final_total DECIMAL(10,2),
  whatsapp_sent BOOLEAN DEFAULT false,
  guest_name VARCHAR(100),
  guest_email VARCHAR(100),
  guest_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella notifiche admin
CREATE TABLE admin_notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  quote_id INTEGER REFERENCES quote_requests(id),
  read_at TIMESTAMP,
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserimento prezzi esistenti dalla specifica
INSERT INTO pricing_periods (apartment_id, start_date, end_date, weekly_price, season_name) VALUES
-- Appartamento 1
(1, '2025-06-07', '2025-06-27', 400, 'Bassa'),
(1, '2025-06-28', '2025-07-04', 400, 'Media'),
(1, '2025-07-05', '2025-07-11', 475, 'Media'),
(1, '2025-07-26', '2025-08-01', 750, 'Alta'),
(1, '2025-08-23', '2025-09-05', 750, 'Alta'),
(1, '2025-09-06', '2025-10-03', 500, 'Media'),

-- Appartamento 2
(2, '2025-06-07', '2025-06-20', 500, 'Bassa'),
(2, '2025-06-28', '2025-07-04', 500, 'Media'),
(2, '2025-07-05', '2025-07-25', 575, 'Media'),
(2, '2025-07-26', '2025-08-08', 850, 'Alta'),
(2, '2025-08-09', '2025-08-15', 1250, 'Altissima'),
(2, '2025-08-23', '2025-09-05', 850, 'Alta'),
(2, '2025-09-06', '2025-10-03', 600, 'Media'),

-- Appartamento 3
(3, '2025-06-07', '2025-06-27', 350, 'Bassa'),
(3, '2025-06-28', '2025-07-04', 350, 'Media'),
(3, '2025-07-05', '2025-07-25', 425, 'Media'),
(3, '2025-08-09', '2025-08-15', 1075, 'Altissima'),
(3, '2025-08-23', '2025-09-05', 675, 'Alta'),
(3, '2025-09-06', '2025-10-03', 425, 'Media'),

-- Appartamento 4
(4, '2025-06-07', '2025-06-27', 375, 'Bassa'),
(4, '2025-06-28', '2025-07-04', 375, 'Media'),
(4, '2025-07-05', '2025-07-11', 450, 'Media'),
(4, '2025-07-19', '2025-07-25', 450, 'Media'),
(4, '2025-07-26', '2025-08-01', 700, 'Alta'),
(4, '2025-08-23', '2025-09-05', 700, 'Alta'),
(4, '2025-09-06', '2025-10-03', 450, 'Media');

-- Inserimento prenotazioni esistenti
INSERT INTO bookings (apartment_id, guest_name, checkin_date, checkout_date, guests_total, total_price, status) VALUES
-- Appartamento 1
(1, 'Stanila Livia', '2025-07-12', '2025-07-26', 5, 950, 'confirmed'),
(1, 'Angela Monda', '2025-08-02', '2025-08-23', 6, 2000, 'confirmed'),

-- Appartamento 2  
(2, 'Davidescu Magdalena', '2025-06-21', '2025-06-28', 7, 575, 'confirmed'),
(2, 'Ida Manasterliu', '2025-08-16', '2025-08-23', 8, 850, 'confirmed'),

-- Appartamento 3
(3, 'Dechambre Manon', '2025-07-26', '2025-08-09', 4, 1200, 'confirmed'),
(3, 'Elisa Valdo', '2025-08-16', '2025-08-23', 3, 675, 'confirmed'),

-- Appartamento 4
(4, 'Metta Laura', '2025-07-12', '2025-07-19', 4, 450, 'confirmed'),
(4, 'Nestri Valeria', '2025-08-02', '2025-08-09', 5, 700, 'confirmed'),
(4, 'Salvatore Somma', '2025-08-09', '2025-08-23', 4, 950, 'confirmed');

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pricing_periods_updated_at 
    BEFORE UPDATE ON pricing_periods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();