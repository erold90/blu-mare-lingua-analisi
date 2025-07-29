-- Rimuovere il preventivo duplicato e aggiornare quello valido
-- Eliminare il preventivo #2 (duplicato)
DELETE FROM quote_requests WHERE id = 2;

-- Aggiornare il preventivo #3 per marcarlo come inviato via WhatsApp
UPDATE quote_requests 
SET whatsapp_sent = true 
WHERE id = 3;