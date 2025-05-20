
import React from "react";
import { Apartment } from "@/data/apartments";
import ApartmentCard from "./ApartmentCard";
import { isApartmentSuitable } from "@/utils/apartmentRecommendation";
import { FormValues } from "@/utils/quoteFormSchema";

interface ApartmentGridProps {
  apartments: (Apartment & { booked?: boolean })[];
  selectedApartmentIds: string[];
  toggleApartmentSelection: (id: string) => void;
  openApartmentDialog: (id: string) => void;
  formValues: FormValues;
}

const ApartmentGrid: React.FC<ApartmentGridProps> = ({
  apartments,
  selectedApartmentIds,
  toggleApartmentSelection,
  openApartmentDialog,
  formValues
}) => {
  // Check if apartment is suitable
  const isSuitable = (apartment: Apartment) => {
    return isApartmentSuitable(apartment, formValues);
  };

  if (apartments.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-muted/50">
        <p className="text-center">
          Non ci sono appartamenti disponibili.
          <br />
          <span className="text-sm text-muted-foreground">
            Prova a modificare le date o il numero di ospiti.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {apartments.map((apartment) => (
        <ApartmentCard 
          key={apartment.id}
          apartment={apartment}
          isSelected={selectedApartmentIds.includes(apartment.id)}
          toggleSelection={toggleApartmentSelection}
          openDetailsDialog={openApartmentDialog}
        />
      ))}
    </div>
  );
};

export default ApartmentGrid;
