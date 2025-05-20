import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Components
import GuestInfoStep from "@/components/quote/GuestInfoStep";
import DateSelectionStep from "@/components/quote/DateSelectionStep";
import ApartmentSelectionStep from "@/components/quote/ApartmentSelectionStep";
import ServicesStep from "@/components/quote/ServicesStep";
import SummaryStep from "@/components/quote/SummaryStep";
import ContactStep from "@/components/quote/ContactStep";
import GroupDialog from "@/components/quote/GroupDialog";
import ApartmentDialog from "@/components/quote/ApartmentDialog";

// Utils and Data
import { apartments } from "@/data/apartments";
import { formSchema, FormValues } from "@/utils/quoteFormSchema";
import { createWhatsAppMessage, calculateTotalPrice } from "@/utils/quoteCalculator";

const RequestQuotePage = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  
  const [childrenArray, setChildrenArray] = useState<{ age: number; sleepsWithParents: boolean }[]>([]);
  const [apartmentDialog, setApartmentDialog] = useState<string | null>(null);
  const [groupDialog, setGroupDialog] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<{ adults: number; children: number; childrenDetails: { age: number; sleepsWithParents: boolean }[] }[]>([]);
  
  // Inizializzo il form con valori predefiniti
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step: 1,
      adults: 2,
      children: 0,
      childrenDetails: [],
      linenOption: "standard",
      hasPets: false,
      petsCount: 0,
      isGroupBooking: false,
    },
  });
  
  // Gestisco i cambiamenti nel numero di bambini
  useEffect(() => {
    // Se non è una prenotazione di gruppo, gestisco i bambini normalmente
    if (!form.getValues("isGroupBooking")) {
      const childrenCount = form.getValues("children");
      let updatedArray = [...childrenArray];
      
      // Aggiungo nuovi bambini se necessario
      if (childrenCount > updatedArray.length) {
        const diff = childrenCount - updatedArray.length;
        for (let i = 0; i < diff; i++) {
          updatedArray.push({ age: 0, sleepsWithParents: false });
        }
      }
      // Rimuovo bambini in eccesso
      else if (childrenCount < updatedArray.length) {
        updatedArray = updatedArray.slice(0, childrenCount);
      }
      
      setChildrenArray(updatedArray);
      form.setValue("childrenDetails", updatedArray);
    }
  }, [form.watch("children"), form.watch("isGroupBooking")]);
  
  // Funzioni per incrementare/decrementare il numero di adulti e bambini
  const incrementAdults = () => {
    const current = form.getValues("adults");
    form.setValue("adults", current + 1);
  };
  
  const decrementAdults = () => {
    const current = form.getValues("adults");
    if (current > 1) {
      form.setValue("adults", current - 1);
    }
  };
  
  const incrementChildren = () => {
    const current = form.getValues("children");
    form.setValue("children", current + 1);
  };
  
  const decrementChildren = () => {
    const current = form.getValues("children");
    if (current > 0) {
      form.setValue("children", current - 1);
    }
  };
  
  // Aggiorna i dettagli di un bambino specifico
  const updateChildDetails = (index: number, field: 'age' | 'sleepsWithParents', value: number | boolean) => {
    const updatedArray = [...childrenArray];
    if (field === 'age') {
      updatedArray[index].age = value as number;
    } else {
      updatedArray[index].sleepsWithParents = value as boolean;
    }
    setChildrenArray(updatedArray);
    form.setValue("childrenDetails", updatedArray);
  };
  
  // Funzione per passare allo step successivo
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      form.setValue("step", step + 1);
    }
  };
  
  // Funzione per tornare allo step precedente
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      form.setValue("step", step - 1);
    }
  };
  
  // Gestione gruppi familiari
  const openGroupDialog = () => {
    setGroupDialog(true);
    
    // Se non ci sono già gruppi familiari, ne creiamo uno di default
    if (familyGroups.length === 0) {
      const adultsCount = form.getValues("adults");
      const initialGroups = [{ adults: adultsCount, children: form.getValues("children"), childrenDetails: [...childrenArray] }];
      setFamilyGroups(initialGroups);
    }
    
    form.setValue("isGroupBooking", true);
  };
  
  const closeGroupDialog = () => {
    setGroupDialog(false);
    
    // Aggiorniamo i totali in base ai gruppi definiti
    if (familyGroups.length > 0) {
      const totalAdults = familyGroups.reduce((sum, group) => sum + group.adults, 0);
      const totalChildren = familyGroups.reduce((sum, group) => sum + group.children, 0);
      
      form.setValue("adults", totalAdults);
      form.setValue("children", totalChildren);
      
      // Aggiorniamo anche i dettagli dei bambini se necessario
      const allChildrenDetails: { age: number; sleepsWithParents: boolean }[] = [];
      familyGroups.forEach(group => {
        if (group.childrenDetails && group.childrenDetails.length > 0) {
          allChildrenDetails.push(...group.childrenDetails);
        }
      });
      
      setChildrenArray(allChildrenDetails);
      form.setValue("childrenDetails", allChildrenDetails);
    }
  };
  
  // Gestione del dialogo dell'appartamento
  const openApartmentDialog = (id: string) => {
    setApartmentDialog(id);
  };
  
  const closeApartmentDialog = () => {
    setApartmentDialog(null);
  };
  
  const selectApartment = (id: string) => {
    form.setValue("selectedApartment", id);
    closeApartmentDialog();
  };
  
  // Funzione per scaricare il preventivo come PDF
  const downloadQuote = () => {
    toast.success("Download del preventivo avviato!");
    // In una implementazione reale, qui si genererebbe e scaricherebbe il PDF
  };
  
  // Funzione per inviare il preventivo via WhatsApp
  const sendWhatsApp = () => {
    const message = createWhatsAppMessage(form.getValues(), apartments);
    
    if (!message) {
      toast.error("Non è possibile creare il messaggio. Verifica i dati inseriti.");
      return;
    }
    
    // Codifica il messaggio per l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Apro WhatsApp con il messaggio precompilato
    window.open(`https://wa.me/+393123456789?text=${encodedMessage}`, "_blank");
    
    toast.success("Apertura di WhatsApp con messaggio precompilato");
  };
  
  // Invio del form - Fix the function signature to match the expected type
  const onSubmitHandler = (data: FormValues) => {
    if (step < totalSteps) {
      nextStep();
    } else {
      console.log("Form inviato:", data);
      toast.success("Preventivo inviato con successo!");
      // In una implementazione reale, qui si invierebbe il preventivo
    }
  };

  // We create a wrapper function with no arguments that calls onSubmitHandler with form.getValues()
  const handleSubmitWrapper = () => {
    onSubmitHandler(form.getValues());
  };
  
  // Render del form basato sullo step corrente
  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Richiedi un Preventivo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Compila il form per ricevere un preventivo personalizzato per il tuo soggiorno a Villa MareBlu.
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="w-full mb-8">
        <div className="bg-muted h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Ospiti</span>
          <span>Date</span>
          <span>Appartamento</span>
          <span>Extra</span>
          <span>Riepilogo</span>
          <span>Finalizza</span>
        </div>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
        {/* STEP 1: Informazioni sugli ospiti */}
        {step === 1 && (
          <GuestInfoStep 
            form={form}
            childrenArray={childrenArray}
            setChildrenArray={setChildrenArray}
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
            prevStep={prevStep}
            onSubmit={handleSubmitWrapper}
            downloadQuote={downloadQuote}
            sendWhatsApp={sendWhatsApp}
          />
        )}
      </form>
      
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
        onOpenChange={setGroupDialog}
        familyGroups={familyGroups}
        groupType={form.getValues("groupType")}
        onGroupTypeChange={(value) => form.setValue("groupType", value)}
        onFamilyGroupsChange={setFamilyGroups}
        onConfirm={closeGroupDialog}
        onCancel={() => {
          setGroupDialog(false);
          form.setValue("isGroupBooking", false);
        }}
      />
    </div>
  );
};

export default RequestQuotePage;
