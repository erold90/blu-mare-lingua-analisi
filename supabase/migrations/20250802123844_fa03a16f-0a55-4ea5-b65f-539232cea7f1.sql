-- Genera prezzi per tutti gli anni dal 2027 al 2035 usando 2025 come riferimento
SELECT public.generate_weekly_prices_by_date_mapping(2027, 2025) as weeks_2027;
SELECT public.generate_weekly_prices_by_date_mapping(2028, 2025) as weeks_2028;
SELECT public.generate_weekly_prices_by_date_mapping(2029, 2025) as weeks_2029;
SELECT public.generate_weekly_prices_by_date_mapping(2030, 2025) as weeks_2030;
SELECT public.generate_weekly_prices_by_date_mapping(2031, 2025) as weeks_2031;
SELECT public.generate_weekly_prices_by_date_mapping(2032, 2025) as weeks_2032;
SELECT public.generate_weekly_prices_by_date_mapping(2033, 2025) as weeks_2033;
SELECT public.generate_weekly_prices_by_date_mapping(2034, 2025) as weeks_2034;
SELECT public.generate_weekly_prices_by_date_mapping(2035, 2025) as weeks_2035;