
import * as React from "react";
import { Cookie, Shield, BarChart3, Target } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { getLocalBusinessSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/contexts/CookieContext";

const CookiePolicyPage = () => {
  const { openCustomization } = useCookieConsent();
  
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Cookie Policy", url: "/cookie-policy" }
  ]);

  const localBusinessSchema = getLocalBusinessSchema();

  return (
    <>
      <SEOHead
        title="Cookie Policy - Villa MareBlu Salento"
        description="Informazioni dettagliate sui cookie utilizzati dal sito di Villa MareBlu. Scopri come gestiamo i cookie e come puoi controllarli secondo la normativa GDPR."
        keywords="cookie policy, gestione cookie, villa mareblu, salento, privacy, gdpr, consenso cookie"
        canonicalUrl="/cookie-policy"
        structuredData={[breadcrumbSchema, localBusinessSchema]}
      />
      <div className="container px-4 py-8 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Cookie className="h-6 w-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Cookie Policy</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-6">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-3 text-blue-800">Gestisci le tue preferenze</h2>
            <p className="mb-4 text-blue-700">
              Puoi modificare le tue preferenze sui cookie in qualsiasi momento cliccando il pulsante qui sotto.
            </p>
            <Button onClick={openCustomization} className="bg-blue-600 hover:bg-blue-700">
              <Cookie className="h-4 w-4 mr-2" />
              Gestisci Cookie
            </Button>
          </div>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cosa sono i cookie?</h2>
            <p>
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo computer o dispositivo mobile quando visiti un sito web. 
              Sono ampiamente utilizzati per far funzionare i siti web in modo più efficiente e per fornire informazioni ai proprietari del sito.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Come utilizziamo i cookie</h2>
            <p className="mb-6">
              Il nostro sito web utilizza cookie per diversi scopi. Alcuni cookie sono necessari per il funzionamento tecnico del sito, 
              mentre altri ci permettono di ottimizzare la tua esperienza e di offrirti contenuti personalizzati.
            </p>
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Cookie Necessari</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Sempre attivi</strong> - Non possono essere disattivati
                </p>
                <p className="text-sm">
                  Questi cookie sono essenziali per il funzionamento del nostro sito web e non possono essere disattivati nei nostri sistemi. 
                  Generalmente vengono impostati solo in risposta ad azioni da te effettuate che costituiscono una richiesta di servizi, 
                  come l'impostazione delle tue preferenze di privacy, l'accesso o la compilazione di moduli.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Esempi:</h4>
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    <li>Cookie di sessione per mantenere il login</li>
                    <li>Preferenze di lingua e regione</li>
                    <li>Token di sicurezza anti-frode</li>
                    <li>Consenso ai cookie</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Cookie Statistici</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Opzionali</strong> - Richiedono il tuo consenso
                </p>
                <p className="text-sm">
                  Questi cookie ci permettono di contare le visite e le fonti di traffico, in modo da poter misurare e migliorare le prestazioni del nostro sito. 
                  Ci aiutano a sapere quali pagine sono le più e le meno popolari e vedere come i visitatori si muovono all'interno del sito.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Servizi utilizzati:</h4>
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    <li><strong>Google Analytics</strong> - Analisi del traffico web</li>
                    <li>Dati aggregati e anonimi</li>
                    <li>Misurazione delle prestazioni</li>
                    <li>Comportamento degli utenti</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Cookie Marketing</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Opzionali</strong> - Richiedono il tuo consenso
                </p>
                <p className="text-sm">
                  Questi cookie possono essere impostati tramite il nostro sito dai nostri partner pubblicitari. 
                  Possono essere utilizzati da queste aziende per costruire un profilo dei tuoi interessi e mostrarti annunci pertinenti su altri siti.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Scopi:</h4>
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    <li>Pubblicità personalizzata</li>
                    <li>Misurazione campagne promozionali</li>
                    <li>Retargeting e remarketing</li>
                    <li>Social media integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">I tuoi diritti e controlli</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Secondo il GDPR, hai il diritto di:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consenso libero:</strong> Puoi accettare o rifiutare i cookie non necessari</li>
                <li><strong>Controllo granulare:</strong> Puoi scegliere specificamente quali categorie accettare</li>
                <li><strong>Revoca del consenso:</strong> Puoi cambiare idea e revocare il consenso in qualsiasi momento</li>
                <li><strong>Trasparenza:</strong> Hai diritto a informazioni chiare su come usiamo i cookie</li>
                <li><strong>Portabilità:</strong> Le tue preferenze vengono ricordate per 6 mesi</li>
              </ul>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Elenco cookie utilizzati</h2>
            <p className="mb-4">Di seguito l'elenco dettagliato dei cookie utilizzati su questo sito:</p>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Nome Cookie</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Durata</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Scopo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono">villamareblu_cookie_consent</td>
                    <td className="px-4 py-2 text-sm">Necessario</td>
                    <td className="px-4 py-2 text-sm">6 mesi</td>
                    <td className="px-4 py-2 text-sm">Memorizza le preferenze cookie dell'utente</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono">sb-*-auth-token</td>
                    <td className="px-4 py-2 text-sm">Necessario</td>
                    <td className="px-4 py-2 text-sm">Sessione</td>
                    <td className="px-4 py-2 text-sm">Autenticazione Supabase (area riservata)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono">_ga</td>
                    <td className="px-4 py-2 text-sm">Statistico</td>
                    <td className="px-4 py-2 text-sm">2 anni</td>
                    <td className="px-4 py-2 text-sm">Google Analytics - Distingue gli utenti</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono">_ga_*</td>
                    <td className="px-4 py-2 text-sm">Statistico</td>
                    <td className="px-4 py-2 text-sm">2 anni</td>
                    <td className="px-4 py-2 text-sm">Google Analytics 4 - Mantiene lo stato della sessione</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-mono">_gcl_au</td>
                    <td className="px-4 py-2 text-sm">Marketing</td>
                    <td className="px-4 py-2 text-sm">3 mesi</td>
                    <td className="px-4 py-2 text-sm">Google Ads - Tracciamento conversioni</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              I cookie statistici e di marketing vengono installati solo previo consenso esplicito dell'utente.
              Google Analytics è configurato con anonimizzazione IP attiva.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Gestione tramite browser</h2>
            <p className="mb-4">
              Puoi anche impostare il tuo browser per rifiutare tutti o alcuni cookie, o per avvisarti quando i siti web impostano o accedono ai cookie. 
              Se disabiliti o rifiuti i cookie, ricorda che alcune parti del nostro sito potrebbero diventare inaccessibili o non funzionare correttamente.
            </p>
            <p className="mb-4">
              Per ulteriori informazioni su come gestire i cookie nei principali browser web:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a 
                    href="https://support.google.com/accounts/answer/61416" 
                    className="text-primary underline hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" 
                    className="text-primary underline hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mozilla Firefox
                  </a>
                </li>
              </ul>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a 
                    href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                    className="text-primary underline hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Microsoft Edge
                  </a>
                </li>
                <li>
                  <a 
                    href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" 
                    className="text-primary underline hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Safari
                  </a>
                </li>
              </ul>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Durata del consenso</h2>
            <p>
              Il tuo consenso ai cookie viene conservato per <strong>6 mesi</strong> dalla data in cui hai espresso la tua scelta. 
              Trascorso questo periodo, ti verrà chiesto nuovamente di esprimere le tue preferenze.
            </p>
            <p className="mt-2">
              Puoi modificare le tue scelte in qualsiasi momento utilizzando il pulsante "Gestisci Cookie" presente in questa pagina.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Modifiche alla Cookie Policy</h2>
            <p>
              Potremmo aggiornare la nostra Cookie Policy di tanto in tanto per riflettere cambiamenti nelle nostre pratiche o per altri motivi operativi, legali o normativi. 
              Ti invitiamo a consultare regolarmente questa pagina per essere informato su eventuali modifiche.
            </p>
          </section>
          
          <section className="mb-8 bg-primary/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Contatti</h2>
            <p className="mb-4">
              Se hai domande sulla nostra Cookie Policy o desideri esercitare i tuoi diritti relativi alla protezione dei dati, 
              non esitare a contattarci:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <a href="mailto:macchiaforcato@gmail.com" className="text-primary underline">macchiaforcato@gmail.com</a></p>
              <p><strong>Telefono:</strong> <a href="tel:+393780038730" className="text-primary underline">+39 378 0038730</a></p>
              <p><strong>Indirizzo:</strong> Via Marco Polo 112, 73053 Patù (LE), Italia</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;
