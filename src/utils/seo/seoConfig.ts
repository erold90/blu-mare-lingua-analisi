
export const seoKeywords = {
  primary: [
    "villa salento mare",
    "appartamenti vacanze puglia", 
    "casa vacanza vista mare",
    "affitto vacanze salento",
    "villa mareblu salento"
  ],
  secondary: [
    "casa vacanze santa maria di leuca",
    "appartamenti salento sul mare",
    "villa vacanze capo di leuca", 
    "affitto casa puglia mare",
    "vacanze salento appartamenti",
    "casa vacanze sul mare",
    "villa fronte mare puglia",
    "appartamenti vista mare",
    "vacanze famiglia puglia",
    "affitto vacanze estate"
  ],
  longTail: [
    "casa vacanze vicino spiaggia",
    "villa fronte mare",
    "appartamenti ammobiliati puglia",
    "dove dormire salento mare",
    "migliori case vacanze puglia",
    "villa con giardino salento",
    "appartamenti 4 persone puglia",
    "casa vacanze bambini puglia",
    "villa lusso salento mare",
    "affitto settimanale puglia",
    "vacanze gruppo amici salento"
  ],
  seasonal: [
    "vacanze estate salento",
    "casa vacanze agosto puglia",
    "weekend romantico salento",
    "vacanze pasqua puglia",
    "ferragosto salento appartamenti",
    "vacanze ponte maggio puglia"
  ],
  competitive: [
    "alternativa airbnb salento",
    "booking villa puglia",
    "vrbo salento appartamenti"
  ],
  // Nuovi titoli ottimizzati per Google Ads (max 30 caratteri)
  adTitles: [
    "Villa MareBlu Vista Mare",      // 25 caratteri
    "Appartamenti Mare Salento",     // 25 caratteri
    "Casa Vacanze Sul Mare",         // 21 caratteri
    "Affitto Villa Salento",         // 21 caratteri
    "Villa Fronte Mare Puglia",      // 26 caratteri
    "Vacanze Lusso Salento",         // 21 caratteri
    "Appartamenti Vista Mare",       // 23 caratteri
    "Casa Mare Puglia",              // 16 caratteri
    "Villa Sul Mare",                // 14 caratteri
    "Vacanze Salento Mare",          // 20 caratteri
    "Lusso Vista Mare",              // 17 caratteri
    "Villa Vacanze Puglia",          // 21 caratteri
    "Casa Fronte Mare",              // 17 caratteri
    "Appartamenti Lusso",            // 19 caratteri
    "Salento Villa Mare"             // 19 caratteri
  ],
  // Descrizioni ottimizzate per Google Ads (max 90 caratteri)
  adDescriptions: [
    "Appartamenti vacanze lusso con vista mare Salento. A 100m dalla spiaggia. Prenota ora!", // 89 caratteri
    "Villa MareBlu: casa vacanze fronte mare Puglia. Vista panoramica mozzafiato sul mare!", // 87 caratteri
    "Vacanze da sogno in Salento! Appartamenti vista mare, giardino, tutti i comfort inclusi.", // 89 caratteri
    "La tua villa fronte mare in Puglia ti aspetta. Lusso, comfort e vista mare indimenticabile!" // 90 caratteri
  ]
};

export const getAllKeywords = (): string => {
  return Object.values(seoKeywords).flat().join(", ");
};

export const getPageSpecificKeywords = (page: string): string => {
  const baseKeywords = [...seoKeywords.primary, ...seoKeywords.secondary];
  
  switch (page) {
    case 'home':
      return [...baseKeywords, ...seoKeywords.longTail.slice(0, 10)].join(", ");
    case 'apartments':
      return [...baseKeywords, "appartamenti ammobiliati puglia", "villa con giardino salento", "appartamenti 4 persone puglia"].join(", ");
    case 'services':
      return [...baseKeywords, "villa lusso salento mare", "casa vacanze bambini puglia", "vacanze famiglia puglia"].join(", ");
    case 'about':
      return [...baseKeywords, "villa fronte mare", "dove dormire salento mare", "migliori case vacanze puglia"].join(", ");
    case 'contact':
      return [...baseKeywords, "affitto settimanale puglia", "weekend romantico salento"].join(", ");
    case 'quote':
      return [...baseKeywords, ...seoKeywords.competitive, ...seoKeywords.seasonal.slice(0, 3)].join(", ");
    default:
      return baseKeywords.join(", ");
  }
};

// Funzione per ottenere i titoli Google Ads
export const getGoogleAdsTitles = (): string[] => {
  return seoKeywords.adTitles;
};

// Funzione per ottenere le descrizioni Google Ads
export const getGoogleAdsDescriptions = (): string[] => {
  return seoKeywords.adDescriptions;
};
