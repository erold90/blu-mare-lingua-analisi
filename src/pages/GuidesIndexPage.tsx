import React from 'react';
import { Link } from 'react-router-dom';
import { allGuides } from '@/data/guides';
import { guideCategories } from '@/types/guide';
import SEOHead from '@/components/seo/SEOHead';
import { getBreadcrumbSchema, getGuidesListSchema } from '@/components/seo/StructuredData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  ArrowRight,
  MapPin,
  Waves,
  Compass,
  Utensils,
  Info,
  Map
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  spiagge: <Waves className="h-5 w-5" />,
  attivita: <Compass className="h-5 w-5" />,
  gastronomia: <Utensils className="h-5 w-5" />,
  pratico: <Info className="h-5 w-5" />,
  itinerari: <Map className="h-5 w-5" />,
};

const GuidesIndexPage: React.FC = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Guide', url: '/guide' }
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbItems),
    getGuidesListSchema(allGuides)
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Guide Turistiche Salento | Spiagge, Ristoranti, Cosa Fare | Villa MareBlu Torre Vado"
        description="Guide complete per la tua vacanza nel Salento: le migliori spiagge vicino Torre Vado, dove mangiare, cosa fare, come arrivare. Consigli da local per vivere il vero Salento."
        keywords="guide salento, spiagge torre vado, cosa fare salento, ristoranti salento, come arrivare torre vado, vacanza salento, guida turistica salento"
        canonicalUrl="/guide"
        structuredData={structuredData}
        ogTitle="Guide Turistiche Salento - Villa MareBlu"
        ogDescription="Tutto quello che devi sapere per la tua vacanza nel Salento. Spiagge, ristoranti, attività e consigli pratici."
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <MapPin className="h-3 w-3 mr-1" />
            Torre Vado, Salento
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Guide Turistiche del Salento
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Tutto quello che devi sapere per vivere una vacanza indimenticabile nel Salento sud.
            Consigli da local, scritti da chi vive qui tutto l'anno.
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {guideCategories.map((cat) => (
              <Badge key={cat.id} variant="outline" className="px-4 py-2">
                {categoryIcons[cat.id]}
                <span className="ml-2">{cat.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGuides.map((guide) => {
            const category = guideCategories.find(c => c.id === guide.category);
            return (
              <Link
                key={guide.slug}
                to={`/guide/${guide.slug}`}
                className="group block"
              >
                <article className="h-full border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-card">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={guide.heroImage}
                      alt={guide.heroImageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary/90">
                        {categoryIcons[guide.category]}
                        <span className="ml-1">{category?.name}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {guide.title}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {guide.subtitle}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {guide.readingTime} min
                      </span>
                      <span className="flex items-center gap-1 text-primary font-medium group-hover:underline">
                        Leggi guida
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto per la tua vacanza nel Salento?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Villa MareBlu ti aspetta a Torre Vado, a 100 metri dal mare.
            4 appartamenti vista mare, prenota direttamente e risparmia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/preventivo">
                Richiedi Preventivo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/appartamenti">
                Vedi Appartamenti
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesIndexPage;
