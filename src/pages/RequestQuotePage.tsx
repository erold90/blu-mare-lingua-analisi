
import React from "react";

// Components
import GuestInfoStep from "@/components/quote/GuestInfoStep";
import DateSelectionStep from "@/components/quote/DateSelectionStep";
import ApartmentSelectionStep from "@/components/quote/ApartmentSelectionStep";
import ServicesStep from "@/components/quote/ServicesStep";
import SummaryStep from "@/components/quote/SummaryStep";
import ContactStep from "@/components/quote/ContactStep";
import GroupDialog from "@/components/quote/GroupDialog";
import ApartmentDialog from "@/components/quote/ApartmentDialog";
import ProgressBar from "@/components/quote/ProgressBar";
import { Form } from "@/components/ui/form";

// Utils and Data
import { apartments } from "@/data/apartments";
import { useQuoteForm } from "@/hooks/useQuoteForm";

interface FamilyGroup {
  adults: number;
  children: number;
  childrenDetails: { isUnder12: boolean; sleepsWithParents: boolean; sleepsInCrib: boolean; }[];
}

const RequestQuotePage = () => {
  const {
    form,
    step,
    totalSteps,
    childrenArray,
    apartmentDialog,
    groupDialog,
    familyGroups,
    incrementAdults,
    decrementAdults,
    incrementChildren,
    decrementChildren,
    updateChildDetails,
    nextStep,
    prevStep,
    openApartmentDialog,
    closeApartmentDialog,
    selectApartment,
    openGroupDialog,
    closeGroupDialog,
    setFamilyGroups,
    downloadQuote,
    sendWhatsApp,
    onSubmitHandler,
    handleSubmitWrapper
  } = useQuoteForm();
  
  // Adapter function to ensure type compatibility
  const handleFamilyGroupsChange = (groups: FamilyGroup[]) => {
    setFamilyGroups(groups as any);
  };
  
  return (
    <div className="container px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Richiedi un Preventivo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Compila il form per ricevere un preventivo personalizzato per il tuo soggiorno a Villa MareBlu.
        </p>
      </div>
      
      {/* Progress bar */}
      <ProgressBar step={step} totalSteps={totalSteps} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
          {/* STEP 1: Informazioni sugli ospiti */}
          {step === 1 && (
            <GuestInfoStep 
              form={form}
              childrenArray={childrenArray}
              openGroupDialog={openGroupDialog}
              incrementAdults={incrementAdults}
              decrementAdults={decrementAdults}
              incrementChildren={incrementChildren}
              decrementChildren={decrementChildren}
              updateChildDetails={updateChildDetails}
              nextStep={nextStep}
            />
          )}
          
          {/* STEP 2: Selezione date */}
          {step === 2 && (
            <DateSelectionStep 
              form={form}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
          
          {/* STEP 3: Selezione appartamento */}
          {step === 3 && (
            <ApartmentSelectionStep 
              form={form}
              apartments={apartments}
              openApartmentDialog={openApartmentDialog}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
          
          {/* STEP 4: Servizi extra */}
          {step === 4 && (
            <ServicesStep 
              form={form}
              prevStep={prevStep}
              nextStep={nextStep}
              apartments={apartments}
            />
          )}
          
          {/* STEP 5: Riepilogo e calcolo finale */}
          {step === 5 && (
            <SummaryStep 
              form={form}
              apartments={apartments}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )}
          
          {/* STEP 6: Finalizzazione preventivo */}
          {step === 6 && (
            <ContactStep 
              form={form}
              apartments={apartments}
              prevStep={prevStep}
              onSubmit={handleSubmitWrapper}
              downloadQuote={downloadQuote}
              sendWhatsApp={sendWhatsApp}
            />
          )}
        </form>
      </Form>
      
      {/* Dialog per i dettagli dell'appartamento */}
      <ApartmentDialog
        apartmentId={apartmentDialog}
        apartments={apartments}
        onOpenChange={closeApartmentDialog}
        onSelect={selectApartment}
      />
      
      {/* Dialog per la composizione del gruppo */}
      <GroupDialog
        open={groupDialog}
        onOpenChange={closeGroupDialog}
        familyGroups={familyGroups as FamilyGroup[]}
        groupType={form.getValues("groupType")}
        onGroupTypeChange={(value) => form.setValue("groupType", value)}
        onFamilyGroupsChange={handleFamilyGroupsChange}
        onConfirm={closeGroupDialog}
        onCancel={() => {
          closeGroupDialog();
          form.setValue("isGroupBooking", false);
        }}
      />
    </div>
  );
};

export default RequestQuotePage;
