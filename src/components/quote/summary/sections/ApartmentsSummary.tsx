
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Bed, Users, Check, Dog } from "lucide-react";

interface ApartmentsSummaryProps {
  selectedApartments: Apartment[];
  formValues: FormValues;
}

const ApartmentsSummary: React.FC<ApartmentsSummaryProps> = ({ 
  selectedApartments, 
  formValues 
}) => {
  const hasLinen = formValues.needsLinen;
  const hasPets = formValues.hasPets;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Home className="h-5 w-5 text-primary" />
          Appartamenti selezionati
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedApartments.map((apartment, index) => (
          <div key={apartment.id} className="border rounded-lg p-4 space-y-3">
            {/* Apartment header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">{apartment.name}</h4>
              <Badge variant="outline" className="font-semibold">
                €{apartment.price || 0}
              </Badge>
            </div>
            
            {/* Apartment details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>Posti letto: {apartment.beds || apartment.capacity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Capacità: {apartment.capacity} persone</span>
              </div>
            </div>
            
            {/* Services */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Servizi inclusi:
              </div>
              <div className="grid grid-cols-1 gap-1 text-sm">
                {hasLinen && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Check className="h-3 w-3" />
                    <span>Biancheria: €15 a persona</span>
                  </div>
                )}
                
                {hasPets && selectedApartments.length === 1 && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Dog className="h-3 w-3" />
                    <span>Animali domestici: €50</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-3 w-3" />
                  <span>Pulizia finale: €50 (inclusa)</span>
                </div>
                
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-3 w-3" />
                  <span>Tassa di soggiorno: €2/persona/notte (inclusa)</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ApartmentsSummary;
