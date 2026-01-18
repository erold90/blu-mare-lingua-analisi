export interface GuideSection {
  id: string;
  title: string;
  content: string;
  image?: string;
  imageAlt?: string;
  highlights?: string[]; // Punti chiave per snippet
}

export interface GuideInfo {
  slug: string;
  title: string;
  subtitle: string;
  description: string; // Meta description per SEO
  heroImage: string;
  heroImageAlt: string;
  category: 'spiagge' | 'attivita' | 'gastronomia' | 'pratico' | 'itinerari';
  readingTime: number; // minuti
  lastUpdated: string; // ISO date
  keywords: string[];
  sections: GuideSection[];
  relatedGuides?: string[]; // slugs di guide correlate
  ctaText?: string;
}

export interface GuideCategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const guideCategories: GuideCategoryInfo[] = [
  { id: 'spiagge', name: 'Spiagge', description: 'Le spiagge più belle del Salento', icon: 'waves' },
  { id: 'attivita', name: 'Cosa Fare', description: 'Attività ed escursioni', icon: 'compass' },
  { id: 'gastronomia', name: 'Dove Mangiare', description: 'Ristoranti e cucina tipica', icon: 'utensils' },
  { id: 'pratico', name: 'Info Pratiche', description: 'Come arrivare, trasporti, servizi', icon: 'info' },
  { id: 'itinerari', name: 'Itinerari', description: 'Percorsi e vacanze tipo', icon: 'map' },
];
