
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EditApartmentDialog } from "./EditApartmentDialog";
import { ApartmentImages } from "./ApartmentImages";
import { Apartment } from "@/data/apartments";

interface DesktopApartmentViewProps {
  apartments: Apartment[];
  selectedApartment: Apartment | null;
  onApartmentSelect: (apartment: Apartment) => void;
  onApartmentUpdate: (apartment: Apartment) => void;
  apartmentImages: { [key: string]: string[] };
  coverImage: { [key: string]: number };
  onImagesChange: (apartmentId: string, images: string[]) => void;
  onCoverImageChange: (apartmentId: string, index: number) => void;
}

export const DesktopApartmentView: React.FC<DesktopApartmentViewProps> = ({
  apartments,
  selectedApartment,
  onApartmentSelect,
  onApartmentUpdate,
  apartmentImages,
  coverImage,
  onImagesChange,
  onCoverImageChange,
}) => {
  return (
    <Tabs defaultValue={apartments[0]?.id || "default"}>
      <TabsList className="mb-4">
        {apartments.map(apartment => (
          <TabsTrigger 
            key={apartment.id}
            value={apartment.id}
            onClick={() => onApartmentSelect(apartment)}
          >
            {apartment.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {apartments.map(apartment => (
        <TabsContent key={apartment.id} value={apartment.id} className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{apartment.name}</CardTitle>
              <EditApartmentDialog 
                apartment={apartment}
                onSave={onApartmentUpdate}
              />
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Dettagli appartamento</h3>
                  <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Capacità</dt>
                      <dd>{apartment.capacity} persone</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Piano</dt>
                      <dd>{apartment.floor}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Vista</dt>
                      <dd>{apartment.view}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Dimensione</dt>
                      <dd>{apartment.size} m²</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Prezzo base</dt>
                      <dd>{apartment.price}€ / notte</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">CIN</dt>
                      <dd>{apartment.CIN || 'Non specificato'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Camere</dt>
                      <dd>{apartment.bedrooms || 1}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Posti letto</dt>
                      <dd>{apartment.beds || apartment.capacity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-normal text-muted-foreground">Servizi</dt>
                      <dd>{apartment.services?.length || 0} servizi</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Descrizione</h3>
                  <p className="text-sm text-muted-foreground">{apartment.description}</p>
                  {apartment.longDescription && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">Descrizione completa</h4>
                      <p className="text-sm text-muted-foreground mt-1">{apartment.longDescription}</p>
                    </div>
                  )}
                </div>
                
                <ApartmentImages
                  apartmentId={apartment.id}
                  images={apartmentImages[apartment.id] || []}
                  coverImageIndex={coverImage[apartment.id]}
                  onImagesChange={onImagesChange}
                  onCoverImageChange={onCoverImageChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};
