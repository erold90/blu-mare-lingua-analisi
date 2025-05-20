
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";

interface ApartmentDialogProps {
  apartmentId: string | null;
  apartments: Apartment[];
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
}

const ApartmentDialog: React.FC<ApartmentDialogProps> = ({
  apartmentId,
  apartments,
  onOpenChange,
  onSelect
}) => {
  const apartment = apartments.find(apt => apt.id === apartmentId);
  
  if (!apartment) {
    return null;
  }

  return (
    <Dialog open={!!apartmentId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{apartment.name}</DialogTitle>
          <DialogDescription>
            {apartment.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-md overflow-hidden">
            <img 
              src={apartment.images[0]} 
              alt={apartment.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Capacità:</span>
            <span>{apartment.capacity} persone</span>
            <span className="text-muted-foreground">Dimensione:</span>
            <span>{apartment.size} m²</span>
            <span className="text-muted-foreground">Piano:</span>
            <span>{apartment.floor}</span>
            <span className="text-muted-foreground">Vista:</span>
            <span>{apartment.view}</span>
          </div>
          <div>
            <h4 className="font-medium mb-2">Servizi inclusi:</h4>
            <div className="flex flex-wrap gap-2">
              {apartment.services.map((service, index) => (
                <span key={index} className="text-xs bg-muted px-2 py-1 rounded">{service}</span>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button 
            variant="default" 
            onClick={() => onSelect(apartment.id)}
          >
            Seleziona
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentDialog;
