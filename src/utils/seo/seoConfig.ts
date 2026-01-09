
export const seoKeywords = {
  // Keywords primarie per località specifiche
  primary: [
    "villa mareblu",
    "villa salento mare",
    "appartamenti vacanze puglia",
    "casa vacanza vista mare salento",
    "affitto vacanze salento"
  ],
  // Keywords località specifiche (MOLTO IMPORTANTE per local SEO)
  local: [
    // Torre Vado
    "casa vacanze torre vado",
    "appartamento torre vado mare",
    "affitto villa torre vado",
    "vacanze torre vado salento",
    // Pescoluse - Maldive del Salento
    "casa vacanze pescoluse",
    "appartamento pescoluse maldive salento",
    "affitto vacanze pescoluse",
    "maldive del salento appartamento",
    "vacanze pescoluse spiaggia",
    // Santa Maria di Leuca
    "casa vacanze santa maria di leuca",
    "appartamento leuca mare",
    "affitto villa leuca",
    "vacanze leuca salento",
    "de finibus terrae leuca",
    // Marina di San Gregorio
    "vacanze san gregorio salento",
    "appartamento san gregorio mare",
    // Patù
    "casa vacanze patù",
    "appartamento patù salento",
    // Generale Salento
    "casa vacanze salento",
    "appartamenti salento sul mare",
    "villa salento vista mare",
    "affitto casa salento mare",
    "vacanze salento appartamenti",
    "salento casa vacanze fronte mare",
    // Puglia generale
    "casa vacanze puglia mare",
    "appartamenti puglia sul mare",
    "villa puglia vacanze",
    "affitto vacanze puglia"
  ],
  secondary: [
    "villa fronte mare puglia",
    "appartamenti vista mare salento",
    "vacanze famiglia puglia",
    "affitto settimanale salento",
    "casa vacanze sul mare",
    "villa vacanze capo di leuca",
    "affitto casa puglia mare"
  ],
  longTail: [
    "casa vacanze vicino spiaggia salento",
    "villa fronte mare torre vado",
    "appartamenti ammobiliati puglia mare",
    "dove dormire salento mare",
    "migliori case vacanze salento",
    "villa con giardino salento mare",
    "appartamenti 4 persone salento",
    "appartamenti 6 persone torre vado",
    "appartamenti 8 persone leuca",
    "casa vacanze bambini salento",
    "villa lusso salento mare",
    "affitto settimanale torre vado",
    "vacanze gruppo amici salento",
    "casa vacanze con terrazza mare",
    "appartamento con vista mare salento",
    "affitto breve salento estate"
  ],
  seasonal: [
    "vacanze estate salento 2025",
    "casa vacanze agosto salento",
    "weekend romantico salento",
    "vacanze pasqua puglia",
    "ferragosto salento appartamenti",
    "vacanze ponte maggio salento",
    "settembre salento mare",
    "vacanze giugno salento"
  ],
  experiences: [
    "vacanze mare cristallino salento",
    "spiagge sabbia salento appartamento",
    "vacanze relax salento",
    "mare ionico salento casa",
    "costa ionica puglia vacanze",
    "baia torre vado",
    "scogliera salento appartamento"
  ],
  competitive: [
    "alternativa airbnb salento",
    "alternativa booking salento",
    "prenota diretto villa salento",
    "miglior prezzo casa vacanze salento"
  ],
  // Titoli Google Ads ottimizzati
  adTitles: [
    "Villa MareBlu Torre Vado",
    "Casa Vacanze Pescoluse",
    "Appartamenti Leuca Mare",
    "Villa Salento Vista Mare",
    "Maldive del Salento",
    "Vacanze Torre Vado",
    "Casa Mare Salento",
    "Villa Fronte Mare Puglia",
    "Appartamenti Salento",
    "Affitto Villa Leuca"
  ],
  adDescriptions: [
    "Villa MareBlu: appartamenti vista mare a Torre Vado. A 100m dalle Maldive del Salento. Prenota ora!",
    "Casa vacanze fronte mare nel Salento. Vista panoramica, giardino, parcheggio. Prenota diretto!",
    "Vacanze da sogno vicino Pescoluse e Leuca. Appartamenti 4-8 persone con terrazza sul mare.",
    "La tua villa sul mare a Torre Vado. Spiagge cristalline del Salento a 2 minuti a piedi!"
  ]
};

export const getAllKeywords = (): string => {
  return Object.values(seoKeywords).flat().join(", ");
};

export const getPageSpecificKeywords = (page: string): string => {
  const baseKeywords = [...seoKeywords.primary, ...seoKeywords.local.slice(0, 15)];

  switch (page) {
    case 'home':
      return [...baseKeywords, ...seoKeywords.secondary, ...seoKeywords.experiences].join(", ");
    case 'apartments':
      return [...baseKeywords, ...seoKeywords.longTail.filter(k => k.includes('appartament') || k.includes('persone'))].join(", ");
    case 'about':
      return [...baseKeywords, ...seoKeywords.local.filter(k => k.includes('salento') || k.includes('puglia'))].join(", ");
    case 'contact':
      return [...baseKeywords, "prenota diretto villa salento", "contatti villa mareblu", "prenotazione diretta salento"].join(", ");
    case 'quote':
      return [...baseKeywords, ...seoKeywords.competitive, ...seoKeywords.seasonal].join(", ");
    default:
      return baseKeywords.join(", ");
  }
};

// Keywords specifiche per località
export const getLocationKeywords = (location: string): string => {
  const locationMap: Record<string, string[]> = {
    'torre-vado': [
      "casa vacanze torre vado",
      "appartamento torre vado mare",
      "affitto villa torre vado",
      "vacanze torre vado salento",
      "spiaggia torre vado"
    ],
    'pescoluse': [
      "casa vacanze pescoluse",
      "maldive del salento appartamento",
      "pescoluse spiaggia sabbia",
      "vacanze pescoluse salento"
    ],
    'leuca': [
      "casa vacanze santa maria di leuca",
      "appartamento leuca mare",
      "de finibus terrae vacanze",
      "capo di leuca villa"
    ],
    'salento': [
      "casa vacanze salento mare",
      "appartamenti salento sul mare",
      "villa salento vista mare",
      "vacanze salento puglia"
    ]
  };

  return locationMap[location]?.join(", ") || seoKeywords.primary.join(", ");
};

export const getGoogleAdsTitles = (): string[] => seoKeywords.adTitles;
export const getGoogleAdsDescriptions = (): string[] => seoKeywords.adDescriptions;
