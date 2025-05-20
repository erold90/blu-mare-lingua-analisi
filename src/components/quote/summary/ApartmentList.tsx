
import React from "react";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";

interface ApartmentListProps {
  apartments: Apartment[];
  selectedApartments: Apartment[];
  formValues: FormValues;
}

const ApartmentList: React.FC<ApartmentListProps> = ({ 
  apartments, 
  selectedApartments, 
  formValues
}) => {
  // Helper to get persons per apartment
  const getPersonsInApartment = (apartmentId: string) => {
    if (formValues.personsPerApartment && formValues.personsPerApartment[apartmentId]) {
      return formValues.personsPerApartment[apartmentId];
    }
    return 0;
  };

  // Helper to check if an apartment has pets
  const hasPetsInApartment = (apartmentId: string) => {
    if (formValues.petsInApartment && formValues.petsInApartment[apartmentId]) {
      return true;
    }
    return false;
  };

  return (
    <div className="border rounded-md p-4 space-y-3">
      <h3 className="font-medium">Appartamenti e costi</h3>
      
      {selectedApartments.length > 0 ? (
        <div className="space-y-4">
          {selectedApartments.map((apartment, index) => {
            const personsCount = getPersonsInApartment(apartment.id);
            const hasPets = hasPetsInApartment(apartment.id);
            const isLastItem = index === selectedApartments.length - 1;
            
            // Calcolo del costo base per appartamento
            const baseApartmentCost = apartment.price * (formValues.checkIn && formValues.checkOut ? 
              Math.ceil((formValues.checkOut.getTime() - formValues.checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0);
            
            // Costo biancheria
            const linenCost = formValues.linenOption === "extra" && personsCount > 0 
              ? personsCount * 15 
              : 0;
            
            // Costo animali
            const petsCost = hasPets ? 50 : 0;
            
            // Totale per appartamento
            const apartmentTotal = baseApartmentCost + linenCost + petsCost;
            
            return (
              <div key={apartment.id} className={`pb-4 ${!isLastItem ? 'border-b' : ''}`}>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-md">{apartment.name}</h4>
                    <span className="text-primary font-semibold">{baseApartmentCost}€</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Capacità:</span>
                    <span>{apartment.capacity} persone</span>
                    <span className="text-muted-foreground">Posti letto:</span>
                    <span>{apartment.beds}</span>
                    <span className="text-muted-foreground">Posizione:</span>
                    <span>Piano {apartment.floor}</span>
                    
                    {personsCount > 0 && (
                      <>
                        <span className="text-muted-foreground">Persone:</span>
                        <span>{personsCount}</span>
                      </>
                    )}
                    
                    {hasPets && (
                      <>
                        <span className="text-muted-foreground">Animali:</span>
                        <span>Sì</span>
                      </>
                    )}
                  </div>
                  
                  {/* Costi aggiuntivi per appartamento */}
                  {(linenCost > 0 || petsCost > 0) && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Costi aggiuntivi:</p>
                      {linenCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Biancheria ({personsCount} persone):</span>
                          <span>{linenCost}€</span>
                        </div>
                      )}
                      {petsCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Animali domestici:</span>
                          <span>{petsCost}€</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-medium pt-1">
                        <span>Totale appartamento:</span>
                        <span>{apartmentTotal}€</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nessun appartamento selezionato</p>
      )}
    </div>
  );
};

export default ApartmentList;
