
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { apartments } from "@/data/apartments";
import { Users, Bed, Bath, MapPin, Star, Wifi, Car, UtensilsCrossed } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { getApartmentSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";
import { useApartmentManagement } from "@/hooks/apartments/useApartmentManagement";

const ApartmentsPage = () => {
  const { apartments: managedApartments } = useApartmentManagement();

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Appartamenti", url: "/appartamenti" }
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbItems),
    ...managedApartments.map(apt => getApartmentSchema(apt))
  ];

  return (
    <div className="container px-4 py-8 md:py-12">
      <SEOHead
        title="Appartamenti Vacanze Vista Mare Salento - Villa MareBlu Puglia | Casa Vacanze Sul Mare"
        description="Scopri i nostri appartamenti vacanze lusso con vista mare in Salento: villa fronte mare, giardino, 4-8 persone. Appartamenti ammobiliati Puglia, Santa Maria di Leuca. Prenota ora!"
        keywords={getPageSpecificKeywords('apartments')}
        canonicalUrl="/appartamenti"
        structuredData={structuredData}
        ogTitle="Appartamenti Vacanze Vista Mare Salento - Villa MareBlu"
        ogDescription="Appartamenti vacanze lusso con vista mare in Salento. La tua casa vacanze fronte mare ideale in Puglia!"
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-6 text-primary">
          Appartamenti Vacanze Vista Mare Salento
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Scopri i nostri eleganti appartamenti con vista mare in Salento, Puglia. Ogni appartamento è stato progettato 
          per offrirti il massimo comfort e una vista mozzafiato sul mare cristallino.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {managedApartments.map((apartment) => (
          <Card key={apartment.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-64 md:h-80">
              <img
                src={apartment.images && apartment.images.length > 0 ? apartment.images[0] : "/placeholder.svg"}
                alt={`${apartment.name} - Appartamento vacanze Salento con vista mare`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Lusso
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  Torre Vado
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-2xl">{apartment.name}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {apartment.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Caratteristiche principali */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{apartment.capacity} ospiti</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bed className="h-4 w-4 text-primary" />
                  <span>{apartment.bedrooms} camere</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bath className="h-4 w-4 text-primary" />
                  <span>1 bagno</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">🏊‍♂️</span>
                  <span>Piscina</span>
                </div>
              </div>

              {/* Servizi inclusi */}
              <div>
                <h4 className="font-semibold mb-3">Servizi inclusi:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span>Wi-Fi gratuito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-green-600" />
                    <span>Parcheggio privato</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-green-600" />
                    <span>Cucina attrezzata</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">❄️</span>
                    <span>Aria condizionata</span>
                  </div>
                </div>
              </div>

              {/* Prezzo e azione */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">A partire da</p>
                  <p className="text-2xl font-bold text-primary">€{apartment.price}</p>
                  <p className="text-sm text-muted-foreground">per notte</p>
                </div>
                <Link to="/preventivo">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Richiedi Preventivo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sezione informazioni aggiuntive */}
      <div className="mt-16 bg-primary/5 p-8 rounded-lg">
        <h2 className="text-3xl font-serif font-semibold mb-6 text-center text-primary">
          Perché Scegliere Villa MareBlu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🏖️</div>
            <h3 className="text-xl font-semibold mb-3">Posizione Privilegiata</h3>
            <p className="text-muted-foreground">
              A soli 100 metri dalle splendide spiagge di Torre Vado, nel cuore del Salento
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold mb-3">Servizi di Lusso</h3>
            <p className="text-muted-foreground">
              Piscina privata, giardino mediterraneo e tutti i comfort per una vacanza perfetta
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Esperienza Personalizzata</h3>
            <p className="text-muted-foreground">
              Staff dedicato e servizi su misura per rendere unica la tua vacanza in Puglia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentsPage;
