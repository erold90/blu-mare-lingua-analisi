
import React from "react";
import { apartments } from "@/data/apartments";
import { ApartmentCard } from "./ApartmentCard";

interface ApartmentGridProps {
  apartmentImages: { [key: string]: string[] };
  onApartmentDetailsClick: (apartmentId: string) => void;
}

export const ApartmentGrid: React.FC<ApartmentGridProps> = ({
  apartmentImages,
  onApartmentDetailsClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {apartments.map((apartment) => {
        const images = apartmentImages[apartment.id] || ["/placeholder.svg"];
        const mainImage = images[0] || "/placeholder.svg";
        
        return (
          <ApartmentCard
            key={apartment.id}
            apartment={apartment}
            mainImage={mainImage}
            onDetailsClick={() => onApartmentDetailsClick(apartment.id)}
          />
        );
      })}
    </div>
  );
};
