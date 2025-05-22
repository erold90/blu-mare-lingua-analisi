
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
   - Il file DEVE essere denominato esattamente `hero.jpg` (tutto minuscolo)
   - DEVE essere posizionato direttamente nella directory `/public/images/hero/`
   - Il percorso completo dovrebbe essere `/public/images/hero/hero.jpg`
   - Risoluzione consigliata: 1920x1080px

2. **Aggiornamento Immagini**:
   - Dopo aver caricato nuove immagini, potrebbe essere necessario aggiornare il browser
   - Se l'immagine non appare ancora, prova a cancellare la cache del browser con:
     - Windows: Ctrl+F5 o Ctrl+Shift+R
     - Mac: Cmd+Shift+R
     - In alternativa usa il pulsante "Riprova" nell'interfaccia

## Caricamento Immagini tramite GitHub

Se il progetto è collegato a GitHub, puoi caricare le immagini direttamente nel repository:

1. Accedi al repository GitHub collegato
2. Naviga alla directory appropriata (es. `public/images/hero/`)
3. Clicca su "Add file" > "Upload files"
4. Seleziona o trascina il file immagine
5. Aggiungi un messaggio di commit (es. "Aggiunta immagine hero")
6. Clicca su "Commit changes"
7. Attendi la sincronizzazione con Lovable e aggiorna la pagina

## Risoluzione dei Problemi

Se le immagini non appaiono dopo il caricamento:

1. Verifica che l'immagine sia nella posizione corretta con il nome esatto richiesto
2. Conferma che il formato dell'immagine sia JPG (per l'immagine hero)
3. Controlla la console del browser per eventuali messaggi di errore
4. Prova a cancellare la cache del browser e ricaricare (Ctrl+F5 o Cmd+Shift+R)
5. Usa il pulsante "Riprova" nell'interfaccia per forzare un nuovo controllo
6. Assicurati che i permessi del file siano corretti
7. Verifica che il file non sia corrotto caricandolo in un'altra applicazione

Se il problema persiste, potrebbe essere necessario controllare la configurazione del server o il codice che carica l'immagine.
