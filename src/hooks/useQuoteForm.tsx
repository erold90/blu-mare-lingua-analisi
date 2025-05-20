import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormValues, formSchema } from "@/utils/quoteFormSchema";
import { createWhatsAppMessage, calculateTotalPrice } from "@/utils/quoteCalculator";
import { apartments } from "@/data/apartments";

export function useQuoteForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  
  const [childrenArray, setChildrenArray] = useState<{ isUnder12: boolean; sleepsWithParents: boolean }[]>([]);
  const [apartmentDialog, setApartmentDialog] = useState<string | null>(null);
  const [groupDialog, setGroupDialog] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<{ adults: number; children: number; childrenDetails: { isUnder12: boolean; sleepsWithParents: boolean }[] }[]>([]);
  
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
      selectedApartments: [],
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
          // Aggiungiamo nuovi bambini con entrambi i valori impostati a false
          updatedArray.push({ isUnder12: false, sleepsWithParents: false });
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
  const updateChildDetails = (index: number, field: 'isUnder12' | 'sleepsWithParents', value: boolean) => {
    // Creo una copia profonda dell'array per evitare che le modifiche a un bambino influenzino gli altri
    const updatedArray = childrenArray.map((child, i) => {
      if (i === index) {
        // Aggiorno solo il bambino all'indice specificato
        return { ...child, [field]: value };
      }
      // Lascio invariati gli altri bambini
      return { ...child };
    });
    
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
  
  // Gestione del dialogo dell'appartamento
  const openApartmentDialog = (id: string) => {
    setApartmentDialog(id);
  };
  
  const closeApartmentDialog = () => {
    setApartmentDialog(null);
  };
  
  const selectApartment = (id: string) => {
    // Add to selectedApartments array if not already there
    const currentSelectedApts = form.getValues("selectedApartments") || [];
    if (!currentSelectedApts.includes(id)) {
      form.setValue("selectedApartments", [...currentSelectedApts, id]);
    }
    
    // Also set as the main selected apartment
    form.setValue("selectedApartment", id);
    closeApartmentDialog();
  };
  
  // Gestione gruppi familiari
  const openGroupDialog = () => {
    setGroupDialog(true);
    
    // Se non ci sono già gruppi familiari, ne creiamo uno di default
    if (familyGroups.length === 0) {
      const adultsCount = form.getValues("adults");
      const initialGroups = [{ 
        adults: adultsCount, 
        children: form.getValues("children"), 
        // Assicuriamoci di impostare entrambi i valori a false per i dettagli dei bambini
        childrenDetails: form.getValues("children") > 0 
          ? Array(form.getValues("children")).fill().map(() => ({ isUnder12: false, sleepsWithParents: false }))
          : [] 
      }];
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
      const allChildrenDetails: { isUnder12: boolean; sleepsWithParents: boolean }[] = [];
      familyGroups.forEach(group => {
        if (group.childrenDetails && group.childrenDetails.length > 0) {
          allChildrenDetails.push(...group.childrenDetails);
        }
      });
      
      setChildrenArray(allChildrenDetails);
      form.setValue("childrenDetails", allChildrenDetails);
    }
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
  
  // Invio del form
  const onSubmitHandler = (data: FormValues) => {
    if (step < totalSteps) {
      nextStep();
    } else {
      console.log("Form inviato:", data);
      toast.success("Preventivo inviato con successo!");
      // In una implementazione reale, qui si invierebbe il preventivo
    }
  };

  // Wrapper function with no arguments
  const handleSubmitWrapper = () => {
    onSubmitHandler(form.getValues());
  };

  return {
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
  };
}
