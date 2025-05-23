// Dati degli appartamenti
export interface Apartment {
  id: string;
  name: string;
  description: string;
  capacity: number;
  floor: string;
  view: string;
  size: number;
  price: number;
  cleaningFee?: number;
  services: string[];
  images: string[];
  longDescription?: string;
  CIN?: string;
  bedrooms?: number;
  beds?: number;
  booked?: boolean;
  hasVeranda?: boolean;
  hasTerrace?: boolean;
  hasAirConditioning?: boolean;
}

export const apartments: Apartment[] = [
  {
    id: "appartamento-1",
    name: "Appartamento 1",
    description: "Due camere da letto con accesso privato e vista panoramica",
    capacity: 6,
    floor: "terra",
    view: "mare",
    size: 65,
    price: 120,
    services: ["WiFi", "Fresco Naturale", "Parcheggio", "TV", "Ampia Veranda", "Doccia Esterna", "Barbeque"],
    images: ["placeholder.svg"],
    longDescription: "L'appartamento, con ingresso privato, dispone di due accoglienti camere da letto. La prima camera è arredata con letto matrimoniale e un letto a castello, ideale per famiglie o gruppi di amici. La seconda camera è dotata di un elegante letto matrimoniale. Il soggiorno, luminoso e spazioso, include un pratico angolo cottura completamente attrezzato e una zona pranzo per piacevoli momenti conviviali. L'esterno dell'appartamento è una vera oasi di tranquillità: sotto la tettoia, troverai un comodo tavolo da pranzo, sedie e sdraio per goderti al massimo la vista panoramica sul Mar Ionio. Un luogo perfetto per cene romantiche al tramonto o semplicemente per rilassarti sotto il cielo stellato.",
    CIN: "IT075060C200036553",
    bedrooms: 2,
    beds: 6,
    hasVeranda: true,
    hasTerrace: false,
    hasAirConditioning: false
  },
  {
    id: "appartamento-2",
    name: "Appartamento 2",
    description: "Tre camere da letto per un massimo di 8 ospiti",
    capacity: 8,
    floor: "primo",
    view: "mare",
    size: 90,
    price: 150,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV", "Terrazzo panoramico", "Doccia Esterna", "Barbeque"],
    images: ["placeholder.svg"],
    longDescription: "L'appartamento, dotato di un ingresso privato, offre un totale di 3 camere da letto per un massimo di 8 ospiti. La distribuzione delle camere è pensata per ospitare comodamente due famiglie o gruppi di amici, con una camera matrimoniale con letto singolo, una seconda camera matrimoniale con letto singolo e un'altra camera con un pratico letto a castello, un bagno completo con doccia, soggiorno con angolo cucina. Dal soggiorno è possibile accedere al terrazzo arredato con tavolo, sedie e sdraio, regalando una vista panoramica mozzafiato sul Mar Ionio. Un luogo ideale per godere di cene al tramonto o semplicemente rilassarsi sotto il cielo stellato.",
    CIN: "IT075060C200072190",
    bedrooms: 3,
    beds: 8,
    hasVeranda: false,
    hasTerrace: true,
    hasAirConditioning: true
  },
  {
    id: "appartamento-3",
    name: "Appartamento 3",
    description: "Una camera con letto matrimoniale e letto a castello",
    capacity: 4,
    floor: "terra",
    view: "mare",
    size: 45,
    price: 100,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV", "Terrazzo vista mare", "Doccia Esterna", "Barbeque"],
    images: ["placeholder.svg"],
    longDescription: "L'appartamento dispone di una camera da letto, arredata con un comodo letto matrimoniale e un pratico letto a castello, perfetto per famiglie o gruppi di amici. Su richiesta, è disponibile anche una culla portatile per accogliere i più piccoli, garantendo a tutti gli ospiti una vacanza serena e su misura. Il bagno, completo di tutti i comfort, assicura un'esperienza rilassante, mentre il soggiorno con angolo cucina rappresenta il luogo ideale per trascorrere piacevoli momenti di convivialità. La cucina è attrezzata con tutto il necessario per preparare deliziose cene o gustose colazioni, offrendo la flessibilità di organizzare i pasti in totale libertà. L'ampio terrazzo esterno, dotato di tavolo e sedie, si affaccia direttamente sul mare, offrendo uno scenario incantevole per pranzi e cene all'aperto.",
    CIN: "IT075060C200072190",
    bedrooms: 1,
    beds: 4,
    hasVeranda: false,
    hasTerrace: true,
    hasAirConditioning: true
  },
  {
    id: "appartamento-4",
    name: "Appartamento 4",
    description: "Due camere da letto con accesso indipendente",
    capacity: 5,
    floor: "primo",
    view: "panoramica",
    size: 70,
    price: 130,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV", "Zona esterna privata", "Doccia Esterna", "Barbeque"],
    images: ["placeholder.svg"],
    longDescription: "L'appartamento, con accesso indipendente, dispone di 2 camere da letto. La prima camera è arredata con tre letti singoli, che possono essere facilmente trasformati in un letto matrimoniale e un letto singolo a seconda delle esigenze, mentre la seconda camera è dotata di un letto matrimoniale. Entrambe le camere sono provviste di aria condizionata per garantire un soggiorno piacevole anche nelle giornate più calde. Il bagno completo con doccia, la zona giorno con angolo cottura completamente attrezzato, la sala da pranzo e la zona esterna privata con tettoia, tavolo da pranzo e sedie offrono tutto ciò di cui hai bisogno per una vacanza rilassante.",
    CIN: "IT075060C200036553",
    bedrooms: 2,
    beds: 5,
    hasVeranda: true,
    hasTerrace: false,
    hasAirConditioning: true
  },
];
