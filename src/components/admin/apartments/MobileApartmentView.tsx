
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EditApartmentDialog } from "./EditApartmentDialog";
import { ApartmentDetails } from "./ApartmentDetails";
import { ApartmentImages } from "./ApartmentImages";
import { Apartment } from "@/data/apartments";

interface MobileApartmentViewProps {
  apartment: Apartment;
  onApartmentUpdate: (apartment: Apartment) => void;
  apartmentImages: string[];
  coverImageIndex?: number;
  onImagesChange: (apartmentId: string, images: string[]) => void;
  onCoverImageChange: (apartmentId: string, index: number) => void;
}

export const MobileApartmentView: React.FC<MobileApartmentViewProps> = ({
  apartment,
  onApartmentUpdate,
  apartmentImages,
  coverImageIndex,
  onImagesChange,
  onCoverImageChange,
}) => {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">{apartment.name}</CardTitle>
        <EditApartmentDialog 
          apartment={apartment} 
          onSave={onApartmentUpdate} 
        />
      </CardHeader>
      
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full" defaultValue="details">
          <AccordionItem value="details">
            <AccordionTrigger className="py-2">
              Dettagli appartamento
            </AccordionTrigger>
            <AccordionContent>
              <ApartmentDetails apartment={apartment} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="description">
            <AccordionTrigger className="py-2">
              Descrizione
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>{apartment.description}</p>
                {apartment.longDescription && (
                  <div>
                    <p className="font-medium mt-2">Descrizione completa</p>
                    <p className="text-muted-foreground">{apartment.longDescription}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="images">
            <AccordionTrigger className="py-2">
              Immagini
            </AccordionTrigger>
            <AccordionContent>
              <ApartmentImages
                apartmentId={apartment.id}
                images={apartmentImages}
                coverImageIndex={coverImageIndex}
                onImagesChange={onImagesChange}
                onCoverImageChange={onCoverImageChange}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
