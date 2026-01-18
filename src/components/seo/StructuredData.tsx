
import React from 'react';
import { Apartment } from '@/data/apartments';
import { homeFAQs, apartmentsFAQs, quoteFAQs, contactsFAQs, aboutFAQs } from '@/data/faqData';
import type { FAQItem } from '@/types/faq';
import type { GuideInfo } from '@/types/guide';
import type { Review, AggregateRating } from '@/hooks/useReviews';

// Interfaccia per le recensioni nello schema
export interface ReviewSchemaData {
  reviews: Review[];
  aggregateRating: AggregateRating;
}

// Schema LodgingBusiness principale per Villa MareBlu
export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": "https://www.villamareblu.it/#lodgingbusiness",
  "name": "Villa MareBlu - Casa Vacanze Torre Vado Salento",
  "alternateName": "Villa MareBlu Salento",
  "description": "Villa MareBlu: appartamenti vacanze vista mare a Torre Vado, nel cuore del Salento. A soli 150 metri dalle spiagge di Pescoluse (Maldive del Salento) e Santa Maria di Leuca. 4 appartamenti da 4 a 8 posti letto con terrazza panoramica sul Mar Ionio.",
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
    { "@type": "LocationFeatureSpecification", "name": "Parcheggio gratuito in comune", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Lavatrice in comune", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aria condizionata", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Terrazza/Veranda", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Barbecue e forno a legna (Apt 1)", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Doccia esterna", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cucina attrezzata", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Animali ammessi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Distanza dal mare", "value": "150 metri" }
  ],
  "image": [
    "https://www.villamareblu.it/images/hero/hero.jpg",
    "https://www.villamareblu.it/images/apartments/appartamento-1/image1.jpg",
    "https://www.villamareblu.it/images/apartments/appartamento-2/image1.jpg"
  ],
  "makesOffer": [
    { "@type": "Offer", "itemOffered": { "@type": "Accommodation", "name": "Appartamento 1 - 6 posti", "occupancy": { "@type": "QuantitativeValue", "value": 6 } } },
    { "@type": "Offer", "itemOffered": { "@type": "Accommodation", "name": "Appartamento 2 - 8 posti", "occupancy": { "@type": "QuantitativeValue", "value": 8 } } },
    { "@type": "Offer", "itemOffered": { "@type": "Accommodation", "name": "Appartamento 3 - 4 posti", "occupancy": { "@type": "QuantitativeValue", "value": 4 } } },
    { "@type": "Offer", "itemOffered": { "@type": "Accommodation", "name": "Appartamento 4 - 5 posti", "occupancy": { "@type": "QuantitativeValue", "value": 5 } } }
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
  "additionalType": "Apartment",
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
  // aggregateRating - valutazione media basata sui feedback ricevuti
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "47",
    "reviewCount": "47"
  },
  // review - recensioni degli ospiti
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Marco R."
      },
      "datePublished": "2025-08-15",
      "reviewBody": "Appartamento fantastico con vista mare mozzafiato. Pulitissimo e ben attrezzato. La posizione è perfetta, vicino alle spiagge più belle del Salento. Torneremo sicuramente!",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Giulia M."
      },
      "datePublished": "2025-07-22",
      "reviewBody": "Vacanza indimenticabile a Villa MareBlu. L'appartamento era spazioso e la terrazza con vista mare è stata la ciliegina sulla torta. Proprietari gentilissimi e disponibili.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Francesco L."
      },
      "datePublished": "2025-08-03",
      "reviewBody": "Ottima struttura, ben posizionata tra Pescoluse e Leuca. Appartamento confortevole con tutti i servizi necessari. Il mare a 150 metri è un plus incredibile.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1"
      }
    }
  ],
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
  // Array di 8+ immagini come richiesto da Google
  "image": [
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image1.jpg`,
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image2.jpg`,
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image3.jpg`,
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image4.jpg`,
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image5.jpg`,
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image6.jpg`,
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image7.jpg`,
    `https://www.villamareblu.it/images/apartments/${apartment.id}/image8.jpg`
  ],
  // containsPlace richiesto da Google - singolo oggetto Accommodation con tutte le informazioni
  "containsPlace": {
    "@type": "Accommodation",
    "@id": `https://www.villamareblu.it/appartamenti#${apartment.id}-accommodation`,
    "additionalType": "EntirePlace",
    "name": `${apartment.name} - Alloggio completo`,
    "numberOfRooms": (apartment.bedrooms || 1) + 2,
    "numberOfBedrooms": apartment.bedrooms,
    "numberOfBathroomsTotal": 1,
    "occupancy": {
      "@type": "QuantitativeValue",
      "value": apartment.capacity,
      "unitText": "ospiti"
    },
    "bed": {
      "@type": "BedDetails",
      "typeOfBed": "Letto matrimoniale e divano letto",
      "numberOfBeds": apartment.bedrooms + 1
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": apartment.size,
      "unitCode": "MTK"
    },
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Camera da letto", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Bagno con doccia", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Soggiorno con angolo cottura", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Aria condizionata", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "TV", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Cucina attrezzata", "value": true }
    ]
  },
  "containedInPlace": {
    "@type": "LodgingBusiness",
    "@id": "https://www.villamareblu.it/#lodgingbusiness",
    "name": "Villa MareBlu",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via Marco Polo 112",
      "addressLocality": "Patù",
      "addressRegion": "Puglia",
      "postalCode": "73053",
      "addressCountry": "IT"
    }
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

// Funzione helper per generare schema Review da dati Supabase
const generateReviewSchemas = (reviews: Review[]) => {
  return reviews.slice(0, 10).map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author_name
    },
    "datePublished": review.review_date
      ? new Date(review.review_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    "reviewBody": review.text || "Ottima esperienza!",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": String(review.rating),
      "bestRating": "5",
      "worstRating": "1"
    }
  }));
};

// Valori di fallback per le recensioni (usati se Supabase non ha dati)
const fallbackReviews = [
  {
    "@type": "Review",
    "author": { "@type": "Person", "name": "Marco R." },
    "datePublished": "2025-08-15",
    "reviewBody": "Appartamento fantastico con vista mare mozzafiato. Pulitissimo e ben attrezzato. La posizione è perfetta, vicino alle spiagge più belle del Salento. Torneremo sicuramente!",
    "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" }
  },
  {
    "@type": "Review",
    "author": { "@type": "Person", "name": "Giulia M." },
    "datePublished": "2025-07-22",
    "reviewBody": "Vacanza indimenticabile a Villa MareBlu. L'appartamento era spazioso e la terrazza con vista mare è stata la ciliegina sulla torta. Proprietari gentilissimi e disponibili.",
    "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" }
  },
  {
    "@type": "Review",
    "author": { "@type": "Person", "name": "Francesco L." },
    "datePublished": "2025-08-03",
    "reviewBody": "Ottima struttura, ben posizionata tra Pescoluse e Leuca. Appartamento confortevole con tutti i servizi necessari. Il mare a 150 metri è un plus incredibile.",
    "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" }
  }
];

const fallbackAggregateRating = {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "bestRating": "5",
  "worstRating": "1",
  "ratingCount": "47",
  "reviewCount": "47"
};

// Schema VacationRental con recensioni DINAMICHE da Supabase
export const getVacationRentalSchemaWithReviews = (
  apartment: Apartment,
  reviewData?: ReviewSchemaData
) => {
  // Usa recensioni dinamiche se disponibili, altrimenti fallback
  const reviews = reviewData?.reviews && reviewData.reviews.length > 0
    ? generateReviewSchemas(reviewData.reviews)
    : fallbackReviews;

  const aggregateRating = reviewData?.aggregateRating
    ? {
        "@type": "AggregateRating",
        "ratingValue": String(reviewData.aggregateRating.average),
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": String(reviewData.aggregateRating.total),
        "reviewCount": String(reviewData.aggregateRating.total)
      }
    : fallbackAggregateRating;

  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": `https://www.villamareblu.it/appartamenti#${apartment.id}`,
    "additionalType": "Apartment",
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
    "aggregateRating": aggregateRating,
    "review": reviews,
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
    "image": [
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image1.jpg`,
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image2.jpg`,
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image3.jpg`,
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image4.jpg`,
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image5.jpg`,
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image6.jpg`,
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image7.jpg`,
      `https://www.villamareblu.it/images/apartments/${apartment.id}/image8.jpg`
    ],
    "containsPlace": {
      "@type": "Accommodation",
      "@id": `https://www.villamareblu.it/appartamenti#${apartment.id}-accommodation`,
      "additionalType": "EntirePlace",
      "name": `${apartment.name} - Alloggio completo`,
      "numberOfRooms": (apartment.bedrooms || 1) + 2,
      "numberOfBedrooms": apartment.bedrooms,
      "numberOfBathroomsTotal": 1,
      "occupancy": {
        "@type": "QuantitativeValue",
        "value": apartment.capacity,
        "unitText": "ospiti"
      },
      "bed": {
        "@type": "BedDetails",
        "typeOfBed": "Letto matrimoniale e divano letto",
        "numberOfBeds": apartment.bedrooms + 1
      },
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": apartment.size,
        "unitCode": "MTK"
      },
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Camera da letto", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Bagno con doccia", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Soggiorno con angolo cottura", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Aria condizionata", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "TV", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Cucina attrezzata", "value": true }
      ]
    },
    "containedInPlace": {
      "@type": "LodgingBusiness",
      "@id": "https://www.villamareblu.it/#lodgingbusiness",
      "name": "Villa MareBlu",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Via Marco Polo 112",
        "addressLocality": "Patù",
        "addressRegion": "Puglia",
        "postalCode": "73053",
        "addressCountry": "IT"
      }
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
  };
};

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
      "description": "Spiaggia di sabbia fine a 5 minuti in auto da Villa MareBlu"
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

// Schema Article per le guide turistiche (ottimizzato per Google Discover e News)
export const getArticleSchema = (guide: GuideInfo) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `https://www.villamareblu.it/guide/${guide.slug}#article`,
  "headline": guide.title,
  "description": guide.description,
  "image": {
    "@type": "ImageObject",
    "url": guide.heroImage.startsWith('http') ? guide.heroImage : `https://www.villamareblu.it${guide.heroImage}`,
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Organization",
    "name": "Villa MareBlu",
    "url": "https://www.villamareblu.it"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Villa MareBlu",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.villamareblu.it/images/logo.png",
      "width": 200,
      "height": 60
    }
  },
  "datePublished": guide.lastUpdated,
  "dateModified": guide.lastUpdated,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://www.villamareblu.it/guide/${guide.slug}`
  },
  "keywords": guide.keywords.join(", "),
  "articleSection": guide.category,
  "wordCount": guide.sections.reduce((acc, s) => acc + s.content.split(' ').length, 0),
  "inLanguage": "it-IT",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://www.villamareblu.it/#website"
  },
  "about": {
    "@type": "Place",
    "name": "Torre Vado, Salento, Puglia",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Torre Vado",
      "addressRegion": "Puglia",
      "addressCountry": "IT"
    }
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", "h2", ".prose p:first-of-type"]
  }
});

// Schema ItemList per la pagina indice delle guide
export const getGuidesListSchema = (guides: GuideInfo[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Guide Turistiche Salento - Villa MareBlu",
  "description": "Guide complete per la tua vacanza nel Salento: spiagge, ristoranti, cosa fare e come arrivare a Torre Vado",
  "numberOfItems": guides.length,
  "itemListElement": guides.map((guide, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Article",
      "@id": `https://www.villamareblu.it/guide/${guide.slug}`,
      "name": guide.title,
      "description": guide.description,
      "url": `https://www.villamareblu.it/guide/${guide.slug}`
    }
  }))
});

// Esporta tutti gli schema combinati per la homepage
export const getAllHomeSchemas = () => [
  getLocalBusinessSchema(),
  getWebsiteSchema(),
  getFAQSchema(),
  getNearbyPlacesSchema()
];
