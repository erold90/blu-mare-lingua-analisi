
export const seoKeywords = {
  primary: [
    "villa salento mare",
    "appartamenti vacanze puglia", 
    "casa vacanza torre vado",
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
    "villa con piscina puglia",
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
