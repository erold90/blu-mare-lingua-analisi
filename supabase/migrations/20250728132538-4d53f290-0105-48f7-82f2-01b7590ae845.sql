-- Aggiorna i prezzi per il 2025 con date corrette del primo sabato di ogni mese
-- Elimina i prezzi esistenti per il 2025 e li reinserisce con le date corrette

-- Prima, elimina tutti i prezzi per il 2025
DELETE FROM prices WHERE year = 2025;

-- Inserisci i prezzi corretti per il 2025 (primo sabato di giugno: 7 giugno 2025)
INSERT INTO prices (apartment_id, year, week_start, price) VALUES
-- Giugno 2025
('appartamento-1', 2025, '2025-06-07', 400),
('appartamento-2', 2025, '2025-06-07', 500),
('appartamento-3', 2025, '2025-06-07', 350),
('appartamento-4', 2025, '2025-06-07', 375),

('appartamento-1', 2025, '2025-06-14', 400),
('appartamento-2', 2025, '2025-06-14', 500),
('appartamento-3', 2025, '2025-06-14', 350),
('appartamento-4', 2025, '2025-06-14', 375),

('appartamento-1', 2025, '2025-06-21', 400),
('appartamento-2', 2025, '2025-06-21', 500),
('appartamento-3', 2025, '2025-06-21', 350),
('appartamento-4', 2025, '2025-06-21', 375),

('appartamento-1', 2025, '2025-06-28', 475),
('appartamento-2', 2025, '2025-06-28', 575),
('appartamento-3', 2025, '2025-06-28', 425),
('appartamento-4', 2025, '2025-06-28', 450),

-- Luglio 2025
('appartamento-1', 2025, '2025-07-05', 475),
('appartamento-2', 2025, '2025-07-05', 575),
('appartamento-3', 2025, '2025-07-05', 425),
('appartamento-4', 2025, '2025-07-05', 450),

('appartamento-1', 2025, '2025-07-12', 475),
('appartamento-2', 2025, '2025-07-12', 575),
('appartamento-3', 2025, '2025-07-12', 425),
('appartamento-4', 2025, '2025-07-12', 450),

('appartamento-1', 2025, '2025-07-19', 750),
('appartamento-2', 2025, '2025-07-19', 850),
('appartamento-3', 2025, '2025-07-19', 665),
('appartamento-4', 2025, '2025-07-19', 700),

('appartamento-1', 2025, '2025-07-26', 750),
('appartamento-2', 2025, '2025-07-26', 850),
('appartamento-3', 2025, '2025-07-26', 665),
('appartamento-4', 2025, '2025-07-26', 700),

-- Agosto 2025
('appartamento-1', 2025, '2025-08-02', 1150),
('appartamento-2', 2025, '2025-08-02', 1250),
('appartamento-3', 2025, '2025-08-02', 1075),
('appartamento-4', 2025, '2025-08-02', 1100),

('appartamento-1', 2025, '2025-08-09', 1150),
('appartamento-2', 2025, '2025-08-09', 1250),
('appartamento-3', 2025, '2025-08-09', 1075),
('appartamento-4', 2025, '2025-08-09', 1100),

('appartamento-1', 2025, '2025-08-16', 750),
('appartamento-2', 2025, '2025-08-16', 850),
('appartamento-3', 2025, '2025-08-16', 675),
('appartamento-4', 2025, '2025-08-16', 700),

('appartamento-1', 2025, '2025-08-23', 750),
('appartamento-2', 2025, '2025-08-23', 850),
('appartamento-3', 2025, '2025-08-23', 675),
('appartamento-4', 2025, '2025-08-23', 700),

('appartamento-1', 2025, '2025-08-30', 500),
('appartamento-2', 2025, '2025-08-30', 600),
('appartamento-3', 2025, '2025-08-30', 425),
('appartamento-4', 2025, '2025-08-30', 450),

-- Settembre 2025
('appartamento-1', 2025, '2025-09-06', 500),
('appartamento-2', 2025, '2025-09-06', 600),
('appartamento-3', 2025, '2025-09-06', 425),
('appartamento-4', 2025, '2025-09-06', 450),

('appartamento-1', 2025, '2025-09-13', 500),
('appartamento-2', 2025, '2025-09-13', 600),
('appartamento-3', 2025, '2025-09-13', 425),
('appartamento-4', 2025, '2025-09-13', 450),

('appartamento-1', 2025, '2025-09-20', 500),
('appartamento-2', 2025, '2025-09-20', 600),
('appartamento-3', 2025, '2025-09-20', 425),
('appartamento-4', 2025, '2025-09-20', 450),

('appartamento-1', 2025, '2025-09-27', 500),
('appartamento-2', 2025, '2025-09-27', 600),
('appartamento-3', 2025, '2025-09-27', 425),
('appartamento-4', 2025, '2025-09-27', 450);

-- Pulizia dei prezzi per gli altri anni con date incongruenti
-- e rigenerazione con date corrette usando la logica del primo sabato
DELETE FROM prices WHERE year != 2025;

-- Per il 2026, genera le settimane con la stessa logica
-- Primo sabato di giugno 2026: 6 giugno 2026
INSERT INTO prices (apartment_id, year, week_start, price) 
SELECT 
  apt.id,
  2026,
  week_start,
  0 as price
FROM 
  (SELECT 'appartamento-1' as id UNION ALL
   SELECT 'appartamento-2' as id UNION ALL  
   SELECT 'appartamento-3' as id UNION ALL
   SELECT 'appartamento-4' as id) apt
CROSS JOIN
  (SELECT '2026-06-06'::date + (generate_series(0, 16) * interval '7 days')::interval as week_start) weeks
WHERE week_start <= '2026-09-26'::date;