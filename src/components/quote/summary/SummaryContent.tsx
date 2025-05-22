
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import DateDurationInfo from "./DateDurationInfo";
import GuestInfo from "./GuestInfo";
import PriceSummary from "./PriceSummary";
import ApartmentList from "./ApartmentList";
import ContactForm from "./ContactForm";
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
    <>
      <div className="grid md:grid-cols-2 gap-5">
        {/* Sezione sinistra: Informazioni soggiorno */}
        <div className="space-y-5">
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-lg font-semibold mb-3">Date del soggiorno</h3>
              <DateDurationInfo 
                checkIn={formValues.checkIn}
                checkOut={formValues.checkOut}
                nights={priceInfo.nights}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-lg font-semibold mb-3">Ospiti</h3>
              <GuestInfo formValues={formValues} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sezione destra: Appartamenti e prezzi */}
        <div className="space-y-5">
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-lg font-semibold mb-3">Appartamenti selezionati</h3>
              <ApartmentList
                apartments={apartments}
                selectedApartments={selectedApartments}
                formValues={formValues}
                priceInfo={priceInfo}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-5">
              <PriceSummary 
                priceInfo={priceInfo}
                formValues={formValues}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Form per email e telefono */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <ContactForm formValues={formValues} form={form} />
        </CardContent>
      </Card>
    </>
  );
};

export default SummaryContent;
