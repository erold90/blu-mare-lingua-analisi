
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuoteForm } from "@/hooks/useQuoteForm";
import { apartments } from "@/data/apartments";

// Import step components
import GuestInfoStep from "@/components/quote/GuestInfoStep";
import DateSelectionStep from "@/components/quote/DateSelectionStep";
import ApartmentSelectionStep from "@/components/quote/ApartmentSelectionStep";
import ServicesStep from "@/components/quote/ServicesStep";
import SummaryStep from "@/components/quote/summary/SummaryStep";

// Import dialog components - fix the import for ApartmentDialog
import { ApartmentDialog } from "@/components/quote/ApartmentDialog";
import GroupDialog from "@/components/quote/GroupDialog";
import ProgressBar from "@/components/quote/ProgressBar";

const RequestQuotePage = () => {
  console.log("🔍 RequestQuotePage: Loading quote form page");
  
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

  console.log(`🔍 RequestQuotePage: Current step is ${step}/${totalSteps}`);

  // Render current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
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
        );
      case 2:
        return (
          <DateSelectionStep
            form={form}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
      case 3:
        return (
          <ApartmentSelectionStep
            form={form}
            apartments={apartments}
            openApartmentDialog={openApartmentDialog}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
      case 4:
        return (
          <ServicesStep
            form={form}
            prevStep={prevStep}
            nextStep={nextStep}
            apartments={apartments}
          />
        );
      case 5:
        return (
          <SummaryStep
            form={form}
            apartments={apartments}
            prevStep={prevStep}
            sendWhatsApp={sendWhatsApp}
          />
        );
      default:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-red-500">Errore: Step non riconosciuto</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Richiedi un Preventivo
            </h1>
            <p className="text-xl text-gray-600">
              Compila il form per ricevere il tuo preventivo personalizzato
            </p>
          </div>
          
          {/* Progress Bar - fix the prop name */}
          <div className="mb-8">
            <ProgressBar step={step} totalSteps={totalSteps} />
          </div>
          
          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={form.handleSubmit(handleSubmitWrapper)}>
              {renderStepContent()}
            </form>
          </div>
          
          {/* Dialogs */}
          {apartmentDialog !== null && (
            <ApartmentDialog
              apartment={apartments.find(apt => apt.id === apartmentDialog)!}
              isSelected={form.watch('selectedApartments')?.includes(apartmentDialog) || false}
              onToggle={() => selectApartment(apartmentDialog)}
              onClose={closeApartmentDialog}
            />
          )}
          
          {/* GroupDialog - fix the prop names */}
          <GroupDialog
            open={groupDialog}
            onOpenChange={(open) => open ? openGroupDialog() : closeGroupDialog()}
            familyGroups={familyGroups}
            groupType={form.watch('groupType')}
            onGroupTypeChange={(value) => form.setValue('groupType', value)}
            onFamilyGroupsChange={setFamilyGroups}
            onConfirm={closeGroupDialog}
            onCancel={closeGroupDialog}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestQuotePage;
