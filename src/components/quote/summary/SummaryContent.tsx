
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import DateDurationInfo from "./DateDurationInfo";
import GuestInfo from "./GuestInfo";
import PriceSummary from "./PriceSummary";
import ApartmentList from "./ApartmentList";
import { UseFormReturn } from "react-hook-form";

interface SummaryContentProps {
  formValues: FormValues;
  priceInfo: PriceCalculation;
  selectedApartments: Apartment[];
  apartments: Apartment[];
  form: UseFormReturn<FormValues>;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  formValues,
  priceInfo,
  selectedApartments,
  apartments,
  form
}) => {
  // Convert string dates to Date objects for components that expect them
  const checkInDate = typeof formValues.checkIn === 'string' ? new Date(formValues.checkIn) : formValues.checkIn;
  const checkOutDate = typeof formValues.checkOut === 'string' ? new Date(formValues.checkOut) : formValues.checkOut;

  return (
    <div className="space-y-6">
      {/* Mobile: single column layout with better spacing */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Date info section */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Date del soggiorno</h3>
            <DateDurationInfo 
              checkIn={checkInDate}
              checkOut={checkOutDate}
              nights={priceInfo.nights}
            />
          </div>
          
          {/* Guest info section */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Informazioni ospiti</h3>
            <GuestInfo formValues={formValues} />
          </div>
          
          {/* Apartments section - moved here for better mobile flow */}
          <div className="lg:hidden">
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Appartamenti selezionati</h3>
            <Card className="overflow-hidden border bg-white shadow-sm">
              <CardContent className="p-0">
                <ApartmentList
                  apartments={apartments}
                  selectedApartments={selectedApartments}
                  formValues={formValues}
                  priceInfo={priceInfo}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right column: Apartments (desktop) and pricing */}
        <div className="space-y-6">
          {/* Apartments section - desktop only */}
          <div className="hidden lg:block">
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Appartamenti selezionati</h3>
            <Card className="overflow-hidden border bg-white shadow-sm">
              <CardContent className="p-0">
                <ApartmentList
                  apartments={apartments}
                  selectedApartments={selectedApartments}
                  formValues={formValues}
                  priceInfo={priceInfo}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Price summary section */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Riepilogo prezzi</h3>
            <PriceSummary 
              priceInfo={priceInfo}
              formValues={formValues}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryContent;
