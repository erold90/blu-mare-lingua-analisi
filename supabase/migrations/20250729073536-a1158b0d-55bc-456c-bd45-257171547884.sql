-- Update weekly prices for 2025 according to new price list
-- First, delete existing 2025 prices
DELETE FROM public.weekly_prices WHERE year = 2025;

-- APPARTAMENTO 1 (6 posti letto)
-- 7 giugno - 27 giugno: €400
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-06-07', '2025-06-13', 23, 400),
('appartamento-1', 2025, '2025-06-14', '2025-06-20', 24, 400),
('appartamento-1', 2025, '2025-06-21', '2025-06-27', 25, 400);

-- 28 giugno - 4 luglio: €400
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-06-28', '2025-07-04', 26, 400);

-- 5 luglio - 11 luglio: €475
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-07-05', '2025-07-11', 27, 475);

-- 12 luglio - 26 luglio: €475
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-07-12', '2025-07-18', 28, 475),
('appartamento-1', 2025, '2025-07-19', '2025-07-25', 29, 475);

-- 26 luglio - 1 agosto: €750
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-07-26', '2025-08-01', 30, 750);

-- 2 agosto - 23 agosto: €750
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-08-02', '2025-08-08', 31, 750),
('appartamento-1', 2025, '2025-08-09', '2025-08-15', 32, 750),
('appartamento-1', 2025, '2025-08-16', '2025-08-22', 33, 750);

-- 23 agosto - 5 settembre: €750
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-08-23', '2025-08-29', 34, 750),
('appartamento-1', 2025, '2025-08-30', '2025-09-05', 35, 750);

-- 6 settembre - 3 ottobre: €500
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-1', 2025, '2025-09-06', '2025-09-12', 36, 500),
('appartamento-1', 2025, '2025-09-13', '2025-09-19', 37, 500),
('appartamento-1', 2025, '2025-09-20', '2025-09-26', 38, 500),
('appartamento-1', 2025, '2025-09-27', '2025-10-03', 39, 500);

-- APPARTAMENTO 2 (8 posti letto)
-- 7 giugno - 20 giugno: €500
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-06-07', '2025-06-13', 23, 500),
('appartamento-2', 2025, '2025-06-14', '2025-06-20', 24, 500);

-- 21 giugno - 28 giugno: €500
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-06-21', '2025-06-27', 25, 500);

-- 28 giugno - 4 luglio: €500
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-06-28', '2025-07-04', 26, 500);

-- 5 luglio - 25 luglio: €575
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-07-05', '2025-07-11', 27, 575),
('appartamento-2', 2025, '2025-07-12', '2025-07-18', 28, 575),
('appartamento-2', 2025, '2025-07-19', '2025-07-25', 29, 575);

-- 26 luglio - 8 agosto: €850
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-07-26', '2025-08-01', 30, 850),
('appartamento-2', 2025, '2025-08-02', '2025-08-08', 31, 850);

-- 9 agosto - 15 agosto: €1.250
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-08-09', '2025-08-15', 32, 1250);

-- 16 agosto - 23 agosto: €1.250
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-08-16', '2025-08-22', 33, 1250);

-- 23 agosto - 5 settembre: €850
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-08-23', '2025-08-29', 34, 850),
('appartamento-2', 2025, '2025-08-30', '2025-09-05', 35, 850);

-- 6 settembre - 3 ottobre: €600
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-2', 2025, '2025-09-06', '2025-09-12', 36, 600),
('appartamento-2', 2025, '2025-09-13', '2025-09-19', 37, 600),
('appartamento-2', 2025, '2025-09-20', '2025-09-26', 38, 600),
('appartamento-2', 2025, '2025-09-27', '2025-10-03', 39, 600);

-- APPARTAMENTO 3 (4 posti letto)
-- 7 giugno - 27 giugno: €350
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-06-07', '2025-06-13', 23, 350),
('appartamento-3', 2025, '2025-06-14', '2025-06-20', 24, 350),
('appartamento-3', 2025, '2025-06-21', '2025-06-27', 25, 350);

-- 28 giugno - 4 luglio: €350
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-06-28', '2025-07-04', 26, 350);

-- 5 luglio - 25 luglio: €425
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-07-05', '2025-07-11', 27, 425),
('appartamento-3', 2025, '2025-07-12', '2025-07-18', 28, 425),
('appartamento-3', 2025, '2025-07-19', '2025-07-25', 29, 425);

-- 26 luglio - 9 agosto: €1.075
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-07-26', '2025-08-01', 30, 1075),
('appartamento-3', 2025, '2025-08-02', '2025-08-08', 31, 1075);

-- 9 agosto - 15 agosto: €1.075
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-08-09', '2025-08-15', 32, 1075);

-- 16 agosto - 23 agosto: €1.075
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-08-16', '2025-08-22', 33, 1075);

-- 23 agosto - 5 settembre: €675
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-08-23', '2025-08-29', 34, 675),
('appartamento-3', 2025, '2025-08-30', '2025-09-05', 35, 675);

-- 6 settembre - 3 ottobre: €425
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-3', 2025, '2025-09-06', '2025-09-12', 36, 425),
('appartamento-3', 2025, '2025-09-13', '2025-09-19', 37, 425),
('appartamento-3', 2025, '2025-09-20', '2025-09-26', 38, 425),
('appartamento-3', 2025, '2025-09-27', '2025-10-03', 39, 425);

-- APPARTAMENTO 4 (5 posti letto)
-- 7 giugno - 27 giugno: €375
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-06-07', '2025-06-13', 23, 375),
('appartamento-4', 2025, '2025-06-14', '2025-06-20', 24, 375),
('appartamento-4', 2025, '2025-06-21', '2025-06-27', 25, 375);

-- 28 giugno - 4 luglio: €375
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-06-28', '2025-07-04', 26, 375);

-- 5 luglio - 11 luglio: €450
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-07-05', '2025-07-11', 27, 450);

-- 12 luglio - 19 luglio: €450
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-07-12', '2025-07-18', 28, 450);

-- 19 luglio - 25 luglio: €450
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-07-19', '2025-07-25', 29, 450);

-- 26 luglio - 1 agosto: €700
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-07-26', '2025-08-01', 30, 700);

-- 2 agosto - 9 agosto: €700
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-08-02', '2025-08-08', 31, 700);

-- 9 agosto - 23 agosto: €700
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-08-09', '2025-08-15', 32, 700),
('appartamento-4', 2025, '2025-08-16', '2025-08-22', 33, 700);

-- 23 agosto - 5 settembre: €700
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-08-23', '2025-08-29', 34, 700),
('appartamento-4', 2025, '2025-08-30', '2025-09-05', 35, 700);

-- 6 settembre - 3 ottobre: €450
INSERT INTO public.weekly_prices (apartment_id, year, week_start, week_end, week_number, price) VALUES
('appartamento-4', 2025, '2025-09-06', '2025-09-12', 36, 450),
('appartamento-4', 2025, '2025-09-13', '2025-09-19', 37, 450),
('appartamento-4', 2025, '2025-09-20', '2025-09-26', 38, 450),
('appartamento-4', 2025, '2025-09-27', '2025-10-03', 39, 450);