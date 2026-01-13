# STRATEGIA RIDUZIONE STEP: 7 → 5

**Progetto:** villamareblu.it - Wizard Preventivo
**Data Analisi:** 14 Gennaio 2026
**Obiettivo:** Ridurre da 7 a 5 step mantenendo UI minimale, elegante e mobile-friendly

---

## 1. SITUAZIONE ATTUALE

### Flusso 7 Step
```
[1] Ospiti          → Adulti, bambini, posti letto
[2] Date            → Check-in/out, validazioni Sabato, Ferragosto
[3] Appartamenti    → Selezione + disponibilità + prezzi
[4] Animali         → Checkbox + contatore
[5] Biancheria      → Checkbox
[6] Riepilogo       → Calcolo preventivo completo
[7] Invio WhatsApp  → Dati contatto + invio
```

### Analisi Complessità

| Step | Complessità | Righe Codice | Validazioni Critiche |
|------|-------------|--------------|---------------------|
| 1. Ospiti | ⚠️ ALTA | 195 | Calcolo posti letto, capienza villa (max 23) |
| 2. Date | ⚠️ ALTA | 303 | Solo Sab/Dom/Lun, min 5 notti, regola Ferragosto, blocchi DB |
| 3. Appartamenti | ⚠️ ALTA | 340 | Disponibilità real-time, calcolo capienza, prezzi dinamici |
| 4. Animali | ✅ BASSA | 169 | Nessuna (checkbox + counter) |
| 5. Biancheria | ✅ BASSA | 144 | Nessuna (checkbox) |
| 6. Riepilogo | ⚠️ MEDIA | 511 | Calcolo prezzi, sconti, deposito, cauzione |
| 7. WhatsApp | ⚠️ MEDIA | 216 | Validazione email/nome, formattazione messaggio |

### Componenti Principali Analizzati

**useMultiStepQuote.tsx (431 righe)**
- Gestione stato completo form
- Validazioni critiche:
  - `getBedsNeeded()`: adulti + bambini senza genitori
  - `requiresTwoWeeksMinimum()`: regola Ferragosto complessa
  - `isValidDay()`: solo Sabato/Domenica/Lunedì
  - `getNights()`: calcolo timezone-safe
- Calcolo prezzi con `PricingService`

**PricingService (455 righe)**
- Algoritmo prezzi complesso:
  - 5-6 notti = prezzo settimanale pieno
  - 7+ notti = calcolo proporzionale multi-periodo
  - Sconti occupazione (0%, 5%, 10%, 15%)
  - Arrotondamento multipli di €50 (sempre per difetto)
- Cache con TTL 5 minuti
- Verifica disponibilità vs prenotazioni/blocchi DB

---

## 2. STRATEGIA CONSIGLIATA: OPZIONE A

### Nuovo Flusso 5 Step
```
[1] Ospiti          → INVARIATO (complessità alta)
[2] Date            → INVARIATO (complessità alta)
[3] Appartamenti    → INVARIATO (complessità alta)
[4] Servizi Extra   → MERGE: Animali + Biancheria (complessità bassa)
[5] Riepilogo       → MERGE: Riepilogo + Invio WhatsApp (flusso naturale)
```

### Motivazione

✅ **Vantaggi:**
- Step 1-3 restano focalizzati (1 domanda = 1 step = UX pulita)
- Step 4-5 originali sono semplici → facili da unificare
- Step 6-7 sono già logicamente collegati (vedi → conferma → invia)
- Minimal code changes (solo 2 nuovi componenti)
- Zero impatto su validazioni critiche
- Mobile-friendly preservato

❌ **Svantaggi:**
- Nessuno significativo

---

## 3. DETTAGLIO IMPLEMENTAZIONE

### 3.1 Nuovo Step 4: "Servizi Extra"

**File da creare:** `src/components/quote/StepServices.tsx`

**Struttura UI:**
```
┌─────────────────────────────────────────┐
│  🎒 Servizi Extra                       │
│                                         │
│  Scegli i servizi aggiuntivi           │
├─────────────────────────────────────────┤
│                                         │
│  [Card 1: Animali Domestici]            │
│  ┌───────────────────────────────────┐  │
│  │ 🐕 Viaggi con animali?            │  │
│  │ [ ] Sì, porto animali (+€50/cad)  │  │
│  │                                   │  │
│  │ [Se checked:]                     │  │
│  │ Quanti animali?                   │  │
│  │  [-]  1  [+]                      │  │
│  │                                   │  │
│  │ 💰 Costo: €50                     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Card 2: Biancheria]                   │
│  ┌───────────────────────────────────┐  │
│  │ 🛏️ Biancheria da letto            │  │
│  │ [ ] Sì, richiedo biancheria       │  │
│  │     (+€15/persona)                │  │
│  │                                   │  │
│  │ [Se checked:]                     │  │
│  │ Per {bedsNeeded} posti letto      │  │
│  │                                   │  │
│  │ 💰 Costo: €{bedsNeeded × 15}      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Totale Servizi: €XXX]                 │
│                                         │
│  [Indietro]          [Continua]         │
└─────────────────────────────────────────┘
```

**Codice Skeleton:**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PawPrint, Bed, Euro } from 'lucide-react';

interface StepServicesProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getBedsNeeded: () => number;
}

export default function StepServices({
  formData,
  updateFormData,
  onNext,
  onPrev,
  getBedsNeeded
}: StepServicesProps) {
  const bedsNeeded = getBedsNeeded();

  // Calcolo costi
  const petCost = formData.hasPets ? (formData.petCount || 1) * 50 : 0;
  const linenCost = formData.requestLinen ? bedsNeeded * 15 : 0;
  const totalServicesCost = petCost + linenCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <PawPrint className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Servizi Extra</h2>
        <p className="text-muted-foreground">
          Seleziona i servizi aggiuntivi opzionali
        </p>
      </div>

      {/* Card Animali */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5" />
            Animali Domestici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasPets"
              checked={formData.hasPets}
              onCheckedChange={(checked) =>
                updateFormData({
                  hasPets: checked as boolean,
                  petCount: checked ? 1 : 0
                })
              }
            />
            <div className="flex-1">
              <label htmlFor="hasPets" className="font-medium cursor-pointer">
                Sì, porto animali domestici
              </label>
              <p className="text-sm text-muted-foreground">
                Supplemento €50 per animale
              </p>
            </div>
          </div>

          {formData.hasPets && (
            <div className="ml-7 p-4 bg-muted rounded-lg space-y-3">
              <label className="text-sm font-medium">
                Quanti animali?
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateFormData({
                    petCount: Math.max(1, (formData.petCount || 1) - 1)
                  })}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <span className="text-2xl font-bold w-12 text-center">
                  {formData.petCount || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateFormData({
                    petCount: (formData.petCount || 1) + 1
                  })}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                <Euro className="h-3 w-3" />
                Costo: €{petCost}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Biancheria */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Biancheria da Letto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="requestLinen"
              checked={formData.requestLinen}
              onCheckedChange={(checked) =>
                updateFormData({ requestLinen: checked as boolean })
              }
            />
            <div className="flex-1">
              <label htmlFor="requestLinen" className="font-medium cursor-pointer">
                Sì, richiedo biancheria da letto
              </label>
              <p className="text-sm text-muted-foreground">
                Supplemento €15 per persona
              </p>
            </div>
          </div>

          {formData.requestLinen && (
            <div className="ml-7 p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm">
                Per <span className="font-bold">{bedsNeeded}</span> posti letto
              </p>
              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                <Euro className="h-3 w-3" />
                Costo: €{linenCost}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totale Servizi */}
      {totalServicesCost > 0 && (
        <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Totale Servizi Extra:</span>
              <Badge className="text-lg py-1 px-3">
                €{totalServicesCost}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPrev} size="lg">
          Indietro
        </Button>
        <Button onClick={onNext} size="lg" className="min-w-[200px]">
          Continua al Riepilogo
        </Button>
      </div>
    </div>
  );
}
```

---

### 3.2 Nuovo Step 5: "Riepilogo e Invio"

**File da modificare:** `src/components/quote/StepSummary.tsx`

**Modifiche necessarie:**
1. Integrare form dati contatto (da StepWhatsApp)
2. Unificare pulsante "Continua" → "Invia su WhatsApp"
3. Mantenere tutto il calcolo prezzi esistente

**Struttura UI Aggiornata:**
```
┌─────────────────────────────────────────┐
│  📋 Riepilogo e Conferma                │
│                                         │
│  Verifica i dettagli e invia richiesta  │
├─────────────────────────────────────────┤
│                                         │
│  [Card: Soggiorno]                      │
│  Check-in: XX/XX/XXXX                   │
│  Check-out: XX/XX/XXXX                  │
│  Notti: X                               │
│                                         │
│  [Card: Ospiti]                         │
│  Adulti: X, Bambini: X                  │
│  Posti letto: X                         │
│                                         │
│  [Card: Appartamenti]                   │
│  - App 1: €XXX (occupazione XX%)        │
│  - App 2: €XXX (occupazione XX%)        │
│                                         │
│  [Card: Servizi Extra]                  │
│  - Animali: €XX                         │
│  - Biancheria: €XX                      │
│                                         │
│  [Card: TOTALE]                         │
│  Subtotale: €XXX                        │
│  Sconto: -€XX                           │
│  TOTALE: €XXX                           │
│  Caparra 30%: €XXX                      │
│  Saldo: €XXX                            │
│  Cauzione: €XXX                         │
├─────────────────────────────────────────┤
│  [Card: I tuoi dati]                    │
│  Nome e Cognome * [________]            │
│  Email *          [________]            │
│  Telefono         [________]            │
├─────────────────────────────────────────┤
│  [Indietro]  [📤 Invia su WhatsApp]     │
└─────────────────────────────────────────┘
```

**Implementazione:**
- Incorporare il form contatti (User, Mail, Phone icons) dopo il riepilogo prezzi
- Il pulsante "Continua" diventa "Invia su WhatsApp" con icona Send
- Validazione: `canSend = guestName && email` (invariata)
- Logica invio WhatsApp rimane identica (righe 63-118 di StepWhatsApp.tsx)

---

### 3.3 Aggiornamento RequestQuotePage.tsx

**Modifiche necessarie:**

```typescript
// PRIMA (7 step)
const steps = [
  'Ospiti',       // 1
  'Date',         // 2
  'Appartamenti', // 3
  'Animali',      // 4
  'Biancheria',   // 5
  'Riepilogo',    // 6
  'Invio'         // 7
];

// DOPO (5 step)
const steps = [
  'Ospiti',         // 1
  'Date',           // 2
  'Appartamenti',   // 3
  'Servizi Extra',  // 4 (merge Animali + Biancheria)
  'Riepilogo'       // 5 (merge Riepilogo + Invio)
];
```

**Render step component:**
```typescript
{currentStep === 0 && <StepGuests {...props} />}
{currentStep === 1 && <StepDates {...props} />}
{currentStep === 2 && <StepApartments {...props} />}
{currentStep === 3 && <StepServices {...props} />}        {/* NUOVO */}
{currentStep === 4 && <StepSummary {...props} />}         {/* MODIFICATO: include invio WhatsApp */}
```

**Progress bar automatico:**
- Cambia da "Step X/7" a "Step X/5"
- Percentuali aggiornate automaticamente: step 4 = 80%, step 5 = 100%

---

## 4. CHECKLIST VALIDAZIONI DA PRESERVARE

### ✅ Step 1 - Ospiti
- [ ] `bedsNeeded <= 23` (capienza totale villa)
- [ ] Calcolo corretto: `adulti + bambini - bambiniConGenitori`
- [ ] UI counter touch-optimized (h-12 mobile)

### ✅ Step 2 - Date
- [ ] Solo Sabato/Domenica/Lunedì selezionabili
- [ ] Minimo 5 notti, massimo 28 notti
- [ ] Regola Ferragosto: se 15 agosto = sabato → 2 settimane minime
- [ ] Verifica blocchi da Supabase `date_blocks`
- [ ] Verifica stagione (1 giugno - 31 ottobre)

### ✅ Step 3 - Appartamenti
- [ ] Verifica disponibilità real-time da DB
- [ ] Capacità totale >= bedsNeeded
- [ ] Prezzi dinamici da `weekly_prices` table
- [ ] Calcolo corretto con 10% sconto preview

### ✅ Step 4 - Servizi (NUOVO)
- [ ] Checkbox pets funzionante
- [ ] Pet counter: min 1, no max (ragionevole: 1-10)
- [ ] Checkbox linen funzionante
- [ ] Calcolo costi: pets × €50, bedsNeeded × €15
- [ ] Display totale servizi

### ✅ Step 5 - Riepilogo (MODIFICATO)
- [ ] Tutti i calcoli prezzi invariati (PricingService)
- [ ] Sconti occupazione corretti (0%, 5%, 10%, 15%)
- [ ] Arrotondamento multipli €50 per difetto
- [ ] Form contatti: nome* + email* + telefono(opzionale)
- [ ] Validazione email format
- [ ] Messaggio WhatsApp formattato correttamente
- [ ] Salvataggio preventivo in Supabase `quote_requests`

---

## 5. FILE DA MODIFICARE/CREARE

### Nuovi File
1. **`src/components/quote/StepServices.tsx`** (nuovo)
   - Merge StepPets + StepLinen
   - ~200-250 righe stimate

### File da Modificare
2. **`src/components/quote/StepSummary.tsx`** (modifica)
   - Aggiungere form contatti da StepWhatsApp
   - Cambiare pulsante "Continua" → "Invia su WhatsApp"
   - Aggiungere logica invio WhatsApp
   - ~550-600 righe stimate (da 511)

3. **`src/pages/RequestQuotePage.tsx`** (modifica)
   - Aggiornare array `steps` (7 → 5)
   - Aggiornare render component (currentStep === 3 → StepServices)
   - ~180-200 righe stimate (da 169)

### File da ELIMINARE (dopo test)
4. **`src/components/quote/StepPets.tsx`** (elimina)
5. **`src/components/quote/StepLinen.tsx`** (elimina)
6. **`src/components/quote/StepWhatsApp.tsx`** (elimina)

### File Invariati (ZERO modifiche)
- ✅ `src/hooks/useMultiStepQuote.tsx` - Logica centrale invariata
- ✅ `src/components/quote/StepGuests.tsx` - Invariato
- ✅ `src/components/quote/StepDates.tsx` - Invariato
- ✅ `src/components/quote/StepApartments.tsx` - Invariato
- ✅ `src/services/supabase/dynamicPricingService.ts` - Invariato
- ✅ `src/hooks/useDynamicQuote.tsx` - Invariato

---

## 6. STIMA EFFORT

| Attività | Complessità | Tempo Stimato |
|----------|-------------|---------------|
| Creare StepServices.tsx | 🟢 Bassa | 30-45 min |
| Modificare StepSummary.tsx | 🟡 Media | 45-60 min |
| Aggiornare RequestQuotePage.tsx | 🟢 Bassa | 15-20 min |
| Testing completo wizard | 🟡 Media | 45-60 min |
| Testing mobile/responsive | 🟢 Bassa | 20-30 min |
| Fix eventuali bug | 🟡 Media | 30-60 min |
| **TOTALE** | | **3-4 ore** |

---

## 7. PIANO DI ROLLOUT

### Fase 1: Setup (15 min)
1. Creare branch Git: `feature/reduce-steps-7-to-5`
2. Backup locale del progetto
3. Verificare ambiente di sviluppo funzionante

### Fase 2: Implementazione (2 ore)
1. Creare `StepServices.tsx` (merge Pets + Linen)
2. Modificare `StepSummary.tsx` (aggiungere form contatti + WhatsApp)
3. Aggiornare `RequestQuotePage.tsx` (array steps, render logic)

### Fase 3: Testing (1 ora)
1. Test percorso completo 1→5 con dati reali
2. Verificare tutti i calcoli prezzi
3. Test invio WhatsApp (messaggio formattato)
4. Test responsive mobile (iPhone, Android)
5. Test validazioni (date, capienza, email)

### Fase 4: Cleanup (15 min)
1. Eliminare file obsoleti (StepPets, StepLinen, StepWhatsApp)
2. Verificare nessun import residuo
3. Build produzione: `npm run build`
4. Test build in locale

### Fase 5: Deploy (30 min)
1. Commit + push su GitHub
2. Vercel auto-deploy
3. Test su URL produzione
4. Monitorare errori console

---

## 8. RISCHI E MITIGAZIONI

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Bug calcolo prezzi | 🟡 Media | 🔴 Alto | Testare con dati reali 2026, verificare PricingService invariato |
| Layout rotto mobile | 🟢 Bassa | 🟡 Medio | Usare stessi pattern Tailwind degli step esistenti |
| Messaggio WhatsApp malformato | 🟢 Bassa | 🟡 Medio | Copiare logica esatta da StepWhatsApp.tsx (righe 75-112) |
| Validazioni saltate | 🟢 Bassa | 🔴 Alto | Checklist validazioni (sezione 4) prima del deploy |
| Incompatibilità Supabase | 🟢 Bassa | 🔴 Alto | Nessuna modifica alle query DB, solo UI reshuffling |

---

## 9. METRICHE DI SUCCESSO

### Pre-implementazione (baseline attuale)
- ⏱️ Tempo medio completamento wizard: ? (da misurare)
- 📉 Tasso abbandono per step: ? (da analytics)
- 📱 Usabilità mobile: ? (feedback qualitativo)

### Post-implementazione (target)
- ⏱️ Tempo completamento: -20% (meno step = più veloce)
- 📉 Tasso abbandono: -15% (meno friction points)
- 📱 Usabilità mobile: stesso livello o migliore
- ✅ Tasso conversione WhatsApp: >= attuale

---

## 10. DOMANDE APERTE PER L'UTENTE

Prima di procedere con l'implementazione:

1. **Confermi la strategia Opzione A** (merge Step 4+5, merge Step 6+7)?
   - [ ] Sì, procedi
   - [ ] No, preferisco Opzione B (specificare)

2. **Ordine servizi extra:**
   - [ ] Animali prima, Biancheria dopo (come ora)
   - [ ] Biancheria prima, Animali dopo

3. **Titolo Step 4:**
   - [ ] "Servizi Extra"
   - [ ] "Servizi Aggiuntivi"
   - [ ] "Opzioni Extra"
   - [ ] Altro: __________

4. **Icona Step 4:**
   - [ ] 🎒 Zaino (servizi)
   - [ ] 🛎️ Campanello (hotel)
   - [ ] ⚙️ Settings
   - [ ] Altra: __________

5. **Layout Step 5 (Riepilogo + Invio):**
   - [ ] Form contatti sotto il riepilogo (raccomandato)
   - [ ] Form contatti prima del riepilogo
   - [ ] Form contatti in un card separato laterale

6. **Testing su dispositivi reali:**
   - Hai iPhone/Android per test mobile prima del deploy?
   - [ ] Sì
   - [ ] No (userò DevTools)

---

## 11. PROSSIMI STEP

**Se approvi questa strategia:**

1. ✅ **FATTO:** Analisi completa codebase
2. ✅ **FATTO:** Documento strategia dettagliato
3. ⏳ **PENDING:** Tua approvazione strategia
4. ⏳ **TODO:** Implementazione Step 4 (StepServices)
5. ⏳ **TODO:** Modifica Step 5 (StepSummary + WhatsApp)
6. ⏳ **TODO:** Aggiornamento RequestQuotePage
7. ⏳ **TODO:** Testing completo
8. ⏳ **TODO:** Deploy produzione

---

**Documento compilato da:** Claude Opus 4.5
**Per:** Villa MareBlu Management System
**Ultima revisione:** 14 Gennaio 2026
