import { GuideInfo } from '@/types/guide';

export const guideRistoranti: GuideInfo = {
  slug: 'ristoranti-salento',
  title: 'Dove Mangiare nel Salento Sud: Ristoranti e Trattorie',
  subtitle: 'I migliori ristoranti, trattorie e locali tipici tra Torre Vado, Pescoluse e Leuca',
  description: 'Guida ai migliori ristoranti nel Salento sud vicino Torre Vado: dove mangiare pesce fresco, cucina tipica salentina, pizzerie, gelaterie. Prezzi, specialità e consigli da local.',
  heroImage: '/images/guides/cucina-salentina.jpg',
  heroImageAlt: 'Orecchiette alle cime di rapa - piatto tipico della cucina salentina',
  category: 'gastronomia',
  readingTime: 10,
  lastUpdated: '2026-01-18',
  keywords: [
    'ristoranti torre vado',
    'dove mangiare salento',
    'ristoranti pescoluse',
    'trattorie salento',
    'pesce fresco torre vado',
    'cucina salentina',
    'ristoranti leuca',
    'mangiare bene salento sud',
    'pizzerie torre vado',
    'gelaterie salento'
  ],
  relatedGuides: ['cosa-fare-torre-vado', 'spiagge-torre-vado', 'itinerario-7-giorni-salento'],
  ctaText: 'Soggiorna vicino ai migliori ristoranti del Salento',
  sections: [
    {
      id: 'cucina-tipica',
      title: 'La Cucina Tipica Salentina: Cosa Ordinare',
      content: `
        <p>Prima di scegliere dove mangiare, ecco i <strong>piatti tipici salentini</strong> da provare assolutamente:</p>
        <p><strong>Primi piatti:</strong></p>
        <ul>
          <li><strong>Orecchiette alle cime di rapa</strong> - Il piatto simbolo della Puglia</li>
          <li><strong>Sagne 'ncannulate</strong> - Pasta fresca arrotolata con sugo</li>
          <li><strong>Ciceri e tria</strong> - Ceci con pasta fritta croccante</li>
          <li><strong>Frisella</strong> - Tarallo bagnato con pomodori, olio e origano</li>
        </ul>
        <p><strong>Secondi di pesce:</strong></p>
        <ul>
          <li><strong>Frittura di paranza</strong> - Pescato locale fritto</li>
          <li><strong>Polpo alla pignata</strong> - Cotto lentamente in terracotta</li>
          <li><strong>Scapece</strong> - Pesce marinato in aceto e zafferano</li>
        </ul>
        <p><strong>Dolci:</strong></p>
        <ul>
          <li><strong>Pasticciotto leccese</strong> - Pasta frolla con crema pasticcera</li>
          <li><strong>Sporcamuss</strong> - Sfoglia con crema</li>
          <li><strong>Gelato artigianale</strong> - Gusti locali: mandorla, fico, gelso</li>
        </ul>
      `,
      highlights: [
        'Orecchiette: piatto simbolo',
        'Pesce fresco del giorno',
        'Pasticciotto: colazione tipica',
        'Vini: Primitivo, Negroamaro'
      ]
    },
    {
      id: 'torre-vado',
      title: 'Ristoranti a Torre Vado (5 min)',
      content: `
        <p>A <strong>Torre Vado</strong>, il borgo marinaro più vicino a Villa MareBlu, trovi ottimi ristoranti di pesce:</p>
        <p><strong>Ristorante Il Porto</strong> - Direttamente sul porto, pesce freschissimo. Specialità: frittura mista e spaghetti ai ricci. Prezzo medio: €35-45 a persona. Prenotazione consigliata.</p>
        <p><strong>Trattoria da Nino</strong> - Cucina casalinga salentina, porzioni generose. Ottimo rapporto qualità/prezzo. €20-30 a persona.</p>
        <p><strong>Pizzeria Sul Mare</strong> - Pizza napoletana con vista mare. Ottima per cena informale. €15-20 a persona.</p>
        <p><strong>Bar Gelateria Centrale</strong> - Gelato artigianale eccellente, granite siciliane. Perfetto per una pausa pomeridiana.</p>
      `,
      highlights: [
        'Il Porto: pesce fresco sul porto',
        'Da Nino: cucina casalinga',
        'Pizzeria Sul Mare: pizza vista mare',
        'Prezzi: €20-45 a persona'
      ]
    },
    {
      id: 'pescoluse',
      title: 'Ristoranti a Pescoluse/Marina (10 min)',
      content: `
        <p>Nella zona di <strong>Pescoluse e Marina di Pescoluse</strong>:</p>
        <p><strong>Ristorante Le Maldive</strong> - Elegante ristorante con vista sulle "Maldive del Salento". Cucina raffinata di pesce, ottima carta vini. €50-70 a persona. Ideale per occasioni speciali.</p>
        <p><strong>Lido Venere</strong> - Ristorante sulla spiaggia, piedi nella sabbia. Pranzo rilassato dopo il bagno. €30-40 a persona.</p>
        <p><strong>Puccia Point</strong> - Pucce (panini salentini) farcite con ingredienti locali. Perfetto per pranzo veloce. €8-12.</p>
        <p><strong>Consiglio:</strong> molti stabilimenti balneari offrono servizio ristorante in spiaggia - comodo per non spostarsi!</p>
      `,
      highlights: [
        'Le Maldive: ristorante elegante',
        'Lido Venere: pranzo in spiaggia',
        'Puccia Point: street food locale',
        'Stabilimenti con ristorante'
      ]
    },
    {
      id: 'leuca',
      title: 'Ristoranti a Santa Maria di Leuca (15 min)',
      content: `
        <p>A <strong>Santa Maria di Leuca</strong> trovi ristoranti con vista spettacolare:</p>
        <p><strong>Ristorante L'Approdo</strong> - Sul porto turistico, pesce eccellente. Prova il crudo di mare! €40-55 a persona.</p>
        <p><strong>Trattoria Il Capriccio</strong> - Cucina tradizionale, prezzi onesti. Ottimi i piatti di terra. €25-35.</p>
        <p><strong>Bar del Faro</strong> - Aperitivo al tramonto con vista sul faro. Esperienza imperdibile!</p>
        <p><strong>Consiglio serata:</strong> cena a Leuca e poi passeggiata sul lungomare illuminato fino al faro.</p>
      `,
      highlights: [
        'L\'Approdo: crudo di mare eccellente',
        'Il Capriccio: tradizione a prezzi ok',
        'Aperitivo al tramonto al faro',
        'Passeggiata serale sul lungomare'
      ]
    },
    {
      id: 'gallipoli',
      title: 'Ristoranti a Gallipoli (40 min)',
      content: `
        <p><strong>Gallipoli</strong> è la capitale gastronomica del Salento ionico. Vale la pena la gita!</p>
        <p><strong>Trattoria La Puritate</strong> - Nel centro storico, istituzione locale. Pesce fresco, atmosfera autentica. €35-50.</p>
        <p><strong>Bastione</strong> - Terrazza con vista mare spettacolare. Cucina creativa salentina. €45-60. Prenotazione obbligatoria.</p>
        <p><strong>Angolo Blu</strong> - Piccolo locale nascosto, solo pochi tavoli. Pescato del giorno cucinato alla perfezione. €40-50.</p>
        <p><strong>Gelateria Fiore</strong> - La gelateria più famosa del Salento. File lunghe ma ne vale la pena!</p>
      `,
      highlights: [
        'La Puritate: istituzione storica',
        'Bastione: terrazza vista mare',
        'Gelateria Fiore: la più famosa',
        'Centro storico pieno di locali'
      ]
    },
    {
      id: 'masserie',
      title: 'Cena in Masseria: Esperienza Autentica',
      content: `
        <p>Per un'esperienza <strong>autentica salentina</strong>, cenate in una <strong>masseria</strong> - le antiche fattorie fortificate del Salento:</p>
        <p><strong>Masseria Le Stanzie</strong> (Supersano, 30 min) - Cucina contadina genuina in un ambiente storico. Menu fisso con antipasti infiniti, primi, secondi e dolci. €35-45 tutto compreso, vino incluso.</p>
        <p><strong>Masseria Ferragnano</strong> (Patù, 10 min) - Vicina a noi, ottima per cena romantica. Prodotti dell'orto proprio. €40-50.</p>
        <p><strong>Consiglio:</strong> le masserie spesso richiedono prenotazione con anticipo, soprattutto in agosto. Chiedete a noi di Villa MareBlu per consigli aggiornati!</p>
      `,
      highlights: [
        'Cucina contadina autentica',
        'Prodotti a km zero',
        'Atmosfera storica unica',
        'Prenotazione anticipata consigliata'
      ]
    },
    {
      id: 'colazione',
      title: 'Colazione Salentina: Bar e Pasticcerie',
      content: `
        <p>La <strong>colazione salentina</strong> è un rito! Ecco dove farla:</p>
        <p><strong>Il Pasticciotto:</strong> la colazione tipica è <em>caffè + pasticciotto</em> (pasta frolla ripiena di crema). Costa circa €2-3 ed è una delizia.</p>
        <p><strong>Bar Martinucci</strong> (catena locale) - Pasticceria storica salentina, diversi punti vendita. Pasticciotti perfetti.</p>
        <p><strong>Bar di Torre Vado</strong> - I bar sul lungomare offrono colazione con vista mare. Cornetto, caffè e pasticciotto!</p>
        <p><strong>Consiglio:</strong> provate anche il <em>caffè in ghiaccio con latte di mandorla</em> - tipico estivo salentino, rinfrescante e delizioso!</p>
      `,
      highlights: [
        'Pasticciotto: colazione tipica',
        'Caffè in ghiaccio con mandorla',
        'Martinucci: pasticceria storica',
        '€2-3 per pasticciotto + caffè'
      ]
    },
    {
      id: 'consigli',
      title: 'Consigli Pratici per Mangiare nel Salento',
      content: `
        <p><strong>Prenotazione:</strong> in agosto è quasi sempre necessaria, soprattutto per i ristoranti più rinomati. Prenotate almeno il giorno prima.</p>
        <p><strong>Orari:</strong> pranzo 12:30-15:00, cena 20:00-23:00. Molti ristoranti chiudono il lunedì.</p>
        <p><strong>Mance:</strong> non obbligatorie in Italia, ma apprezzate (5-10% per servizio eccellente).</p>
        <p><strong>Coperto:</strong> quasi tutti i ristoranti applicano un coperto di €2-3 a persona (pane e servizio).</p>
        <p><strong>Vini locali:</strong> ordinate vino della casa - è quasi sempre ottimo e costa €8-15 a bottiglia. Primitivo per i rossi, Malvasia per i bianchi.</p>
        <p><strong>Dalla cucina di Villa MareBlu:</strong> i nostri appartamenti hanno cucine attrezzate. Comprate pesce fresco al porto di Torre Vado e cucinatelo sulla terrazza!</p>
      `,
      highlights: [
        'Agosto: prenotare sempre',
        'Vino della casa: ottimo e economico',
        'Cucina in appartamento disponibile',
        'Pesce fresco al porto di Torre Vado'
      ]
    }
  ]
};
