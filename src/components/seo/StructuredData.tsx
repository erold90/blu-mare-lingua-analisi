
import React from 'react';

export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Villa MareBlu",
  "description": "Appartamenti vacanze di lusso sul mare in Salento, Puglia. Villa con vista mare e giardino mediterraneo.",
  "url": "https://www.villamareblu.it",
  "telephone": "+39 3937767749",
  "email": "macchiaforcato@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Marco Polo 112",
    "addressLocality": "Patù",
    "addressRegion": "Lecce",
    "postalCode": "73053",
    "addressCountry": "IT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.823534,
    "longitude": 18.292820
  },
  "openingHours": "Mo-Fr 09:00-18:00, Sa 09:00-13:00",
  "priceRange": "€€€",
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Vista mare",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Giardino",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Wi-Fi gratuito",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Parcheggio privato",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Aria condizionata",
      "value": true
    }
  ],
  "starRating": {
    "@type": "Rating",
    "ratingValue": "5"
  },
  "image": [
    "https://www.villamareblu.it/images/hero/hero.jpg",
    "https://www.villamareblu.it/images/apartments/appartamento-1/image1.jpg",
    "https://www.villamareblu.it/images/apartments/appartamento-2/image1.jpg"
  ],
  "sameAs": [
    "https://www.facebook.com/villamareblu",
    "https://www.instagram.com/villamareblu"
  ]
});

export const getApartmentSchema = (apartment: any) => ({
  "@context": "https://schema.org",
  "@type": "Apartment",
  "name": apartment.name,
  "description": apartment.description,
  "numberOfRooms": apartment.bedrooms,
  "occupancy": {
    "@type": "QuantitativeValue",
    "maxValue": apartment.maxGuests
  },
  "amenityFeature": apartment.amenities?.map((amenity: string) => ({
    "@type": "LocationFeatureSpecification",
    "name": amenity,
    "value": true
  })),
  "image": apartment.images?.map((img: string) => `https://www.villamareblu.it${img}`),
  "isPartOf": {
    "@type": "LodgingBusiness",
    "name": "Villa MareBlu"
  }
});

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

export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Villa MareBlu",
  "url": "https://www.villamareblu.it",
  "description": "Villa MareBlu - Appartamenti vacanze di lusso sul mare in Salento, Puglia",
  "inLanguage": "it-IT",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.villamareblu.it/preventivo?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});
