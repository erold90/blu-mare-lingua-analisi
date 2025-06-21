
import * as React from "react";
import { Cookie } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { getLocalBusinessSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";

const CookiePolicyPage = () => {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Cookie Policy", url: "/cookie-policy" }
  ]);

  const localBusinessSchema = getLocalBusinessSchema();

  return (
    <>
      <SEOHead
        title="Cookie Policy - Villa MareBlu Salento"
        description="Informazioni sui cookie utilizzati dal sito di Villa MareBlu. Scopri come gestiamo i cookie e come puoi controllarli."
        keywords="cookie policy, gestione cookie, villa mareblu, salento, privacy"
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
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cosa sono i cookie?</h2>
            <p>
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo computer o dispositivo mobile quando visiti un sito web. Sono ampiamente utilizzati per far funzionare i siti web in modo più efficiente e per fornire informazioni ai proprietari del sito.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Come utilizziamo i cookie</h2>
            <p>
              Il nostro sito web utilizza cookie per diversi scopi. Alcuni cookie sono necessari per il funzionamento tecnico del sito, mentre altri ci permettono di ottimizzare la tua esperienza e di offrirti contenuti personalizzati.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Tipi di cookie che utilizziamo:</h3>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2">Cookie necessari</h4>
              <p>
                Questi cookie sono essenziali per il funzionamento del nostro sito web e non possono essere disattivati nei nostri sistemi. Generalmente vengono impostati solo in risposta ad azioni da te effettuate che costituiscono una richiesta di servizi, come l'impostazione delle tue preferenze di privacy, l'accesso o la compilazione di moduli.
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2">Cookie di prestazione</h4>
              <p>
                Questi cookie ci permettono di contare le visite e le fonti di traffico, in modo da poter misurare e migliorare le prestazioni del nostro sito. Ci aiutano a sapere quali pagine sono le più e le meno popolari e vedere come i visitatori si muovono all'interno del sito.
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2">Cookie funzionali</h4>
              <p>
                Questi cookie consentono al sito di fornire funzionalità e personalizzazioni avanzate. Possono essere impostati da noi o da fornitori terzi i cui servizi abbiamo aggiunto alle nostre pagine.
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2">Cookie di targeting</h4>
              <p>
                Questi cookie possono essere impostati tramite il nostro sito dai nostri partner pubblicitari. Possono essere utilizzati da queste aziende per costruire un profilo dei tuoi interessi e mostrarti annunci pertinenti su altri siti.
              </p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Gestione dei cookie</h2>
            <p>
              Puoi impostare il tuo browser per rifiutare tutti o alcuni cookie, o per avvisarti quando i siti web impostano o accedono ai cookie. Se disabiliti o rifiuti i cookie, ricorda che alcune parti del nostro sito potrebbero diventare inaccessibili o non funzionare correttamente.
            </p>
            <p className="mt-4">
              Per ulteriori informazioni su come gestire i cookie nei principali browser web, visita i seguenti link:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>
                <a 
                  href="https://support.google.com/accounts/answer/61416" 
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a 
                  href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" 
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a 
                  href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Microsoft Edge
                </a>
              </li>
              <li>
                <a 
                  href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" 
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Safari
                </a>
              </li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookie di terze parti</h2>
            <p>
              In alcuni casi specifici, utilizziamo anche cookie forniti da terze parti fidate. La seguente sezione spiega quali cookie di terze parti potresti incontrare attraverso questo sito.
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Questo sito utilizza Google Analytics, uno dei più diffusi e affidabili strumenti di analisi sul web, per aiutarci a capire come utilizzi il sito e come possiamo migliorare la tua esperienza.</li>
              <li>Possiamo anche utilizzare i social media buttons che ti consentono di connetterti o condividere certe pagine del nostro sito sui social media come Facebook, Instagram, LinkedIn, ecc.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Modifiche alla Cookie Policy</h2>
            <p>
              Potremmo aggiornare la nostra Cookie Policy di tanto in tanto. Ti invitiamo a consultare regolarmente questa pagina per essere informato su eventuali modifiche.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contatti</h2>
            <p>
              Se hai domande sulla nostra Cookie Policy, contattaci all'indirizzo email: <a href="mailto:macchiaforcato@gmail.com" className="text-primary underline">macchiaforcato@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;
