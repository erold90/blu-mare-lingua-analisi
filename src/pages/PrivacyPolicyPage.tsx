
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
            <h2 className="text-2xl font-semibold mb-4">Introduzione</h2>
            <p>
              Villa Mare Blu rispetta la privacy dei propri utenti e si impegna a proteggere i loro dati personali. Questa Privacy Policy descrive le nostre pratiche in merito alla raccolta, all'uso e alla divulgazione delle informazioni che otteniamo dagli utenti del nostro sito web.
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
            <h2 className="text-2xl font-semibold mb-4">Sicurezza dei dati</h2>
            <p>
              Adottiamo misure di sicurezza appropriate per proteggere i tuoi dati personali contro l'accesso non autorizzato, la modifica, la divulgazione o la distruzione. Tuttavia, nessun metodo di trasmissione su Internet o di archiviazione elettronica è sicuro al 100%.
            </p>
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
