-- Aggiunge la policy DELETE mancante per la tabella reviews
-- Permette agli utenti autenticati di eliminare le recensioni

CREATE POLICY "Only authenticated users can delete reviews"
  ON reviews FOR DELETE
  USING (auth.role() = 'authenticated');
