
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Villa MareBlu Salento - Appartamenti Vacanze Sul Mare Puglia",
  description = "Villa MareBlu: appartamenti vacanze lusso sul mare in Salento, Puglia. Case vacanze Torre Vado, Santa Maria di Leuca. Piscina, vista mare, 4-8 persone. Prenota ora!",
  keywords = "villa salento mare, appartamenti vacanze puglia, casa vacanza torre vado, affitto vacanze salento, villa mareblu salento, casa vacanze santa maria di leuca, appartamenti salento sul mare, villa vacanze capo di leuca, affitto casa puglia mare, vacanze salento appartamenti, casa vacanze sul mare, villa con piscina puglia, appartamenti vista mare, vacanze famiglia puglia, affitto vacanze estate, casa vacanze vicino spiaggia, villa fronte mare, appartamenti ammobiliati puglia, dove dormire salento mare, migliori case vacanze puglia, villa con giardino salento, appartamenti 4 persone puglia, casa vacanze bambini puglia, villa lusso salento mare, affitto settimanale puglia, vacanze gruppo amici salento, vacanze estate salento, casa vacanze agosto puglia, weekend romantico salento, vacanze pasqua puglia, ferragosto salento appartamenti, vacanze ponte maggio puglia, alternativa airbnb salento, booking villa puglia, vrbo salento appartamenti",
  ogTitle,
  ogDescription,
  ogImage = "https://www.villamareblu.it/images/hero/hero.jpg",
  canonicalUrl,
  structuredData
}) => {
  const siteUrl = "https://www.villamareblu.it";
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Villa MareBlu" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="language" content="it-IT" />
      <meta name="geo.region" content="IT-75" />
      <meta name="geo.placename" content="Torre Vado, Salento, Puglia" />
      <meta name="geo.position" content="39.823534;18.292820" />
      <meta name="ICBM" content="39.823534, 18.292820" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="business.business" />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content="Villa MareBlu" />
      <meta property="og:locale" content="it_IT" />
      <meta property="business:contact_data:street_address" content="Via Marco Polo 112" />
      <meta property="business:contact_data:locality" content="Patù" />
      <meta property="business:contact_data:region" content="Lecce" />
      <meta property="business:contact_data:postal_code" content="73053" />
      <meta property="business:contact_data:country_name" content="Italia" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@VillaMareBlu" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#0f4c75" />
      <meta name="msapplication-TileColor" content="#0f4c75" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://images.unsplash.com" />
    </Helmet>
  );
};

export default SEOHead;
