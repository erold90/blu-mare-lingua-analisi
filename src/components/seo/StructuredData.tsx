
import React from 'react';
import { Apartment } from '@/data/apartments';
import { homeFAQs, apartmentsFAQs, quoteFAQs, contactsFAQs, aboutFAQs } from '@/data/faqData';
import type { FAQItem } from '@/types/faq';

// Schema LodgingBusiness principale per Villa MareBlu
export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": "https://www.villamareblu.it/#lodgingbusiness",
  "name": "Villa MareBlu - Casa Vacanze Torre Vado Salento",
  "alternateName": "Villa MareBlu Salento",
  "description": "Villa MareBlu: appartamenti vacanze vista mare a Torre Vado, nel cuore del Salento. A soli 100 metri dalle spiagge di Pescoluse (Maldive del Salento) e Santa Maria di Leuca. 4 appartamenti da 4 a 8 posti letto con terrazza panoramica sul Mar Ionio.",
  "url": "https://www.villamareblu.it",
  "telephone": "+39 378 0038730",
  "email": "macchiaforcato@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Marco Polo 112",
    "addressLocality": "Patù",
    "addressRegion": "Puglia",
    "postalCode": "73053",
    "addressCountry": "IT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.823534,
    "longitude": 18.292820
  },
  "hasMap": "https://maps.app.goo.gl/7crsN8yaLjjjibxMA",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "priceRange": "€100-€150/notte",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Bonifico bancario, Contanti",
  "areaServed": [
    {
      "@type": "Place",
      "name": "Torre Vado"
    },
    {
      "@type": "Place",
      "name": "Pescoluse"
    },
    {
      "@type": "Place",
      "name": "Santa Maria di Leuca"
    },
    {
      "@type": "Place",
      "name": "Salento"
    }
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Vista mare panoramica", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Giardino mediterraneo", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi gratuito", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Parcheggio privato gratuito", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aria condizionata", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Terrazza/Veranda", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Barbecue", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Doccia esterna", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cucina attrezzata", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Animali ammessi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Distanza dal mare", "value": "100 metri" }
  ],
  "image": [
    "https://www.villamareblu.it/images/hero/hero.jpg",
    "https://www.villamareblu.it/images/apartments/appartamento-1/image1.jpg",
    "https://www.villamareblu.it/images/apartments/appartamento-2/image1.jpg"
  ],
  "containsPlace": [
    { "@type": "Accommodation", "name": "Appartamento 1 - 6 posti", "occupancy": { "@type": "QuantitativeValue", "value": 6 } },
    { "@type": "Accommodation", "name": "Appartamento 2 - 8 posti", "occupancy": { "@type": "QuantitativeValue", "value": 8 } },
    { "@type": "Accommodation", "name": "Appartamento 3 - 4 posti", "occupancy": { "@type": "QuantitativeValue", "value": 4 } },
    { "@type": "Accommodation", "name": "Appartamento 4 - 5 posti", "occupancy": { "@type": "QuantitativeValue", "value": 5 } }
  ],
  "checkinTime": "15:00",
  "checkoutTime": "10:00",
  "petsAllowed": true,
  "smokingAllowed": false,
  "tourBookingPage": "https://www.villamareblu.it/preventivo"
});

// Schema VacationRental per singolo appartamento (Google Vacation Rentals)
export const getVacationRentalSchema = (apartment: Apartment) => ({
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "@id": `https://www.villamareblu.it/appartamenti#${apartment.id}`,
  "name": `${apartment.name} - Villa MareBlu Torre Vado Salento`,
  "description": apartment.longDescription || apartment.description,
  "url": `https://www.villamareblu.it/appartamenti`,
  "identifier": apartment.CIN,
  "maximumAttendeeCapacity": apartment.capacity,
  "numberOfBedrooms": apartment.bedrooms,
  "numberOfBathroomsTotal": 1,
  "numberOfRooms": (apartment.bedrooms || 1) + 2,
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": apartment.size,
    "unitCode": "MTK"
  },
  "petsAllowed": true,
  "tourBookingPage": "https://www.villamareblu.it/preventivo",
  "checkinTime": "15:00",
  "checkoutTime": "10:00",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Marco Polo 112",
    "addressLocality": "Patù",
    "addressRegion": "Puglia",
    "postalCode": "73053",
    "addressCountry": "IT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.823534,
    "longitude": 18.292820
  },
  "amenityFeature": [
    ...apartment.services.map(service => ({
      "@type": "LocationFeatureSpecification",
      "name": service,
      "value": true
    })),
    { "@type": "LocationFeatureSpecification", "name": "Vista mare", "value": apartment.view === "mare" },
    { "@type": "LocationFeatureSpecification", "name": "Aria condizionata", "value": apartment.hasAirConditioning },
    { "@type": "LocationFeatureSpecification", "name": "Terrazza", "value": apartment.hasTerrace },
    { "@type": "LocationFeatureSpecification", "name": "Veranda", "value": apartment.hasVeranda }
  ],
  "image": `https://www.villamareblu.it/images/apartments/${apartment.id}/image1.jpg`,
  "containedInPlace": {
    "@type": "LodgingBusiness",
    "@id": "https://www.villamareblu.it/#lodgingbusiness",
    "name": "Villa MareBlu"
  },
  "potentialAction": {
    "@type": "ReserveAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.villamareblu.it/preventivo",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    },
    "result": {
      "@type": "LodgingReservation",
      "name": `Prenotazione ${apartment.name}`
    }
  }
});

// Schema Apartment tradizionale (backup)
export const getApartmentSchema = (apartment: Apartment) => ({
  "@context": "https://schema.org",
  "@type": "Apartment",
  "name": `${apartment.name} - Casa Vacanze Torre Vado Salento`,
  "description": apartment.longDescription || apartment.description,
  "numberOfRooms": apartment.bedrooms,
  "numberOfBedrooms": apartment.bedrooms,
  "floorLevel": apartment.floor === "terra" ? "0" : "1",
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": apartment.size,
    "unitCode": "MTK"
  },
  "occupancy": {
    "@type": "QuantitativeValue",
    "value": apartment.capacity,
    "unitText": "ospiti"
  },
  "amenityFeature": apartment.services.map(service => ({
    "@type": "LocationFeatureSpecification",
    "name": service,
    "value": true
  })),
  "image": `https://www.villamareblu.it/images/apartments/${apartment.id}/image1.jpg`,
  "containedInPlace": {
    "@type": "LodgingBusiness",
    "name": "Villa MareBlu Torre Vado"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Marco Polo 112",
    "addressLocality": "Patù",
    "addressRegion": "Puglia",
    "postalCode": "73053",
    "addressCountry": "IT"
  }
});

// Schema BreadcrumbList
export const getBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://www.villamareblu.it${item.url}`
  }))
});

// Schema WebSite con SearchAction
export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.villamareblu.it/#website",
  "name": "Villa MareBlu - Casa Vacanze Salento Torre Vado",
  "alternateName": "Villa MareBlu Salento",
  "url": "https://www.villamareblu.it",
  "description": "Villa MareBlu: appartamenti vacanze vista mare nel Salento, a Torre Vado vicino Pescoluse e Santa Maria di Leuca. Prenota direttamente!",
  "inLanguage": "it-IT",
  "publisher": {
    "@type": "Organization",
    "name": "Villa MareBlu",
    "url": "https://www.villamareblu.it"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.villamareblu.it/preventivo"
    },
    "query-input": "required name=search_term_string"
  }
});

// Tipo per le pagine con FAQ
export type FAQPageType = 'home' | 'apartments' | 'quote' | 'contacts' | 'about';

// Mappa FAQ per pagina
const faqsByPage: Record<FAQPageType, FAQItem[]> = {
  home: homeFAQs,
  apartments: apartmentsFAQs,
  quote: quoteFAQs,
  contacts: contactsFAQs,
  about: aboutFAQs
};

// Schema FAQPage generico che accetta una lista di FAQ
export const getFAQSchemaFromItems = (faqs: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Schema FAQPage per pagina specifica
export const getFAQSchemaForPage = (page: FAQPageType) => {
  const faqs = faqsByPage[page];
  return getFAQSchemaFromItems(faqs);
};

// Schema FAQPage per homepage (backwards compatible)
export const getFAQSchema = () => getFAQSchemaForPage('home');

// Schema Place per località turistiche vicine
export const getNearbyPlacesSchema = () => ({
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "name": "Salento - Torre Vado e dintorni",
  "description": "Il Salento, la punta più meridionale della Puglia, dove il Mar Ionio incontra l'Adriatico. Terra di spiagge cristalline, barocco leccese e tradizioni millenarie.",
  "containsPlace": [
    {
      "@type": "Beach",
      "name": "Spiaggia di Torre Vado",
      "description": "Spiaggia di sabbia fine a 100 metri da Villa MareBlu"
    },
    {
      "@type": "Beach",
      "name": "Pescoluse - Maldive del Salento",
      "description": "Famosa spiaggia di sabbia bianca e mare cristallino, a 5 minuti in auto"
    },
    {
      "@type": "TouristAttraction",
      "name": "Santa Maria di Leuca",
      "description": "Il punto più a sud della Puglia, dove l'Adriatico incontra lo Ionio. A 10 minuti in auto"
    },
    {
      "@type": "City",
      "name": "Gallipoli",
      "description": "Perla dello Ionio, città storica con spiagge meravigliose. A 30 minuti in auto"
    },
    {
      "@type": "City",
      "name": "Otranto",
      "description": "Porta d'Oriente, patrimonio UNESCO. A 45 minuti in auto"
    }
  ]
});

// Esporta tutti gli schema combinati per la homepage
export const getAllHomeSchemas = () => [
  getLocalBusinessSchema(),
  getWebsiteSchema(),
  getFAQSchema(),
  getNearbyPlacesSchema()
];
