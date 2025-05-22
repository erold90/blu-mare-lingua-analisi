
import React from "react";

// Components
import GuestInfoStep from "@/components/quote/GuestInfoStep";
import DateSelectionStep from "@/components/quote/DateSelectionStep";
import ApartmentSelectionStep from "@/components/quote/ApartmentSelectionStep";
import ServicesStep from "@/components/quote/ServicesStep";
import SummaryStep from "@/components/quote/summary/SummaryStep";
import GroupDialog from "@/components/quote/GroupDialog";
import ApartmentDialog from "@/components/quote/ApartmentDialog";
import ProgressBar from "@/components/quote/ProgressBar";
import { Form } from "@/components/ui/form";

// Utils and Data
import { apartments } from "@/data/apartments";
import { useQuoteForm } from "@/hooks/useQuoteForm";
import { FamilyGroup } from "@/hooks/quote/useGroupManagement";

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
    <div className="bg-gray-50 min-h-screen">
      <div className="container px-4 py-8 md:py-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Richiedi un Preventivo</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Compila il form per ricevere un preventivo personalizzato per il tuo soggiorno.
          </p>
        </div>
        
        {/* Progress bar - more compact */}
        <div className="max-w-3xl mx-auto mb-6">
          <ProgressBar step={step} totalSteps={totalSteps} />
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6 mb-16">
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
            
            {/* STEP 5: Riepilogo finale con azioni */}
            {step === 5 && (
              <SummaryStep 
                form={form}
                apartments={apartments}
                prevStep={prevStep}
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
    </div>
  );
};

export default RequestQuotePage;
