
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
  return (
    <div className="space-y-6">
      {/* Desktop layout: two columns */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Date info section */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3 text-primary">Date del soggiorno</h3>
            <DateDurationInfo 
              checkIn={formValues.checkIn}
              checkOut={formValues.checkOut}
              nights={priceInfo.nights}
            />
          </div>
          
          {/* Guest info section */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3 text-primary">Informazioni ospiti</h3>
            <GuestInfo formValues={formValues} />
          </div>
        </div>
        
        {/* Right column: Apartments and pricing */}
        <div className="space-y-6">
          {/* Apartments section */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3 text-primary">Appartamenti selezionati</h3>
            <Card className="overflow-hidden border bg-white">
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
            <h3 className="font-serif text-lg font-semibold mb-3 text-primary">Riepilogo prezzi</h3>
            <Card className="overflow-hidden border bg-white shadow-sm">
              <CardContent className="p-4">
                <PriceSummary 
                  priceInfo={priceInfo}
                  formValues={formValues}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryContent;
