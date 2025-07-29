import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Home, Eye } from 'lucide-react';

interface ApartmentCardProps {
  apartment: {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    bedrooms?: number;
    view?: string;
  };
  mainImage?: string;
  onDetailsClick?: () => void;
}

export default function ApartmentCard({ apartment, mainImage, onDetailsClick }: ApartmentCardProps) {
  return (
    <Card 
      className="group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-0 shadow-lg bg-card"
      onClick={onDetailsClick}
    >
      {mainImage && (
        <div className="relative h-64 overflow-hidden">
          <img 
            src={mainImage} 
            alt={apartment.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Elegant overlay badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
              <Users className="w-3 h-3 mr-1" />
              {apartment.capacity} ospiti
            </Badge>
          </div>
        </div>
      )}
      
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
            {apartment.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {apartment.description || 'Descrizione non disponibile'}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {apartment.bedrooms && (
              <div className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>{apartment.bedrooms} camere</span>
              </div>
            )}
            {apartment.view && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span className="capitalize">{apartment.view}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-center text-muted-foreground uppercase tracking-wide font-medium">
            Clicca per dettagli
          </p>
        </div>
      </CardContent>
    </Card>
  );
}