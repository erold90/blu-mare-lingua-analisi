
// Dati di esempio per gli appartamenti
export interface Apartment {
  id: string;
  name: string;
  description: string;
  capacity: number;
  floor: string;
  view: string;
  size: number;
  price: number;
  services: string[];
  images: string[];
}

export const apartments: Apartment[] = [
  {
    id: "bilocale-piano-terra",
    name: "Bilocale Piano Terra",
    description: "Appartamento con accesso diretto al giardino",
    capacity: 4,
    floor: "terra",
    view: "giardino",
    size: 45,
    price: 120,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV"],
    images: ["placeholder.svg"],
  },
  {
    id: "bilocale-primo-piano",
    name: "Bilocale Primo Piano",
    description: "Appartamento con vista panoramica",
    capacity: 4,
    floor: "primo",
    view: "mare",
    size: 45,
    price: 130,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV"],
    images: ["placeholder.svg"],
  },
  {
    id: "trilocale-piano-terra",
    name: "Trilocale Piano Terra",
    description: "Spazioso appartamento con accesso giardino",
    capacity: 6,
    floor: "terra",
    view: "giardino",
    size: 65,
    price: 160,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV", "Lavastoviglie"],
    images: ["placeholder.svg"],
  },
  {
    id: "trilocale-primo-piano",
    name: "Trilocale Primo Piano",
    description: "Grande appartamento con vista mare",
    capacity: 6,
    floor: "primo",
    view: "mare",
    size: 65,
    price: 180,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV", "Lavastoviglie"],
    images: ["placeholder.svg"],
  },
];
