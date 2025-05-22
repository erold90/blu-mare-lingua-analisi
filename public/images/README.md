
# Directory Structure for Images

Questo progetto utilizza una struttura di directory specifica per le immagini. Si prega di seguire queste linee guida quando si aggiungono o modificano le immagini:

## Struttura delle Directory

```
public/
  └── images/
      ├── hero/
      │   └── hero.jpg              # Immagine principale della homepage
      ├── gallery/
      │   └── [image1.jpg, ...]     # Immagini della galleria nella homepage
      ├── apartments/
      │   ├── apartment1/           # Directory con nome dell'ID dell'appartamento
      │   │   └── [image1.jpg, ...] # Immagini per un appartamento specifico
      │   ├── apartment2/
      │   └── ...
      └── social/
          └── [image1.jpg, ...]     # Immagini utilizzate per i social media
```

## IMPORTANTE: Collocazione dei File Immagine

1. **Immagine Hero**:
   - Il file DEVE essere denominato esattamente `hero.jpg`
   - DEVE essere posizionato direttamente nella directory `/public/images/hero/`
   - Il percorso completo dovrebbe essere `/public/images/hero/hero.jpg`
   - Risoluzione consigliata: 1920x1080px

2. **Aggiornamento Immagini**:
   - Dopo aver caricato nuove immagini, potrebbe essere necessario aggiornare il browser
   - Se l'immagine non appare ancora, prova a cancellare la cache del browser

## Risoluzione dei Problemi

Se le immagini non appaiono dopo il caricamento:
1. Verifica che l'immagine sia nella posizione corretta con il nome esatto richiesto
2. Conferma che il formato dell'immagine sia JPG (per l'immagine hero)
3. Controlla la console del browser per eventuali messaggi di errore
4. Prova a cancellare la cache del browser e ricaricare
5. Assicurati che i permessi del file siano corretti
