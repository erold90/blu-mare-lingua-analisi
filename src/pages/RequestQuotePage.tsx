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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
        <SEOHead
          title="Preventivo Villa MareBlu - Vacanze Estate Salento | Alternativa Airbnb Salento"
          description="Calcola il preventivo per Villa MareBlu: vacanze estate Salento, casa vacanze agosto Puglia. Miglior alternativa Airbnb Salento con piscina privata. Preventivo gratuito e immediato!"
          keywords={getPageSpecificKeywords('quote')}
          canonicalUrl="/preventivo"
          structuredData={structuredData}
          ogTitle="Preventivo Gratuito Villa MareBlu - Vacanze Estate Salento"
          ogDescription="Calcola subito il tuo preventivo per Villa MareBlu: la migliore alternativa ad Airbnb nel Salento con piscina privata"
        />

        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-300/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header with elegant styling */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-serif font-semibold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Calcola Preventivo
                </span>
              </h1>
              
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                Crea il tuo preventivo personalizzato - <span className="font-medium text-primary">nessun impegno</span> - 
                <span className="font-medium text-primary"> prezzi trasparenti e immediati</span>
              </p>
            </div>
            
            {/* Progress Bar with enhanced styling */}
            <div className="mb-12 animate-fade-in animation-delay-300">
              <div className="bg-white/50 backdrop-blur-sm rounded-full p-4 shadow-lg border border-white/20">
                <ProgressBar step={step} totalSteps={totalSteps} />
              </div>
            </div>
            
            {/* Form Content with glass morphism */}
            <div className="animate-fade-in animation-delay-500">
              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />
                
                <CardContent className="relative p-8 md:p-12">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitHandler)}>
                      <div className="animate-scale-in">
                        {renderStepContent()}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
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
            
            {/* GroupDialog - Fix the type issues */}
            <GroupDialog
              open={groupDialog}
              onOpenChange={(open) => open ? openGroupDialog() : closeGroupDialog()}
              familyGroups={1} // Pass a number as expected
              groupType={form.watch('groupType')}
              onGroupTypeChange={(value) => form.setValue('groupType', value)}
              onFamilyGroupsChange={(count: number) => setFamilyGroups(count)} // Fix the type signature
              onConfirm={closeGroupDialog}
              onCancel={closeGroupDialog}
            />
          </div>
        </div>
        
        {/* Bottom decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-50/40 to-transparent pointer-events-none" />
      </div>
    );
  } catch (error) {
    console.error("❌ RequestQuotePage: Critical error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-md shadow-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Errore nell'applicazione</h2>
            <p className="text-gray-600 mb-4">Si è verificato un errore imprevisto. Dettagli: {error?.message || 'Errore sconosciuto'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
