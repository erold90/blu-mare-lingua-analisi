/**
 * Script post-build per generare pagine HTML statiche con meta tag SEO corretti
 * Questo risolve il problema delle SPA dove i meta tag sono uguali per tutte le route
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Configurazione meta tag per ogni pagina
const pages = [
  {
    path: 'guide',
    title: 'Guide Turistiche Salento | Spiagge, Ristoranti, Cosa Fare | Villa MareBlu Torre Vado',
    description: 'Guide complete per la tua vacanza nel Salento: le migliori spiagge vicino Torre Vado, dove mangiare, cosa fare, come arrivare. Consigli da local per vivere il vero Salento.',
    canonical: 'https://www.villamareblu.it/guide',
    ogImage: 'https://www.villamareblu.it/images/guides/spiagge-salento.jpg'
  },
  {
    path: 'guide/spiagge-torre-vado',
    title: 'Le 10 Spiagge più Belle vicino Torre Vado | Guida Salento | Villa MareBlu',
    description: 'Scopri le 10 spiagge più belle vicino Torre Vado nel Salento: Pescoluse (Maldive del Salento), Torre Pali, Santa Maria di Leuca. Distanze da Villa MareBlu, come arrivare, servizi.',
    canonical: 'https://www.villamareblu.it/guide/spiagge-torre-vado',
    ogImage: 'https://www.villamareblu.it/images/guides/spiagge-salento.jpg'
  },
  {
    path: 'guide/cosa-fare-torre-vado',
    title: 'Cosa Fare a Torre Vado e nel Salento | Attività ed Escursioni | Villa MareBlu',
    description: 'Guida completa su cosa fare a Torre Vado e nel Salento: escursioni in barca, borghi da visitare, attività per famiglie, sport acquatici e vita notturna.',
    canonical: 'https://www.villamareblu.it/guide/cosa-fare-torre-vado',
    ogImage: 'https://www.villamareblu.it/images/guides/cosa-fare-salento.jpg'
  },
  {
    path: 'guide/ristoranti-salento',
    title: 'Dove Mangiare nel Salento | Ristoranti e Cucina Tipica | Villa MareBlu',
    description: 'I migliori ristoranti del Salento: dove mangiare pesce fresco, pizzerie, trattorie tipiche. Piatti salentini da provare e consigli per mangiare bene.',
    canonical: 'https://www.villamareblu.it/guide/ristoranti-salento',
    ogImage: 'https://www.villamareblu.it/images/guides/cucina-salentina.jpg'
  },
  {
    path: 'guide/come-arrivare-torre-vado',
    title: 'Come Arrivare a Torre Vado | Aeroporti, Treni, Auto | Villa MareBlu',
    description: 'Come raggiungere Torre Vado nel Salento: aeroporti più vicini (Brindisi, Bari), collegamenti in treno, indicazioni stradali e consigli per il viaggio.',
    canonical: 'https://www.villamareblu.it/guide/come-arrivare-torre-vado',
    ogImage: 'https://www.villamareblu.it/images/guides/come-arrivare-salento.jpg'
  },
  {
    path: 'guide/itinerario-7-giorni-salento',
    title: 'Itinerario 7 Giorni nel Salento | Cosa Vedere Giorno per Giorno | Villa MareBlu',
    description: 'Itinerario completo per una settimana nel Salento: cosa vedere ogni giorno, spiagge, borghi, gastronomia. Programma dettagliato per vivere il meglio del Salento.',
    canonical: 'https://www.villamareblu.it/guide/itinerario-7-giorni-salento',
    ogImage: 'https://www.villamareblu.it/images/guides/itinerario-salento.jpg'
  },
  {
    path: 'preventivo',
    title: 'Richiedi Preventivo Gratuito | Vacanze Torre Vado Senza Commissioni | Villa MareBlu',
    description: 'Calcola il preventivo per la tua vacanza a Torre Vado. Prenota direttamente senza commissioni e risparmia fino al 15%. Risposta entro 24 ore.',
    canonical: 'https://www.villamareblu.it/preventivo',
    ogImage: 'https://www.villamareblu.it/images/hero/hero.jpg'
  },
  {
    path: 'appartamenti',
    title: 'Appartamenti Vacanze Torre Vado | 4-8 Persone Vista Mare | Villa MareBlu Salento',
    description: '4 appartamenti vacanze a Torre Vado con vista mare, da 4 a 8 posti letto. Parcheggio privato, aria condizionata, terrazza. A 100 metri dal mare nel Salento.',
    canonical: 'https://www.villamareblu.it/appartamenti',
    ogImage: 'https://www.villamareblu.it/images/hero/hero.jpg'
  },
  {
    path: 'contatti',
    title: 'Contatti Villa MareBlu | Prenota Diretto Torre Vado | Tel +39 378 0038730',
    description: 'Contatta Villa MareBlu per prenotare la tua vacanza a Torre Vado. Telefono, email, indirizzo e indicazioni. Risposta rapida garantita.',
    canonical: 'https://www.villamareblu.it/contatti',
    ogImage: 'https://www.villamareblu.it/images/hero/hero.jpg'
  },
  {
    path: 'chi-siamo',
    title: 'Chi Siamo - Villa MareBlu | Casa Vacanze Torre Vado | Tra Pescoluse e Leuca',
    description: 'Scopri Villa MareBlu: la nostra storia, la posizione privilegiata a 100 metri dal mare, e perché scegliere noi per le tue vacanze nel Salento.',
    canonical: 'https://www.villamareblu.it/chi-siamo',
    ogImage: 'https://www.villamareblu.it/images/hero/hero.jpg'
  }
];

function replaceMetaTags(html, page) {
  let result = html;

  // Sostituisci title
  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${page.title}</title>`
  );

  // Sostituisci meta description
  result = result.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${page.description}"`
  );

  // Sostituisci canonical
  result = result.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${page.canonical}"`
  );

  // Aggiungi canonical se non esiste
  if (!result.includes('rel="canonical"')) {
    result = result.replace(
      '</head>',
      `  <link rel="canonical" href="${page.canonical}" />\n  </head>`
    );
  }

  // Sostituisci OG title
  result = result.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${page.title}"`
  );

  // Sostituisci OG description
  result = result.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${page.description}"`
  );

  // Sostituisci OG URL
  result = result.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${page.canonical}"`
  );

  // Sostituisci OG image
  if (page.ogImage) {
    result = result.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${page.ogImage}"`
    );
  }

  // Sostituisci Twitter title
  result = result.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${page.title}"`
  );

  // Sostituisci Twitter description
  result = result.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${page.description}"`
  );

  // Sostituisci Twitter image
  if (page.ogImage) {
    result = result.replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${page.ogImage}"`
    );
  }

  return result;
}

async function generatePages() {
  console.log('🚀 Generazione pagine SEO statiche...\n');

  // Leggi index.html originale
  const indexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html non trovato. Esegui prima npm run build.');
    process.exit(1);
  }

  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  for (const page of pages) {
    const pageDir = path.join(distDir, page.path);
    const pagePath = path.join(pageDir, 'index.html');

    // Crea directory se non esiste
    fs.mkdirSync(pageDir, { recursive: true });

    // Genera HTML con meta tag corretti
    const pageHtml = replaceMetaTags(indexHtml, page);

    // Scrivi file
    fs.writeFileSync(pagePath, pageHtml);

    console.log(`✅ Generato: /${page.path}/index.html`);
  }

  console.log(`\n🎉 Generate ${pages.length} pagine SEO statiche!`);
}

generatePages().catch(console.error);
