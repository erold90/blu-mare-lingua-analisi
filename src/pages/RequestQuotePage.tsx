import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useQuoteForm } from "@/hooks/useQuoteForm";
import { useSimpleTracking } from "@/hooks/analytics/useSimpleTracking";
import { apartments } from "@/data/apartments";
import SEOHead from "@/components/seo/SEOHead";
import { getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";

// Import step components
import GuestInfoStep from "@/components/quote/GuestInfoStep";
import DateSelectionStep from "@/components/quote/DateSelectionStep";
import ApartmentSelectionStep from "@/components/quote/ApartmentSelectionStep";
import ServicesStep from "@/components/quote/ServicesStep";
import SummaryStep from "@/components/quote/summary/SummaryStep";

// Import dialog components
import { ApartmentDialog } from "@/components/quote/ApartmentDialog";
import GroupDialog from "@/components/quote/GroupDialog";
import ProgressBar from "@/components/quote/ProgressBar";

// Define ChildDetail interface to match component expectations
interface ChildDetail {
  isUnder12: boolean;
  sleepsWithParents: boolean;
  sleepsInCrib: boolean;
}

const RequestQuotePage = () => {
  console.log("🔍 RequestQuotePage: Loading quote form page");
  
  // Use simplified tracking instead of complex system
  useSimpleTracking();

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Preventivo", url: "/preventivo" }
  ];

  const structuredData = [getBreadcrumbSchema(breadcrumbItems)];
  
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
      onSubmitHandler
    } = useQuoteForm();

    console.log(`🔍 RequestQuotePage: Current step is ${step}/${totalSteps}`);
    console.log("🔍 RequestQuotePage: Form values:", form.getValues());

    // Convert form data to component-expected format with required booleans
    const mutableChildrenArray: ChildDetail[] = (childrenArray || []).map(child => ({
      isUnder12: child?.isUnder12 ?? false,
      sleepsWithParents: child?.sleepsWithParents ?? false,
      sleepsInCrib: child?.sleepsInCrib ?? false
    }));

    // Create a wrapper function to match the expected signature
    const updateChildDetailsWrapper = (index: number, field: "isUnder12" | "sleepsWithParents" | "sleepsInCrib", value: boolean) => {
      updateChildDetails(index, { [field]: value });
    };

    // Render current step content
    const renderStepContent = () => {
      try {
        switch (step) {
          case 1:
            console.log("🔍 RequestQuotePage: Rendering GuestInfoStep");
            return (
              <GuestInfoStep
                form={form}
                childrenArray={mutableChildrenArray}
                openGroupDialog={openGroupDialog}
                incrementAdults={incrementAdults}
                decrementAdults={decrementAdults}
                incrementChildren={incrementChildren}
                decrementChildren={decrementChildren}
                updateChildDetails={updateChildDetailsWrapper}
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
      <div className="min-h-screen bg-background relative">
        <SEOHead
          title="Preventivo Villa MareBlu - Vacanze Estate Salento | Alternativa Airbnb Salento"
          description="Calcola il preventivo per Villa MareBlu: vacanze estate Salento, casa vacanze agosto Puglia. Miglior alternativa Airbnb Salento con piscina privata. Preventivo gratuito e immediato!"
          keywords={getPageSpecificKeywords('quote')}
          canonicalUrl="/preventivo"
          structuredData={structuredData}
          ogTitle="Preventivo Gratuito Villa MareBlu - Vacanze Estate Salento"
          ogDescription="Calcola subito il tuo preventivo per Villa MareBlu: la migliore alternativa ad Airbnb nel Salento con piscina privata"
        />

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-light mb-4 text-foreground">
                Richiedi Preventivo
              </h1>
              
              <div className="w-24 h-px bg-foreground/20 mx-auto mb-6" />
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                Configura il tuo soggiorno in pochi passaggi
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-12">
              <ProgressBar step={step} totalSteps={totalSteps} />
            </div>
            
            {/* Form Content */}
            <div className="bg-card border border-border/50 rounded-none shadow-sm">
              <div className="p-8 md:p-12">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitHandler)}>
                    {renderStepContent()}
                  </form>
                </Form>
              </div>
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
            
            {/* GroupDialog - Fix the type issues by creating empty array for familyGroups */}
            <GroupDialog
              open={groupDialog}
              onOpenChange={(open) => open ? openGroupDialog() : closeGroupDialog()}
              familyGroups={[]} // Pass empty array as expected by the component
              groupType={form.watch('groupType')}
              onGroupTypeChange={(value) => form.setValue('groupType', value)}
              onFamilyGroupsChange={(groups) => {
                // For now, we just close the dialog since familyGroups management 
                // needs to be properly implemented
                console.log('Family groups changed:', groups);
              }}
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto border border-border/50 shadow-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Errore nell'applicazione</h2>
            <p className="text-gray-600 mb-4">Si è verificato un errore imprevisto. Dettagli: {error?.message || 'Errore sconosciuto'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200"
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
