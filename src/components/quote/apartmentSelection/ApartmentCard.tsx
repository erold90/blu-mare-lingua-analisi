
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Apartment } from "@/data/apartments";
import { Bed, BedDouble, MapPin, Sun, ThermometerSun } from "lucide-react";
import { ApartmentDialog } from "@/components/quote/ApartmentDialog";

interface ApartmentCardProps {
  apartment: Apartment & { booked?: boolean };
  isSelected: boolean;
  toggleSelection: (apartmentId: string) => void;
  openDetailsDialog: (id: string) => void;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  isSelected,
  toggleSelection,
  openDetailsDialog
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isBooked = !!apartment.booked;

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
    openDetailsDialog(apartment.id);
  };

  return (
    <>
      <div 
        key={apartment.id} 
        className={cn(
          "border rounded-lg p-3 relative w-full",
          isSelected ? "border-primary border-2" : "",
          isBooked ? "opacity-60" : "cursor-pointer transition-all hover:border-primary",
        )}
      >
        {isBooked && (
          <Badge variant="destructive" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm z-30">
            Prenotato
          </Badge>
        )}
        
        <h3 className="font-medium mt-2 text-sm md:text-base flex flex-nowrap items-center text-balance max-w-full">
          <span className="mr-1">Appartamento</span>
          <span>{apartment.name.split(' ')[1]}</span>
        </h3>
        
        {/* Posti letto - con enfasi ridotta */}
        <div className="mt-2 mb-2 bg-primary/5 p-1 rounded-md w-full">
          <div className="flex items-center">
            <Bed className="h-4 w-4 text-primary shrink-0 mr-1" />
            <span className="text-sm text-primary text-balance w-full">
              {apartment.beds} posti letto
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-1 text-xs mt-2 w-full max-w-full">
          <div className="flex items-center gap-1 text-balance">
            <BedDouble className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-balance">{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
          </div>
          <div className="flex items-center gap-1 text-balance">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-balance">Piano {apartment.floor}</span>
          </div>
          
          {/* Terrazza/veranda */}
          <div className="flex items-center gap-1 text-balance">
            <Sun className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-balance">
              {apartment.hasVeranda ? 'Ampia Veranda' : apartment.hasTerrace ? 'Terrazza Vista Mare' : ''}
            </span>
          </div>
          
          {/* Climatizzatore */}
          <div className="flex items-center gap-1 text-balance">
            <ThermometerSun className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-balance">{apartment.hasAirConditioning ? 'Climatizzatore' : 'Non Climatizzato'}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Button 
            type="button" 
            variant="link" 
            className="text-primary p-0 h-auto text-xs z-20" 
            onClick={handleDetailsClick}
          >
            Dettagli
          </Button>
          
          {!isBooked && (
            <Checkbox 
              id={`apartment-checkbox-${apartment.id}`}
              checked={isSelected}
              onCheckedChange={() => toggleSelection(apartment.id)}
              className="cursor-pointer z-20"
            />
          )}
        </div>
        
        {/* Overlay for booked apartments to prevent interactions */}
        {isBooked && (
          <div className="absolute inset-0 bg-gray-100/40 z-10 rounded-lg" />
        )}
        
        {/* Create a clickable overlay for the entire card */}
        {!isBooked && (
          <div 
            className="absolute inset-0 z-10 cursor-pointer" 
            onClick={() => toggleSelection(apartment.id)}
          />
        )}
      </div>

      {/* Apartment Dialog */}
      <ApartmentDialog
        apartment={apartment}
        isSelected={isSelected}
        onToggle={() => {}}
        onClose={() => setIsDialogOpen(false)}
        isOpen={isDialogOpen}
      />
    </>
  );
};

export default ApartmentCard;
