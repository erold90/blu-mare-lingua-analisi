
import * as React from "react";
import { Shield } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { getLocalBusinessSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";

const PrivacyPolicyPage = () => {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy-policy" }
  ]);

  const localBusinessSchema = getLocalBusinessSchema();

  return (
    <>
      <SEOHead
        title="Privacy Policy - Villa MareBlu Salento"
        description="Leggi la nostra Privacy Policy per conoscere come proteggiamo i tuoi dati personali e rispettiamo la tua privacy su Villa MareBlu."
        keywords="privacy policy, protezione dati, GDPR, villa mareblu, salento, privacy"
        canonicalUrl="/privacy-policy"
        structuredData={[breadcrumbSchema, localBusinessSchema]}
      />
      <div className="container px-4 py-8 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-6">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Titolare del Trattamento</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Titolare:</strong> Villa MareBlu - Locazione Turistica</p>
              <p className="mb-2"><strong>Indirizzo:</strong> Via Marco Polo 112, 73053 Patù (LE), Italia</p>
              <p className="mb-2"><strong>Email:</strong> <a href="mailto:macchiaforcato@gmail.com" className="text-primary underline">macchiaforcato@gmail.com</a></p>
              <p><strong>Telefono:</strong> <a href="tel:+393780038730" className="text-primary underline">+39 378 0038730</a></p>
            </div>
            <p className="text-sm text-muted-foreground">
              Villa MareBlu è un'attività di locazione turistica breve ai sensi dell'art. 4 del D.L. 50/2017, gestita da persona fisica.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduzione</h2>
            <p>
              Villa MareBlu rispetta la privacy dei propri utenti e si impegna a proteggere i loro dati personali. Questa Privacy Policy descrive le nostre pratiche in merito alla raccolta, all'uso e alla divulgazione delle informazioni che otteniamo dagli utenti del nostro sito web, in conformità al Regolamento UE 2016/679 (GDPR).
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Raccolta dei dati</h2>
            <p>
              Raccogliamo dati personali quando interagisci con il nostro sito web, in particolare quando:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Compili il modulo di contatto</li>
              <li>Richiedi un preventivo</li>
              <li>Effettui una prenotazione</li>
              <li>Ti registri al nostro sito</li>
              <li>Ti iscrivi alla nostra newsletter</li>
            </ul>
            <p>
              I dati personali che potremmo raccogliere includono: nome, cognome, indirizzo email, numero di telefono, dettagli del soggiorno e altre informazioni necessarie per fornire i nostri servizi.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Utilizzo dei dati</h2>
            <p>
              Utilizziamo i dati personali raccolti per:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Fornire e migliorare i nostri servizi</li>
              <li>Rispondere alle tue richieste di informazioni</li>
              <li>Elaborare le prenotazioni</li>
              <li>Inviare comunicazioni relative ai servizi richiesti</li>
              <li>Inviare, previo consenso, materiale promozionale e newsletter</li>
              <li>Analizzare l'utilizzo del nostro sito per migliorare l'esperienza utente</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Condivisione dei dati</h2>
            <p>
              Non condividiamo i tuoi dati personali con terze parti, tranne nei seguenti casi:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Con il tuo consenso</li>
              <li>Con fornitori di servizi che collaborano con noi per il funzionamento del sito</li>
              <li>Per conformarci a obblighi legali</li>
              <li>Per proteggere i nostri diritti, la proprietà o la sicurezza</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">I tuoi diritti</h2>
            <p>
              In conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR), hai i seguenti diritti:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Diritto di accesso ai tuoi dati personali</li>
              <li>Diritto di rettifica dei dati inesatti</li>
              <li>Diritto alla cancellazione dei tuoi dati</li>
              <li>Diritto di limitazione del trattamento</li>
              <li>Diritto alla portabilità dei dati</li>
              <li>Diritto di opposizione al trattamento</li>
              <li>Diritto di revocare il consenso in qualsiasi momento</li>
            </ul>
            <p>
              Per esercitare questi diritti, puoi contattarci all'indirizzo email: <a href="mailto:macchiaforcato@gmail.com" className="text-primary underline">macchiaforcato@gmail.com</a>
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Base giuridica del trattamento</h2>
            <p className="mb-4">
              I tuoi dati personali vengono trattati sulla base delle seguenti basi giuridiche:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li><strong>Esecuzione contrattuale:</strong> per gestire prenotazioni e soggiorni</li>
              <li><strong>Adempimento obblighi legali:</strong> per obblighi fiscali e di pubblica sicurezza</li>
              <li><strong>Consenso:</strong> per l'invio di comunicazioni promozionali e newsletter</li>
              <li><strong>Legittimo interesse:</strong> per migliorare i nostri servizi e l'esperienza utente</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Periodo di conservazione</h2>
            <p>
              I dati personali vengono conservati per il tempo necessario al raggiungimento delle finalità per cui sono stati raccolti:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li><strong>Dati di prenotazione:</strong> 10 anni per obblighi fiscali</li>
              <li><strong>Dati di contatto per marketing:</strong> fino alla revoca del consenso</li>
              <li><strong>Dati di navigazione:</strong> 26 mesi (Google Analytics)</li>
              <li><strong>Cookie di preferenze:</strong> 6 mesi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sicurezza dei dati</h2>
            <p>
              Adottiamo misure di sicurezza appropriate per proteggere i tuoi dati personali contro l'accesso non autorizzato, la modifica, la divulgazione o la distruzione. Tuttavia, nessun metodo di trasmissione su Internet o di archiviazione elettronica è sicuro al 100%.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Trasferimento dati extra-UE</h2>
            <p>
              Alcuni dei nostri fornitori di servizi (come Google Analytics) potrebbero trasferire dati al di fuori dell'Unione Europea.
              In tali casi, ci assicuriamo che il trasferimento avvenga nel rispetto delle garanzie previste dal GDPR,
              incluse le Clausole Contrattuali Standard approvate dalla Commissione Europea.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Diritto di reclamo</h2>
            <p>
              Se ritieni che il trattamento dei tuoi dati personali violi il GDPR, hai il diritto di proporre reclamo
              all'Autorità Garante per la Protezione dei Dati Personali:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p><strong>Garante per la Protezione dei Dati Personali</strong></p>
              <p>Piazza Venezia, 11 - 00187 Roma</p>
              <p>Email: <a href="mailto:protocollo@gpdp.it" className="text-primary underline">protocollo@gpdp.it</a></p>
              <p>PEC: <a href="mailto:protocollo@pec.gpdp.it" className="text-primary underline">protocollo@pec.gpdp.it</a></p>
              <p>Sito web: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.garanteprivacy.it</a></p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Modifiche alla Privacy Policy</h2>
            <p>
              Potremmo aggiornare occasionalmente questa Privacy Policy. Ti invitiamo a consultarla periodicamente per essere informato su eventuali modifiche.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contatti</h2>
            <p>
              Per qualsiasi domanda riguardante questa Privacy Policy, puoi contattarci all'indirizzo email: <a href="mailto:macchiaforcato@gmail.com" className="text-primary underline">macchiaforcato@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
