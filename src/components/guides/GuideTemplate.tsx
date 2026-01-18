import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GuideInfo, guideCategories } from '@/types/guide';
import SEOHead from '@/components/seo/SEOHead';
import { getArticleSchema, getBreadcrumbSchema } from '@/components/seo/StructuredData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Calendar,
  ChevronRight,
  MapPin,
  ArrowRight,
  List,
  Home
} from 'lucide-react';

interface GuideTemplateProps {
  guide: GuideInfo;
}

export const GuideTemplate: React.FC<GuideTemplateProps> = ({ guide }) => {
  const [activeSection, setActiveSection] = useState<string>('');

  // Track scroll position for TOC highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = guide.sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(guide.sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [guide.sections]);

  const category = guideCategories.find(c => c.id === guide.category);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Guide', url: '/guide' },
    { name: guide.title, url: `/guide/${guide.slug}` }
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbItems),
    getArticleSchema(guide)
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${guide.title} | Guida Salento | Villa MareBlu Torre Vado`}
        description={guide.description}
        keywords={guide.keywords.join(', ')}
        canonicalUrl={`/guide/${guide.slug}`}
        structuredData={structuredData}
        ogTitle={guide.title}
        ogDescription={guide.subtitle}
        ogImage={guide.heroImage}
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${guide.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/guide" className="hover:text-white">Guide</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{guide.title}</span>
          </nav>

          {/* Category Badge */}
          {category && (
            <Badge variant="secondary" className="w-fit mb-4 bg-primary/90 text-white">
              {category.name}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">
            {guide.title}
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6">
            {guide.subtitle}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {guide.readingTime} min di lettura
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Aggiornato: {new Date(guide.lastUpdated).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Torre Vado, Salento
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Table of Contents - Sticky Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-muted/50 rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <List className="h-5 w-5" />
                Indice
              </h2>
              <nav className="space-y-2">
                {guide.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-white font-medium'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              {/* Mini CTA in sidebar */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Vuoi soggiornare a Torre Vado?
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link to="/preventivo">
                    Richiedi Preventivo
                  </Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* Article Content */}
          <article className="lg:col-span-3 prose prose-lg max-w-none">
            {guide.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="mb-12 scroll-mt-24"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  {section.title}
                </h2>

                {section.image && (
                  <div className="my-6 rounded-lg overflow-hidden">
                    <img
                      src={section.image}
                      alt={section.imageAlt || section.title}
                      className="w-full h-64 md:h-80 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />

                {section.highlights && section.highlights.length > 0 && (
                  <div className="my-6 bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                    <h4 className="font-semibold mb-2 text-foreground">In breve:</h4>
                    <ul className="space-y-1">
                      {section.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}

            {/* Bottom CTA */}
            <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                {guide.ctaText || 'Prenota la tua vacanza a Torre Vado'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Villa MareBlu offre 4 appartamenti vista mare a soli 100 metri dalla spiaggia.
                Prenota direttamente e risparmia fino al 15% rispetto alle piattaforme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/preventivo" className="flex items-center gap-2">
                    Calcola Preventivo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/appartamenti">
                    Vedi Appartamenti
                  </Link>
                </Button>
              </div>
            </div>

            {/* Related Guides */}
            {guide.relatedGuides && guide.relatedGuides.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-4">Guide Correlate</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guide.relatedGuides.map((slug) => (
                    <Link
                      key={slug}
                      to={`/guide/${slug}`}
                      className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <span className="font-medium capitalize">
                        {slug.replace(/-/g, ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};

export default GuideTemplate;
