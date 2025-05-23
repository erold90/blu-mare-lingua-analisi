
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
  
  try {
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
    console.log("🔍 RequestQuotePage: Form values:", form.getValues());

    // Render current step content
    const renderStepContent = () => {
      try {
        switch (step) {
          case 1:
            console.log("🔍 RequestQuotePage: Rendering GuestInfoStep");
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
            console.log("🔍 RequestQuotePage: Rendering DateSelectionStep");
            return (
              <DateSelectionStep
                form={form}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            );
          case 3:
            console.log("🔍 RequestQuotePage: Rendering ApartmentSelectionStep");
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
            console.log("🔍 RequestQuotePage: Rendering ServicesStep");
            console.log("🔍 RequestQuotePage: Apartments data:", apartments);
            return (
              <ServicesStep
                form={form}
                prevStep={prevStep}
                nextStep={nextStep}
                apartments={apartments}
              />
            );
          case 5:
            console.log("🔍 RequestQuotePage: Rendering SummaryStep");
            return (
              <SummaryStep
                form={form}
                apartments={apartments}
                prevStep={prevStep}
                sendWhatsApp={sendWhatsApp}
              />
            );
          default:
            console.error("❌ RequestQuotePage: Unknown step:", step);
            return (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                  <p className="text-red-500">Errore: Step non riconosciuto ({step})</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    Ricarica pagina
                  </button>
                </CardContent>
              </Card>
            );
        }
      } catch (error) {
        console.error("❌ RequestQuotePage: Error rendering step content:", error);
        return (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-red-500">Errore nel rendering dello step {step}</p>
              <p className="text-sm text-gray-500 mt-2">Controlla la console per maggiori dettagli</p>
              <button onClick={prevStep} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Torna indietro
              </button>
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
  } catch (error) {
    console.error("❌ RequestQuotePage: Critical error:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Errore nell'applicazione</h2>
            <p className="text-gray-600 mb-4">Si è verificato un errore imprevisto</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ricarica pagina
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default RequestQuotePage;
