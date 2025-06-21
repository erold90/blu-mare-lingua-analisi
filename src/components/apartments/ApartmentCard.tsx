
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Bed, Bath, Wifi, Car, UtensilsCrossed } from "lucide-react";
import { Apartment } from "@/data/apartments";

interface ApartmentCardProps {
  apartment: Apartment;
  mainImage: string;
  onDetailsClick: () => void;
}

export const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  mainImage,
  onDetailsClick
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-64 md:h-80">
        <img
          src={mainImage}
          alt={`${apartment.name} - Appartamento vacanze Salento con vista mare`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            console.log(`🖼️ Image failed to load for ${apartment.name}, using placeholder`);
            e.currentTarget.src = "/placeholder.svg";
          }}
          onLoad={() => {
            console.log(`✅ Image loaded successfully for ${apartment.name}`);
          }}
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-primary text-white">
            <Bed className="h-3 w-3 mr-1" />
            {apartment.beds || apartment.capacity} posti letto
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
        {/* Main features */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        </div>

        {/* Included services */}
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onDetailsClick}
            >
              Dettagli
            </Button>
            <Link to="/preventivo">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Richiedi Preventivo
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
