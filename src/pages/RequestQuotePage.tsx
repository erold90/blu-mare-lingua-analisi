
import React, { useEffect } from "react";

// Components
import GuestInfoStep from "@/components/quote/GuestInfoStep";
import DateSelectionStep from "@/components/quote/DateSelectionStep";
import ApartmentSelectionStep from "@/components/quote/ApartmentSelectionStep";
import ServicesStep from "@/components/quote/ServicesStep";
import SummaryStep from "@/components/quote/summary/SummaryStep";
import GroupDialog from "@/components/quote/GroupDialog";
import { ApartmentDialog } from "@/components/quote/ApartmentDialog";
import ProgressBar from "@/components/quote/ProgressBar";
import { Form } from "@/components/ui/form";

// Utils and Data
import { apartments } from "@/data/apartments";
import { useQuoteForm } from "@/hooks/useQuoteForm";
import { FamilyGroup } from "@/hooks/quote/useGroupManagement";

console.log("🚀 RequestQuotePage: Component file loaded");

const RequestQuotePage = () => {
  console.log("🚀 RequestQuotePage: Component rendering started");
  
  useEffect(() => {
    console.log("RequestQuotePage mounted");
    return () => console.log("RequestQuotePage unmounted");
  }, []);
  
  try {
    console.log("🔍 Initializing useQuoteForm hook");
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
      sendWhatsApp,
      onSubmitHandler,
      handleSubmitWrapper
    } = useQuoteForm();
    
    console.log("✅ RequestQuotePage: useQuoteForm hook executed successfully");
    console.log("📊 RequestQuotePage: Current step:", step);
    
    // Adapter function to ensure type compatibility
    const handleFamilyGroupsChange = (groups: FamilyGroup[]) => {
      setFamilyGroups(groups as any);
    };

    // Find the apartment object for the dialog
    const selectedApartmentForDialog = apartmentDialog ? apartments.find(apt => apt.id === apartmentDialog) : null;
    
    console.log("🏠 RequestQuotePage: Apartments data loaded, count:", apartments.length);
    console.log("🚀 RequestQuotePage: About to render JSX");
    
    return (
      <div className="bg-gradient-to-b from-white to-secondary/30 min-h-screen">
        <div className="container px-4 py-12 md:py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-primary">Richiedi un Preventivo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compila il form per ricevere un preventivo personalizzato per il tuo soggiorno.
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="max-w-3xl mx-auto mb-8">
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
                  sendWhatsApp={sendWhatsApp}
                />
              )}
            </form>
          </Form>
          
          {/* Dialog per i dettagli dell'appartamento */}
          {selectedApartmentForDialog && (
            <ApartmentDialog
              apartment={selectedApartmentForDialog}
              isSelected={form.getValues("selectedApartments")?.includes(selectedApartmentForDialog.id) || false}
              onToggle={() => selectApartment(selectedApartmentForDialog.id)}
              onClose={closeApartmentDialog}
            />
          )}
          
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
  } catch (error) {
    console.error("❌ RequestQuotePage: Error during rendering:", error);
    return (
      <div className="bg-gradient-to-b from-white to-secondary/30 min-h-screen">
        <div className="container px-4 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-red-600">Errore</h1>
            <p className="text-lg text-muted-foreground">
              Si è verificato un errore nel caricamento della pagina. Controlla la console per maggiori dettagli.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default RequestQuotePage;
