import { GuideInfo } from '@/types/guide';

export const guideSpiagge: GuideInfo = {
  slug: 'spiagge-torre-vado',
  title: 'Le 10 Spiagge più Belle vicino Torre Vado',
  subtitle: 'Guida completa alle spiagge del Salento sud: da Pescoluse a Santa Maria di Leuca',
  description: 'Scopri le 10 spiagge più belle vicino Torre Vado nel Salento: Pescoluse (Maldive del Salento), Marina di Pescoluse, Torre Pali, Santa Maria di Leuca. Distanze da Villa MareBlu, come arrivare, servizi e consigli.',
  heroImage: '/images/guides/spiagge-salento.jpg',
  heroImageAlt: 'Spiaggia di Pescoluse - Maldive del Salento con sabbia bianca e mare cristallino',
  category: 'spiagge',
  readingTime: 12,
  lastUpdated: '2026-01-18',
  keywords: [
    'spiagge torre vado',
    'spiagge salento',
    'pescoluse maldive del salento',
    'spiagge vicino torre vado',
    'mare torre vado',
    'spiagge santa maria di leuca',
    'spiagge sabbia salento',
    'mare cristallino puglia',
    'spiagge belle salento sud',
    'dove fare il bagno torre vado'
  ],
  relatedGuides: ['cosa-fare-torre-vado', 'ristoranti-salento', 'come-arrivare-torre-vado'],
  ctaText: 'Prenota il tuo soggiorno a 100 metri dal mare',
  sections: [
    {
      id: 'pescoluse',
      title: '1. Pescoluse - Le Maldive del Salento',
      content: `
        <p><strong>Pescoluse</strong> è la spiaggia più famosa del Salento, soprannominata <em>"Maldive del Salento"</em> per la sua sabbia bianchissima e il mare cristallino dai colori caraibici. Si trova a soli <strong>5 minuti in auto da Villa MareBlu</strong> (circa 4 km).</p>
        <p>La spiaggia si estende per circa 2 km lungo la costa ionica, con fondali bassi che la rendono perfetta per famiglie con bambini. L'acqua è talmente trasparente che sembra di nuotare in una piscina naturale.</p>
        <p><strong>Servizi disponibili:</strong> stabilimenti balneari attrezzati, spiaggia libera, bar, ristoranti, parcheggi (a pagamento in alta stagione). Consigliamo di arrivare presto in agosto per trovare posto nella spiaggia libera.</p>
      `,
      image: '/images/guides/pescoluse.jpg',
      imageAlt: 'Spiaggia di Pescoluse con mare turchese e sabbia bianca',
      highlights: [
        'Distanza da Villa MareBlu: 5 minuti in auto',
        'Sabbia bianca finissima, mare cristallino',
        'Ideale per famiglie con bambini (fondali bassi)',
        'Stabilimenti attrezzati e spiaggia libera'
      ]
    },
    {
      id: 'torre-vado-centro',
      title: '2. Spiaggia di Torre Vado Centro',
      content: `
        <p>La <strong>spiaggia di Torre Vado</strong> è la più vicina a Villa MareBlu: raggiungibile in <strong>5 minuti di auto</strong> o 15 minuti a piedi. È una spiaggia di sabbia fine con un pittoresco porto peschereccio che conferisce un'atmosfera autentica.</p>
        <p>Il lungomare offre bar, gelaterie e ristoranti dove gustare pesce fresco. La sera si anima con mercatini e eventi estivi. È il punto di partenza per escursioni in barca verso le grotte marine.</p>
        <p><strong>Particolarità:</strong> dalla spiaggia si gode una vista spettacolare sulla torre costiera del XVI secolo che dà il nome al paese.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 5 minuti in auto',
        'Atmosfera autentica di borgo marinaro',
        'Lungomare con bar e ristoranti',
        'Partenza escursioni in barca'
      ]
    },
    {
      id: 'scogliera-villa',
      title: '3. Scogliera privata Villa MareBlu',
      content: `
        <p>A soli <strong>100 metri da Villa MareBlu</strong> c'è un accesso privato su <strong>scogliera bassa</strong>, perfetto per chi ama tuffarsi direttamente in un mare limpidissimo. L'acqua è profonda e cristallina, ideale per <strong>snorkeling</strong> tra i pesci colorati.</p>
        <p>Questa è la soluzione perfetta per chi vuole evitare la folla delle spiagge di sabbia e godersi il mare in totale tranquillità. Portate maschera e boccaglio: i fondali sono ricchi di vita marina!</p>
        <p><strong>Consiglio:</strong> perfetta per il bagno mattutino prima di colazione o al tramonto quando i colori sono magici.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 2 minuti a piedi (100m)',
        'Accesso riservato agli ospiti',
        'Ideale per snorkeling e tuffi',
        'Zero folla, massima privacy'
      ]
    },
    {
      id: 'torre-pali',
      title: '4. Torre Pali',
      content: `
        <p><strong>Torre Pali</strong> è famosa per l'iconica torre saracena che emerge dal mare, raggiungibile a nuoto. La spiaggia di sabbia fine si trova a <strong>10 minuti da Villa MareBlu</strong> ed è una delle più fotografate del Salento.</p>
        <p>Il mare è calmo e poco profondo, ottimo per i bambini. Numerosi stabilimenti offrono lettini, ombrelloni e servizio bar in spiaggia. La sera il lungomare si anima con bancarelle e musica.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 10 minuti in auto',
        'Torre saracena raggiungibile a nuoto',
        'Spiaggia fotografatissima',
        'Mare calmo, ideale per bambini'
      ]
    },
    {
      id: 'marina-san-gregorio',
      title: '5. Marina di San Gregorio',
      content: `
        <p><strong>Marina di San Gregorio</strong> offre una spiaggia tranquilla con sabbia dorata e acque turchesi. Meno affollata di Pescoluse, è perfetta per chi cerca relax. Si trova a <strong>15 minuti da Villa MareBlu</strong>.</p>
        <p>Il borgo conserva un fascino antico con le casette dei pescatori e il piccolo porto. Ottimi ristoranti di pesce fresco direttamente sul mare.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 15 minuti in auto',
        'Meno affollata, più tranquilla',
        'Borgo autentico con ristoranti di pesce',
        'Sabbia dorata e mare turchese'
      ]
    },
    {
      id: 'punta-ristola',
      title: '6. Punta Ristola e Santa Maria di Leuca',
      content: `
        <p><strong>Punta Ristola</strong> è il punto più a sud della Puglia, dove il Mar Ionio incontra l'Adriatico. Le spiagge di <strong>Santa Maria di Leuca</strong> distano <strong>15 minuti da Villa MareBlu</strong> e offrono scenari mozzafiato.</p>
        <p>Qui trovi sia spiagge di sabbia che calette rocciose. Da non perdere le <strong>grotte marine</strong> visitabili in barca: Grotta del Diavolo, Grotta della Porcinara, Grotta dei Giganti.</p>
        <p><strong>Consiglio:</strong> il tramonto visto dal faro di Leuca è uno spettacolo imperdibile.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 15 minuti in auto',
        'Punto più a sud della Puglia',
        'Grotte marine visitabili in barca',
        'Tramonti spettacolari dal faro'
      ]
    },
    {
      id: 'posto-vecchio',
      title: '7. Posto Vecchio',
      content: `
        <p><strong>Posto Vecchio</strong> è una perla nascosta tra Torre Vado e Pescoluse. Piccole calette di sabbia alternate a scogli, con mare cristallino. Perfetta per chi cerca angoli meno turistici. A <strong>7 minuti da Villa MareBlu</strong>.</p>
        <p>L'accesso è facile e ci sono alcune aree di spiaggia libera. Porta con te tutto il necessario perché i servizi sono limitati.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 7 minuti in auto',
        'Calette nascoste e poco affollate',
        'Mix di sabbia e scogli',
        'Atmosfera selvaggia e autentica'
      ]
    },
    {
      id: 'lido-marini',
      title: '8. Lido Marini',
      content: `
        <p><strong>Lido Marini</strong> offre una lunga spiaggia di sabbia fine con tutti i servizi. A <strong>12 minuti da Villa MareBlu</strong>, è una valida alternativa a Pescoluse con meno affollamento.</p>
        <p>Ottimi stabilimenti balneari, ristoranti e gelaterie. Mare con fondali digradanti, perfetto per nuotare.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 12 minuti in auto',
        'Lunga spiaggia attrezzata',
        'Meno affollata di Pescoluse',
        'Tutti i servizi disponibili'
      ]
    },
    {
      id: 'felloniche',
      title: '9. Marina di Felloniche',
      content: `
        <p><strong>Marina di Felloniche</strong> è un piccolo paradiso tra Torre Vado e Torre Pali. Spiaggia di sabbia bianca con dune naturali e macchia mediterranea alle spalle. A <strong>8 minuti da Villa MareBlu</strong>.</p>
        <p>Ambiente naturale preservato, ideale per chi ama la natura incontaminata.</p>
      `,
      highlights: [
        'Distanza da Villa MareBlu: 8 minuti in auto',
        'Dune naturali e macchia mediterranea',
        'Ambiente preservato',
        'Sabbia bianca finissima'
      ]
    },
    {
      id: 'consigli',
      title: '10. Consigli Pratici per le Spiagge',
      content: `
        <p><strong>Quando andare:</strong> giugno e settembre sono i mesi ideali - mare caldo, meno folla, prezzi migliori. Agosto è molto affollato, arrivate presto la mattina.</p>
        <p><strong>Cosa portare:</strong> crema solare alta protezione (il sole del Salento è forte!), maschera e boccaglio per lo snorkeling, scarpe da scoglio per le calette rocciose.</p>
        <p><strong>Parcheggio:</strong> in alta stagione i parcheggi vicino alle spiagge sono a pagamento (€3-5 al giorno). Villa MareBlu offre parcheggio privato gratuito da cui potete partire per le spiagge.</p>
        <p><strong>Da Villa MareBlu:</strong> con il parcheggio privato e la posizione centrale, potete raggiungere tutte queste spiagge in pochi minuti. La sera tornate a casa, fate una doccia esterna rinfrescante e godetevi l'aperitivo in terrazza!</p>
      `,
      highlights: [
        'Giugno e settembre: mesi ideali',
        'Agosto: arrivare presto la mattina',
        'Portare crema solare e maschera snorkeling',
        'Villa MareBlu: parcheggio gratuito incluso'
      ]
    }
  ]
};
