import { GuideInfo } from '@/types/guide';

export const guideComeArrivare: GuideInfo = {
  slug: 'come-arrivare-torre-vado',
  title: 'Come Arrivare a Torre Vado: Guida Completa',
  subtitle: 'Indicazioni da aeroporto, treno, auto e bus per raggiungere il Salento sud',
  description: 'Come arrivare a Torre Vado nel Salento: indicazioni da aeroporto di Brindisi e Bari, in auto, treno e bus. Distanze, tempi di percorrenza, noleggio auto e consigli pratici.',
  heroImage: '/images/guides/come-arrivare-salento.jpg',
  heroImageAlt: 'Strada panoramica verso Torre Vado nel Salento con ulivi',
  category: 'pratico',
  readingTime: 8,
  lastUpdated: '2026-01-18',
  keywords: [
    'come arrivare torre vado',
    'aeroporto brindisi torre vado',
    'come raggiungere salento',
    'distanza brindisi torre vado',
    'noleggio auto salento',
    'aeroporto bari salento',
    'indicazioni torre vado',
    'treno lecce torre vado',
    'bus torre vado',
    'strade salento'
  ],
  relatedGuides: ['cosa-fare-torre-vado', 'spiagge-torre-vado', 'itinerario-7-giorni-salento'],
  ctaText: 'Prenota il tuo soggiorno - Parcheggio privato incluso',
  sections: [
    {
      id: 'aeroporto-brindisi',
      title: 'Da Aeroporto di Brindisi (BDS)',
      content: `
        <p>L'<strong>Aeroporto del Salento di Brindisi</strong> è lo scalo più comodo per raggiungere Torre Vado e Villa MareBlu.</p>
        <p><strong>Distanza:</strong> circa 120 km<br>
        <strong>Tempo:</strong> 1 ora e 20 minuti in auto</p>
        <p><strong>Percorso consigliato:</strong></p>
        <ol>
          <li>Dall'aeroporto, prendi la SS613 direzione Lecce</li>
          <li>Superstrada Brindisi-Lecce (gratuita)</li>
          <li>A Lecce, prendi la SS101 direzione Gallipoli</li>
          <li>Da Gallipoli, SS274 direzione Santa Maria di Leuca</li>
          <li>Uscita Torre Vado/Patù</li>
        </ol>
        <p><strong>Noleggio auto:</strong> tutte le principali compagnie sono presenti in aeroporto (Hertz, Avis, Europcar, Sicily by Car). Consigliamo di prenotare in anticipo, soprattutto in estate.</p>
        <p><strong>Costo noleggio:</strong> da €25-40/giorno per utilitaria in bassa stagione, €50-80/giorno in agosto.</p>
      `,
      highlights: [
        'Distanza: 120 km (1h20 in auto)',
        'Aeroporto più comodo per il Salento sud',
        'Noleggio auto consigliato',
        'Prenotare auto in anticipo per agosto'
      ]
    },
    {
      id: 'aeroporto-bari',
      title: 'Da Aeroporto di Bari (BRI)',
      content: `
        <p>L'<strong>Aeroporto di Bari Karol Wojtyła</strong> è più grande e con più collegamenti internazionali, ma più distante.</p>
        <p><strong>Distanza:</strong> circa 200 km<br>
        <strong>Tempo:</strong> 2 ore e 15 minuti in auto</p>
        <p><strong>Percorso:</strong></p>
        <ol>
          <li>Dall'aeroporto, prendi SS16 o A14 direzione Bari Sud</li>
          <li>Tangenziale di Bari direzione Taranto/Lecce</li>
          <li>SS16 Adriatica o E55 fino a Lecce</li>
          <li>Da Lecce, SS101 → SS274 verso Leuca</li>
          <li>Uscita Torre Vado/Patù</li>
        </ol>
        <p><strong>Consiglio:</strong> se i voli per Brindisi sono più cari di €50+ rispetto a Bari, considera Bari. Altrimenti Brindisi è molto più comodo.</p>
      `,
      highlights: [
        'Distanza: 200 km (2h15 in auto)',
        'Più voli internazionali disponibili',
        'Valuta differenza prezzo con Brindisi',
        'A14 fino a Bari poi statali'
      ]
    },
    {
      id: 'auto-nord',
      title: 'In Auto dal Nord Italia',
      content: `
        <p>Arrivare nel Salento <strong>in auto</strong> è un viaggio lungo ma panoramico. Ecco le indicazioni:</p>
        <p><strong>Da Milano:</strong> circa 950 km (9-10 ore)<br>
        A1 → A14 → uscita Bari Nord → SS16/E55 → Lecce → SS274 → Torre Vado</p>
        <p><strong>Da Roma:</strong> circa 600 km (6-7 ore)<br>
        A1 → A16 Napoli-Canosa → A14 → Bari → SS16 → Lecce → Torre Vado</p>
        <p><strong>Da Napoli:</strong> circa 400 km (4-5 ore)<br>
        A16 → A14 → Bari → SS16 → Lecce → Torre Vado</p>
        <p><strong>Pedaggi autostradali:</strong> circa €40-60 da Roma, €80-100 da Milano.</p>
        <p><strong>Consiglio:</strong> se partite dal Nord, valutate di fermarvi una notte a metà strada (Marche o Abruzzo) per non arrivare stanchi.</p>
      `,
      highlights: [
        'Milano-Torre Vado: 950 km (9-10h)',
        'Roma-Torre Vado: 600 km (6-7h)',
        'Pedaggi: €40-100 a seconda della partenza',
        'Considera sosta intermedia'
      ]
    },
    {
      id: 'treno',
      title: 'In Treno + Bus/Auto',
      content: `
        <p>Non esiste una stazione ferroviaria a Torre Vado. La stazione più vicina è <strong>Lecce</strong>.</p>
        <p><strong>Lecce è raggiungibile con:</strong></p>
        <ul>
          <li><strong>Frecciargento</strong> da Roma (5-6 ore) e Milano (7-8 ore)</li>
          <li><strong>Intercity</strong> da Bologna, Rimini, Ancona, Pescara, Bari</li>
        </ul>
        <p><strong>Da Lecce a Torre Vado:</strong></p>
        <ul>
          <li><strong>Noleggio auto:</strong> diverse agenzie alla stazione (consigliato)</li>
          <li><strong>Bus:</strong> autobus STP Lecce linea per Leuca, fermata Patù (1h30, circa €5). Frequenza limitata, verificare orari.</li>
          <li><strong>Taxi/Transfer:</strong> €80-100 per transfer privato</li>
        </ul>
        <p><strong>Distanza Lecce-Torre Vado:</strong> 65 km, circa 50 minuti in auto.</p>
      `,
      highlights: [
        'Stazione più vicina: Lecce (65 km)',
        'Frecciargento da Roma: 5-6 ore',
        'Noleggio auto a Lecce consigliato',
        'Bus disponibile ma limitato'
      ]
    },
    {
      id: 'bus',
      title: 'In Bus a Lunga Percorrenza',
      content: `
        <p>Diverse compagnie offrono collegamenti in <strong>bus</strong> verso il Salento:</p>
        <p><strong>FlixBus:</strong> collegamenti da tutta Italia verso Lecce. Da Lecce poi bus locale o noleggio auto.</p>
        <p><strong>Marozzi/Marino:</strong> bus diretti da Roma, Milano, Bologna verso Lecce e alcune fermate nel Salento.</p>
        <p><strong>STP Lecce:</strong> autobus locali collegano Lecce con Torre Vado (via Gallipoli o via Ugento). Frequenza: 4-6 corse al giorno, meno la domenica.</p>
        <p><strong>Pro:</strong> economico (€20-50 da Roma).<br>
        <strong>Contro:</strong> tempi lunghi, poca flessibilità, difficile senza auto nel Salento.</p>
        <p><strong>Consiglio:</strong> il bus va bene per arrivare, ma nel Salento l'auto è quasi indispensabile per muoversi liberamente.</p>
      `,
      highlights: [
        'FlixBus/Marozzi verso Lecce',
        'Bus locali Lecce-Torre Vado',
        'Economico ma lento',
        'Auto consigliata per muoversi'
      ]
    },
    {
      id: 'transfer',
      title: 'Servizi Transfer Privati',
      content: `
        <p>Se non volete noleggiare auto, esistono <strong>servizi di transfer privato</strong> dall'aeroporto:</p>
        <p><strong>Costi indicativi:</strong></p>
        <ul>
          <li>Aeroporto Brindisi → Torre Vado: €90-120</li>
          <li>Aeroporto Bari → Torre Vado: €150-180</li>
          <li>Stazione Lecce → Torre Vado: €70-90</li>
        </ul>
        <p><strong>Servizi:</strong> auto private con autista, minivan per gruppi, orari flessibili.</p>
        <p><strong>Prenotazione:</strong> chiedete a noi di Villa MareBlu per contatti di autisti affidabili della zona!</p>
        <p><strong>Nota:</strong> senza auto, spostarsi nel Salento è complicato. Valutate noleggio almeno per alcuni giorni.</p>
      `,
      highlights: [
        'Transfer Brindisi: €90-120',
        'Transfer Bari: €150-180',
        'Contattateci per autisti locali',
        'Auto consigliata per esplorare'
      ]
    },
    {
      id: 'navigatore',
      title: 'Indicazioni GPS per Villa MareBlu',
      content: `
        <p><strong>Indirizzo completo per navigatore:</strong></p>
        <p style="font-size: 1.2em; font-weight: bold; background: #f0f0f0; padding: 15px; border-radius: 8px;">
        Via Marco Polo 112<br>
        73053 Patù (LE)<br>
        Puglia, Italia
        </p>
        <p><strong>Coordinate GPS:</strong><br>
        Latitudine: 39.823534<br>
        Longitudine: 18.292820</p>
        <p><strong>Google Maps:</strong> cerca "Villa MareBlu Torre Vado" o usa le coordinate sopra.</p>
        <p><strong>Ultime indicazioni:</strong> una volta a Torre Vado, segui indicazioni per "Patù". Via Marco Polo è sulla destra poco prima di entrare in paese. Vedrai il nostro cartello!</p>
      `,
      highlights: [
        'Via Marco Polo 112, Patù (LE)',
        'Coordinate: 39.823534, 18.292820',
        'Cerca "Villa MareBlu" su Maps',
        'Parcheggio privato in struttura'
      ]
    },
    {
      id: 'consigli',
      title: 'Consigli Pratici per il Viaggio',
      content: `
        <p><strong>Benzina:</strong> fate il pieno prima di arrivare a Torre Vado. I distributori nel Salento sud sono meno frequenti. Prezzo: circa €1.80-2.00/litro.</p>
        <p><strong>Strade:</strong> le strade salentine sono in buone condizioni ma spesso strette e tortuose. Guidate con calma e godetevi il paesaggio!</p>
        <p><strong>Limiti di velocità:</strong> 130 km/h autostrada, 90-110 superstrada, 50 km/h centri abitati. Autovelox frequenti.</p>
        <p><strong>ZTL:</strong> alcuni centri storici (Gallipoli, Otranto, Lecce) hanno Zone a Traffico Limitato. Verificate prima di entrare.</p>
        <p><strong>Parcheggio a Villa MareBlu:</strong> avete parcheggio privato gratuito incluso nel soggiorno. Non dovrete mai cercare parcheggio!</p>
        <p><strong>Checklist arrivo:</strong> comunicate l'orario di arrivo almeno il giorno prima. Check-in dalle 15:00, ma siamo flessibili se possibile.</p>
      `,
      highlights: [
        'Fate benzina prima di Torre Vado',
        'Strade panoramiche, guidate con calma',
        'Attenzione ZTL nei centri storici',
        'Parcheggio privato incluso'
      ]
    }
  ]
};
