
# Configurazione EmailJS per Villa MareBlu

## Passaggi per attivare il modulo contatti:

### 1. Crea un account EmailJS
- Vai su [EmailJS.com](https://www.emailjs.com/)
- Registrati gratuitamente (fino a 200 email/mese gratis)

### 2. Configura il servizio email
1. Nella dashboard EmailJS, vai su **Email Services**
2. Clicca **Add New Service**
3. Scegli il tuo provider email (Gmail, Outlook, ecc.)
4. Segui la configurazione guidata
5. Copia il **Service ID** generato

### 3. Crea un template email
1. Vai su **Email Templates**
2. Clicca **Create New Template**
3. Usa questo template HTML per le email:

```html
Oggetto: Nuova richiesta da Villa MareBlu - {{subject}}

Nuovo messaggio dal sito Villa MareBlu:

Nome: {{firstName}} {{lastName}}
Email: {{email}}
Telefono: {{phone}}
Oggetto: {{subject}}

Messaggio:
{{message}}

---
Questo messaggio è stato inviato tramite il modulo contatti di www.villamareblu.it
```

4. Copia il **Template ID** generato

### 4. Ottieni la Public Key
1. Vai su **Account** → **General**
2. Copia la **Public Key**

### 5. Aggiorna il codice
Nel file `src/pages/ContactsPage.tsx`, sostituisci:
- `YOUR_SERVICE_ID` con il tuo Service ID
- `YOUR_TEMPLATE_ID` con il tuo Template ID  
- `YOUR_PUBLIC_KEY` con la tua Public Key

### 6. Test
- Ricarica il sito
- Compila e invia il modulo
- Controlla la tua email per verificare che arrivi

## Configurazione Email di Destinazione
Assicurati che EmailJS invii le email a: **macchiaforcato@gmail.com**

## Limiti del piano gratuito:
- 200 email/mese
- Branding EmailJS nelle email
- Per rimuovere limiti, considera l'upgrade al piano a pagamento
