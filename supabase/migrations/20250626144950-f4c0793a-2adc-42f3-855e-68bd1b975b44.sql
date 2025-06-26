
-- Verifica il contenuto della tabella site_visits
SELECT 
    COUNT(*) as total_records,
    MIN(created_at) as first_record,
    MAX(created_at) as last_record,
    COUNT(DISTINCT page) as unique_pages
FROM site_visits;

-- Verifica i record più recenti
SELECT 
    id,
    page,
    timestamp,
    created_at,
    DATE(created_at) as visit_date
FROM site_visits 
ORDER BY created_at DESC 
LIMIT 20;

-- Verifica la distribuzione per data
SELECT 
    DATE(created_at) as visit_date,
    COUNT(*) as visits_count,
    COUNT(DISTINCT page) as unique_pages
FROM site_visits 
GROUP BY DATE(created_at)
ORDER BY visit_date DESC
LIMIT 10;

-- Verifica le pagine più visitate
SELECT 
    page,
    COUNT(*) as visit_count,
    MIN(created_at) as first_visit,
    MAX(created_at) as last_visit
FROM site_visits 
GROUP BY page
ORDER BY visit_count DESC
LIMIT 15;
