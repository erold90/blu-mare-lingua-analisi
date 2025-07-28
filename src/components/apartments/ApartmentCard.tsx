// Apartment card component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApartmentCardProps {
  apartment: {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    price?: number;
  };
  mainImage?: string;
  onDetailsClick?: () => void;
}

export default function ApartmentCard({ apartment, mainImage, onDetailsClick }: ApartmentCardProps) {
  return (
    <Card className="h-full cursor-pointer" onClick={onDetailsClick}>
      {mainImage && (
        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img 
            src={mainImage} 
            alt={apartment.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{apartment.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {apartment.description || 'Descrizione non disponibile'}
        </p>
        <p className="font-medium">
          Ospiti: {apartment.capacity}
        </p>
        {apartment.price && (
          <p className="text-lg font-bold text-primary">
            €{apartment.price}/notte
          </p>
        )}
      </CardContent>
    </Card>
  );
}