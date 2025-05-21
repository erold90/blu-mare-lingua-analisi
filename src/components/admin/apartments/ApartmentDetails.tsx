
import * as React from "react";
import { Bed, Home } from "lucide-react";
import { Apartment } from "@/data/apartments";

interface ApartmentDetailsProps {
  apartment: Apartment;
}

export const ApartmentDetails: React.FC<ApartmentDetailsProps> = ({ apartment }) => {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <div className="col-span-2 sm:col-span-1">
        <div className="flex items-center gap-2">
          <Bed className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Capacità</span>
        </div>
        <p className="text-lg">{apartment.capacity} persone</p>
      </div>
      
      <div className="col-span-2 sm:col-span-1">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Piano</span>
        </div>
        <p className="text-lg">{apartment.floor}</p>
      </div>
      
      <div className="col-span-2 sm:col-span-1">
        <span className="text-sm font-medium">Vista</span>
        <p className="text-lg">{apartment.view}</p>
      </div>
      
      <div className="col-span-2 sm:col-span-1">
        <span className="text-sm font-medium">Dimensione</span>
        <p className="text-lg">{apartment.size} m²</p>
      </div>
      
      <div className="col-span-2 sm:col-span-1">
        <span className="text-sm font-medium">Prezzo base</span>
        <p className="text-lg">{apartment.price}€ / notte</p>
      </div>
      
      <div className="col-span-2 sm:col-span-1">
        <span className="text-sm font-medium">Camere</span>
        <p className="text-lg">{apartment.bedrooms || 1}</p>
      </div>
      
      <div className="col-span-2 sm:col-span-1">
        <span className="text-sm font-medium">Posti letto</span>
        <p className="text-lg">{apartment.beds || apartment.capacity}</p>
      </div>
      
      <div className="col-span-2 sm:col-span-1">
        <span className="text-sm font-medium">Servizi</span>
        <p className="text-lg">{apartment.services?.length || 0} servizi</p>
      </div>
      
      {apartment.CIN && (
        <div className="col-span-2">
          <span className="text-sm font-medium">CIN</span>
          <p className="text-lg break-all">{apartment.CIN}</p>
        </div>
      )}
    </div>
  );
};
