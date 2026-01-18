import { GuideInfo } from '@/types/guide';
import { guideSpiagge } from './spiagge-torre-vado';
import { guideCosaFare } from './cosa-fare-torre-vado';
import { guideRistoranti } from './ristoranti-salento';
import { guideComeArrivare } from './come-arrivare-torre-vado';
import { guideItinerario } from './itinerario-7-giorni-salento';

// Array di tutte le guide
export const allGuides: GuideInfo[] = [
  guideSpiagge,
  guideCosaFare,
  guideRistoranti,
  guideComeArrivare,
  guideItinerario,
];

// Mappa per accesso rapido per slug
export const guidesBySlug: Record<string, GuideInfo> = allGuides.reduce(
  (acc, guide) => ({ ...acc, [guide.slug]: guide }),
  {}
);

// Funzione per ottenere una guida per slug
export const getGuideBySlug = (slug: string): GuideInfo | undefined => {
  return guidesBySlug[slug];
};

// Funzione per ottenere guide per categoria
export const getGuidesByCategory = (category: GuideInfo['category']): GuideInfo[] => {
  return allGuides.filter(guide => guide.category === category);
};

// Esporta anche le singole guide
export {
  guideSpiagge,
  guideCosaFare,
  guideRistoranti,
  guideComeArrivare,
  guideItinerario,
};
