import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Minus, Download, MessageSquare, MessageCircle, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Schema per i dettagli bambini
const childDetailSchema = z.object({
  age: z.number().min(0).max(17),
  sleepsWithParents: z.boolean().default(false),
});

// Schema per il gruppo familiare
const familyGroupSchema = z.object({
  adults: z.number().min(1, { message: "Almeno un adulto per famiglia" }),
  children: z.number().min(0),
  childrenDetails: z.array(childDetailSchema).optional(),
});

// Schema dello step 1: Informazioni sugli ospiti
const guestSchema = z.object({
  adults: z.number().min(1, { message: "È richiesto almeno un adulto" }),
  children: z.number().min(0),
  childrenDetails: z.array(childDetailSchema).optional(),
  isGroupBooking: z.boolean().default(false),
  groupType: z.enum(["families", "couples"]).optional(),
  familyGroups: z.array(familyGroupSchema).optional(),
});

// Schema dello step 2: Date del soggiorno
const dateSchema = z.object({
  checkIn: z.date({ required_error: "La data di arrivo è obbligatoria" }),
  checkOut: z.date({ required_error: "La data di partenza è obbligatoria" }),
});

// Schema dello step 3: Appartamento selezionato
const apartmentSchema = z.object({
  selectedApartment: z.string().min(1, { message: "Seleziona un appartamento" }),
});

// Schema dello step 4: Servizi extra
const extrasSchema = z.object({
  linenOption: z.enum(["standard", "extra", "deluxe"], {
    required_error: "Seleziona un'opzione per la biancheria",
  }),
  hasPets: z.boolean().default(false),
  petsCount: z.number().optional(),
  petSize: z.enum(["small", "medium", "large"]).optional(),
  additionalServices: z.array(z.string()).optional(),
});

// Schema dello step 5: Informazioni di contatto
const contactSchema = z.object({
  name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  email: z.string().email({ message: "Inserisci un'email valida" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

// Schema completo del form
const formSchema = z.object({
  step: z.number(),
  ...guestSchema.shape,
  ...dateSchema.shape,
  ...apartmentSchema.shape,
  ...extrasSchema.shape,
  ...contactSchema.shape,
});

// Dati di esempio per gli appartamenti
const apartments = [
  {
    id: "bilocale-piano-terra",
    name: "Bilocale Piano Terra",
    description: "Appartamento con accesso diretto al giardino",
    capacity: 4,
    floor: "terra",
    view: "giardino",
    size: 45,
    price: 120,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV"],
    images: ["placeholder.svg"],
  },
  {
    id: "bilocale-primo-piano",
    name: "Bilocale Primo Piano",
    description: "Appartamento con vista panoramica",
    capacity: 4,
    floor: "primo",
    view: "mare",
    size: 45,
    price: 130,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV"],
    images: ["placeholder.svg"],
  },
  {
    id: "trilocale-piano-terra",
    name: "Trilocale Piano Terra",
    description: "Spazioso appartamento con accesso giardino",
    capacity: 6,
    floor: "terra",
    view: "giardino",
    size: 65,
    price: 160,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV", "Lavastoviglie"],
    images: ["placeholder.svg"],
  },
  {
    id: "trilocale-primo-piano",
    name: "Trilocale Primo Piano",
    description: "Grande appartamento con vista mare",
    capacity: 6,
    floor: "primo",
    view: "mare",
    size: 65,
    price: 180,
    services: ["WiFi", "Aria Condizionata", "Parcheggio", "TV", "Lavastoviglie"],
    images: ["placeholder.svg"],
  },
];

const RequestQuotePage = () => {
  const [step, setStep] = React.useState(1);
  const totalSteps = 6;
  
  const [childrenArray, setChildrenArray] = React.useState<{ age: number; sleepsWithParents: boolean }[]>([]);
  const [apartmentDialog, setApartmentDialog] = React.useState<string | null>(null);
  const [groupDialog, setGroupDialog] = React.useState(false);
  const [familyGroups, setFamilyGroups] = React.useState<{ adults: number; children: number; childrenDetails: { age: number; sleepsWithParents: boolean }[] }[]>([]);
  
  // Inizializzo il form con valori predefiniti
  const form = useForm<z.infer<typeof formSchema>>({
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
  React.useEffect(() => {
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
  
  // Aggiunge un nuovo gruppo familiare
  const addFamilyGroup = () => {
    setFamilyGroups([...familyGroups, { adults: 2, children: 0, childrenDetails: [] }]);
  };
  
  // Rimuove un gruppo familiare
  const removeFamilyGroup = (index: number) => {
    if (familyGroups.length > 1) {
      const newGroups = [...familyGroups];
      newGroups.splice(index, 1);
      setFamilyGroups(newGroups);
    } else {
      toast.error("È necessario almeno un gruppo familiare");
    }
  };
  
  // Aggiorna i dettagli di un gruppo familiare
  const updateFamilyGroup = (index: number, field: 'adults' | 'children', value: number) => {
    const updatedGroups = [...familyGroups];
    updatedGroups[index][field] = value;
    
    // Se cambiamo il numero di bambini, aggiorniamo anche i loro dettagli
    if (field === 'children') {
      let details = updatedGroups[index].childrenDetails || [];
      
      if (value > details.length) {
        // Aggiungiamo nuovi bambini
        const diff = value - details.length;
        for (let i = 0; i < diff; i++) {
          details.push({ age: 0, sleepsWithParents: false });
        }
      } else if (value < details.length) {
        // Rimuoviamo i bambini in eccesso
        details = details.slice(0, value);
      }
      
      updatedGroups[index].childrenDetails = details;
    }
    
    setFamilyGroups(updatedGroups);
  };
  
  // Aggiorna i dettagli di un bambino in un gruppo specifico
  const updateGroupChildDetails = (groupIndex: number, childIndex: number, field: 'age' | 'sleepsWithParents', value: number | boolean) => {
    const updatedGroups = [...familyGroups];
    const details = updatedGroups[groupIndex].childrenDetails || [];
    
    if (field === 'age') {
      details[childIndex].age = value as number;
    } else {
      details[childIndex].sleepsWithParents = value as boolean;
    }
    
    updatedGroups[groupIndex].childrenDetails = details;
    setFamilyGroups(updatedGroups);
  };
  
  // Invio del form
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (step < totalSteps) {
      nextStep();
    } else {
      console.log("Form inviato:", data);
      toast.success("Preventivo inviato con successo!");
      // In una implementazione reale, qui si invierebbe il preventivo
    }
  };
  
  // Calcolo del prezzo totale del soggiorno
  const calculateTotalPrice = () => {
    const selectedApartmentId = form.getValues("selectedApartment");
    const apartment = apartments.find(apt => apt.id === selectedApartmentId);
    
    if (!apartment) return { 
      basePrice: 0, 
      extras: 0, 
      touristTax: 0, 
      totalBeforeDiscount: 0, 
      totalAfterDiscount: 0, 
      savings: 0, 
      deposit: 0, 
      nights: 0 
    };
    
    const checkIn = form.getValues("checkIn");
    const checkOut = form.getValues("checkOut");
    
    if (!checkIn || !checkOut) return { 
      basePrice: 0, 
      extras: 0, 
      touristTax: 0, 
      totalBeforeDiscount: 0, 
      totalAfterDiscount: 0, 
      savings: 0, 
      deposit: 0, 
      nights: 0 
    };
    
    // Calcolo il numero di notti
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calcolo il prezzo base dell'appartamento
    let basePrice = apartment.price * nights;
    
    // Aggiungo eventuali extra
    const linenOption = form.getValues("linenOption");
    const extraForLinen = linenOption === "extra" ? 30 : linenOption === "deluxe" ? 60 : 0;
    
    // Calcolo il prezzo degli animali domestici
    let petPrice = 0;
    if (form.getValues("hasPets")) {
      const petsCount = form.getValues("petsCount") || 0;
      const petSize = form.getValues("petSize");
      
      const pricePerPet = petSize === "small" ? 5 : petSize === "medium" ? 10 : 15;
      petPrice = pricePerPet * petsCount * nights;
    }
    
    // Calcolo della tassa di soggiorno
    const adults = form.getValues("adults");
    const touristTax = adults * nights * 2; // € 2 per persona per notte
    
    // Prezzo totale (esclusa tassa di soggiorno)
    const totalPrice = basePrice + extraForLinen + petPrice;
    
    // Arrotondamento per difetto al multiplo di 50 più vicino
    const roundedPrice = Math.floor(totalPrice / 50) * 50;
    
    return {
      basePrice,
      extras: extraForLinen + petPrice,
      touristTax,
      totalBeforeDiscount: totalPrice,
      totalAfterDiscount: roundedPrice,
      savings: totalPrice - roundedPrice,
      deposit: Math.ceil(roundedPrice * 0.3), // 30% di caparra
      nights
    };
  };
  
  // Apertura del dialogo dei dettagli dell'appartamento
  const openApartmentDialog = (id: string) => {
    setApartmentDialog(id);
  };
  
  // Chiusura del dialogo dei dettagli dell'appartamento
  const closeApartmentDialog = () => {
    setApartmentDialog(null);
  };
  
  // Funzione per scaricare il preventivo come PDF
  const downloadQuote = () => {
    toast.success("Download del preventivo avviato!");
    // In una implementazione reale, qui si genererebbe e scaricherebbe il PDF
  };
  
  // Funzione per inviare il preventivo via WhatsApp
  const sendWhatsApp = () => {
    const selectedApartmentId = form.getValues("selectedApartment");
    const apartment = apartments.find(apt => apt.id === selectedApartmentId);
    
    if (!apartment) return;
    
    const checkIn = form.getValues("checkIn");
    const checkOut = form.getValues("checkOut");
    
    if (!checkIn || !checkOut) return;
    
    const priceInfo = calculateTotalPrice();
    
    // Creo il messaggio per WhatsApp
    const name = form.getValues("name");
    let message = `${name ? `Salve ${name}, ` : "Salve, "}desidero prenotare a Villa MareBlu:\n`;
    message += `- Periodo: dal ${format(checkIn, "dd/MM/yyyy")} al ${format(checkOut, "dd/MM/yyyy")} (${priceInfo.nights} notti)\n`;
    message += `- Ospiti: ${form.getValues("adults")} adulti`;
    
    if (form.getValues("children") > 0) {
      message += `, ${form.getValues("children")} bambini`;
    }
    
    message += `\n- Appartamento: ${apartment.name}\n`;
    message += `- Totale preventivo: ${priceInfo.totalAfterDiscount}€ (+ ${priceInfo.touristTax}€ tassa di soggiorno)`;
    
    // Codifica il messaggio per l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Apro WhatsApp con il messaggio precompilato
    window.open(`https://wa.me/+393123456789?text=${encodedMessage}`, "_blank");
    
    toast.success("Apertura di WhatsApp con messaggio precompilato");
  };
  
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
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1: Informazioni sugli ospiti */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Informazioni sugli ospiti</CardTitle>
                <CardDescription>Indica il numero di ospiti che soggiorneranno a Villa MareBlu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Numero di adulti */}
                <div className="space-y-2">
                  <Label htmlFor="adults">Numero di adulti</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={decrementAdults}
                      disabled={form.getValues("adults") <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="adults"
                      type="number"
                      className="w-20 text-center"
                      {...form.register("adults", { valueAsNumber: true })}
                      readOnly
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={incrementAdults}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    {/* Mostra il pulsante per i gruppi se ci sono più di 3 adulti */}
                    {form.watch("adults") > 3 && !form.watch("isGroupBooking") && (
                      <Button 
                        type="button"
                        variant="outline"
                        className="ml-4 flex items-center gap-2"
                        onClick={openGroupDialog}
                      >
                        <Users className="h-4 w-4" />
                        Specifica composizione gruppo
                      </Button>
                    )}
                    
                    {/* Badge che indica che è una prenotazione di gruppo */}
                    {form.watch("isGroupBooking") && (
                      <div className="flex items-center ml-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Gruppo definito
                        </span>
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={openGroupDialog}
                          className="ml-1 h-auto p-1"
                        >
                          Modifica
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Numero di bambini */}
                <div className="space-y-2">
                  <Label htmlFor="children">Numero di bambini</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={decrementChildren}
                      disabled={form.getValues("children") <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="children"
                      type="number"
                      className="w-20 text-center"
                      {...form.register("children", { valueAsNumber: true })}
                      readOnly
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={incrementChildren}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Dettagli dei bambini - mostrati solo se non è una prenotazione di gruppo */}
                {childrenArray.length > 0 && !form.watch("isGroupBooking") && (
                  <div className="space-y-4 mt-4 border rounded-lg p-4">
                    <h3 className="font-medium">Dettagli bambini</h3>
                    {childrenArray.map((child, index) => (
                      <div key={index} className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0">
                        <h4>Bambino {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`child-age-${index}`}>Età</Label>
                            <select
                              id={`child-age-${index}`}
                              value={child.age}
                              onChange={(e) => updateChildDetails(index, 'age', parseInt(e.target.value))}
                              className="w-full h-10 px-3 rounded-md border border-input bg-background focus-visible:outline-none"
                            >
                              {Array.from({ length: 18 }, (_, i) => (
                                <option key={i} value={i}>{i} {i === 1 ? "anno" : "anni"}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`sleeps-with-parents-${index}`}
                              checked={child.sleepsWithParents}
                              onCheckedChange={(checked) => {
                                updateChildDetails(index, 'sleepsWithParents', checked === true);
                              }}
                            />
                            <Label htmlFor={`sleeps-with-parents-${index}`}>Dorme con i genitori</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={nextStep}>Avanti</Button>
              </CardFooter>
            </Card>
          )}
          
          {/* STEP 2: Selezione date */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Selezione date</CardTitle>
                <CardDescription>Indica le date di check-in e check-out del tuo soggiorno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date di check-in */}
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data di check-in</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Seleziona una data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date di check-out */}
                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data di check-out</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Seleziona una data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const checkIn = form.getValues("checkIn");
                              return date <= checkIn || !checkIn;
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Legenda colori calendario */}
                <div className="border rounded-md p-3 text-sm space-y-2">
                  <h4 className="font-medium">Legenda colori calendario:</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border"></div>
                    <span>Completamente disponibile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border"></div>
                    <span>Giorno di transizione (check-in/check-out nello stesso giorno)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border"></div>
                    <span>Non disponibile</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
                <Button type="button" onClick={nextStep}>Avanti</Button>
              </CardFooter>
            </Card>
          )}
          
          {/* STEP 3: Selezione appartamento */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Appartamenti disponibili</CardTitle>
                <CardDescription>Seleziona l'appartamento che preferisci per il tuo soggiorno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Elenco degli appartamenti */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apartments.map((apartment) => (
                    <div 
                      key={apartment.id} 
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all hover:border-primary", 
                        form.getValues("selectedApartment") === apartment.id && "border-primary border-2"
                      )}
                      onClick={() => form.setValue("selectedApartment", apartment.id)}
                    >
                      <div className="aspect-video bg-muted rounded-md mb-3 relative overflow-hidden">
                        <img 
                          src={apartment.images[0]} 
                          alt={apartment.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{apartment.name}</h3>
                          <span className="font-semibold text-primary">{apartment.price}€/notte</span>
                        </div>
                        <p className="text-muted-foreground text-sm">{apartment.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-muted px-2 py-1 rounded">{apartment.capacity} persone</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">Piano {apartment.floor}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">Vista {apartment.view}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{apartment.size} m²</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="text-primary p-0 h-auto" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openApartmentDialog(apartment.id);
                          }}
                        >
                          Dettagli
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Avviso di errore se nessun appartamento è selezionato */}
                {form.formState.errors.selectedApartment && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.selectedApartment.message}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
                <Button type="button" onClick={nextStep}>Avanti</Button>
              </CardFooter>
            </Card>
          )}
          
          {/* STEP 4: Servizi extra */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Servizi extra</CardTitle>
                <CardDescription>Personalizza il tuo soggiorno con servizi aggiuntivi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Opzioni biancheria */}
                <FormField
                  control={form.control}
                  name="linenOption"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Biancheria da letto e bagno</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="linen-standard" />
                            <Label htmlFor="linen-standard" className="cursor-pointer">
                              Standard - Un cambio incluso (gratuito)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="extra" id="linen-extra" />
                            <Label htmlFor="linen-extra" className="cursor-pointer">
                              Extra - Un cambio biancheria aggiuntivo (+30€)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="deluxe" id="linen-deluxe" />
                            <Label htmlFor="linen-deluxe" className="cursor-pointer">
                              Deluxe - Cambi biancheria frequenti (+60€)
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Animali domestici */}
                <FormField
                  control={form.control}
                  name="hasPets"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            id="has-pets"
                          />
                        </FormControl>
                        <Label htmlFor="has-pets" className="cursor-pointer">
                          Viaggerò con animali domestici
                        </Label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Dettagli animali domestici (se presenti) */}
                {form.watch("hasPets") && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-medium">Dettagli animali domestici</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pets-count">Numero di animali</Label>
                      <div className="flex items-center space-x-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            const current = form.getValues("petsCount") || 0;
                            if (current > 0) form.setValue("petsCount", current - 1);
                          }}
                          disabled={(form.getValues("petsCount") || 0) <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="pets-count"
                          type="number"
                          className="w-20 text-center"
                          {...form.register("petsCount", { valueAsNumber: true })}
                          readOnly
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            const current = form.getValues("petsCount") || 0;
                            form.setValue("petsCount", current + 1);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="petSize"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Taglia dell'animale</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="small" id="pet-small" />
                                <Label htmlFor="pet-small" className="cursor-pointer">
                                  Piccola (fino a 10kg) - 5€ al giorno per animale
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="pet-medium" />
                                <Label htmlFor="pet-medium" className="cursor-pointer">
                                  Media (10-25kg) - 10€ al giorno per animale
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="large" id="pet-large" />
                                <Label htmlFor="pet-large" className="cursor-pointer">
                                  Grande (oltre 25kg) - 15€ al giorno per animale
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
                <Button type="button" onClick={nextStep}>Avanti</Button>
              </CardFooter>
            </Card>
          )}
          
          {/* STEP 5: Riepilogo e calcolo finale */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo prenotazione</CardTitle>
                <CardDescription>Verifica i dettagli del tuo preventivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dettagli della prenotazione */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date e durata */}
                    <div className="border rounded-md p-4 space-y-2">
                      <h3 className="font-medium">Date del soggiorno</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Check-in:</span>
                        <span>{form.getValues("checkIn") ? format(form.getValues("checkIn"), "dd/MM/yyyy") : "-"}</span>
                        <span className="text-muted-foreground">Check-out:</span>
                        <span>{form.getValues("checkOut") ? format(form.getValues("checkOut"), "dd/MM/yyyy") : "-"}</span>
                        <span className="text-muted-foreground">Durata:</span>
                        <span>{calculateTotalPrice().nights} notti</span>
                      </div>
                    </div>
                    
                    {/* Ospiti */}
                    <div className="border rounded-md p-4 space-y-2">
                      <h3 className="font-medium">Ospiti</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Adulti:</span>
                        <span>{form.getValues("adults")}</span>
                        <span className="text-muted-foreground">Bambini:</span>
                        <span>{form.getValues("children")}</span>
                        <span className="text-muted-foreground">Totale ospiti:</span>
                        <span>{form.getValues("adults") + form.getValues("children")}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Appartamento selezionato */}
                  <div className="border rounded-md p-4 space-y-2">
                    <h3 className="font-medium">Appartamento selezionato</h3>
                    {apartments.find(apt => apt.id === form.getValues("selectedApartment")) && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Nome:</span>
                        <span>{apartments.find(apt => apt.id === form.getValues("selectedApartment"))?.name}</span>
                        <span className="text-muted-foreground">Capacità:</span>
                        <span>{apartments.find(apt => apt.id === form.getValues("selectedApartment"))?.capacity} persone</span>
                        <span className="text-muted-foreground">Posizione:</span>
                        <span>Piano {apartments.find(apt => apt.id === form.getValues("selectedApartment"))?.floor}</span>
                        <span className="text-muted-foreground">Vista:</span>
                        <span>Vista {apartments.find(apt => apt.id === form.getValues("selectedApartment"))?.view}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Servizi extra */}
                  <div className="border rounded-md p-4 space-y-2">
                    <h3 className="font-medium">Servizi extra</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Biancheria:</span>
                      <span>
                        {form.getValues("linenOption") === "standard" && "Standard (incluso)"}
                        {form.getValues("linenOption") === "extra" && "Extra (+30€)"}
                        {form.getValues("linenOption") === "deluxe" && "Deluxe (+60€)"}
                      </span>
                      <span className="text-muted-foreground">Animali:</span>
                      <span>
                        {form.getValues("hasPets") 
                          ? `${form.getValues("petsCount")} ${form.getValues("petsCount") === 1 ? "animale" : "animali"} di taglia ${
                              form.getValues("petSize") === "small" ? "piccola" : 
                              form.getValues("petSize") === "medium" ? "media" : "grande"
                            }`
                          : "No"
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Riepilogo costi */}
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Riepilogo costi</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Costo appartamento ({calculateTotalPrice().nights} notti):</span>
                        <span>{calculateTotalPrice().basePrice}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Servizi extra:</span>
                        <span>{calculateTotalPrice().extras}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotale:</span>
                        <span>{calculateTotalPrice().totalBeforeDiscount}€</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Totale con sconto applicato:</span>
                        <span className="text-primary">{calculateTotalPrice().totalAfterDiscount}€</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Risparmio:</span>
                        <span>{calculateTotalPrice().savings}€</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">Tassa di soggiorno:</span>
                        <span>{calculateTotalPrice().touristTax}€</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base border-t pt-2">
                        <span>Totale da pagare:</span>
                        <span>{calculateTotalPrice().totalAfterDiscount + calculateTotalPrice().touristTax}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Caparra (30%):</span>
                        <span>{calculateTotalPrice().deposit}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cauzione (restituibile):</span>
                        <span>200€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
                <Button type="button" onClick={nextStep}>Avanti</Button>
              </CardFooter>
            </Card>
          )}
          
          {/* STEP 6: Finalizzazione preventivo */}
          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Finalizza il preventivo</CardTitle>
                <CardDescription>Inserisci i tuoi dati per ricevere il preventivo personalizzato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dati di contatto */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome e cognome</FormLabel>
                        <FormControl>
                          <Input placeholder="Mario Rossi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="mario.rossi@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note e richieste speciali</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Inserisci eventuali richieste speciali o informazioni aggiuntive" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row gap-4 justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
                <div className="flex flex-col md:flex-row gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="gap-2"
                    onClick={downloadQuote}
                  >
                    <Download className="h-4 w-4" />
                    Scarica preventivo
                  </Button>
                  <Button 
                    type="button"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={sendWhatsApp}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Richiedi su WhatsApp
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
      
      {/* Dialog per i dettagli dell'appartamento */}
      {apartmentDialog && (
        <Dialog open={!!apartmentDialog} onOpenChange={closeApartmentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{apartments.find(apt => apt.id === apartmentDialog)?.name}</DialogTitle>
              <DialogDescription>
                {apartments.find(apt => apt.id === apartmentDialog)?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={apartments.find(apt => apt.id === apartmentDialog)?.images[0]} 
                  alt={apartments.find(apt => apt.id === apartmentDialog)?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Capacità:</span>
                <span>{apartments.find(apt => apt.id === apartmentDialog)?.capacity} persone</span>
                <span className="text-muted-foreground">Dimensione:</span>
                <span>{apartments.find(apt => apt.id === apartmentDialog)?.size} m²</span>
                <span className="text-muted-foreground">Piano:</span>
                <span>{apartments.find(apt => apt.id === apartmentDialog)?.floor}</span>
                <span className="text-muted-foreground">Vista:</span>
                <span>{apartments.find(apt => apt.id === apartmentDialog)?.view}</span>
              </div>
              <div>
                <h4 className="font-medium mb-2">Servizi inclusi:</h4>
                <div className="flex flex-wrap gap-2">
                  {apartments.find(apt => apt.id === apartmentDialog)?.services.map((service, index) => (
                    <span key={index} className="text-xs bg-muted px-2 py-1 rounded">{service}</span>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button 
                variant="default" 
                onClick={() => {
                  form.setValue("selectedApartment", apartmentDialog);
                  closeApartmentDialog();
                }}
              >
                Seleziona
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog per la composizione del gruppo */}
      <Dialog open={groupDialog} onOpenChange={setGroupDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Composizione del gruppo</DialogTitle>
            <DialogDescription>
              Specifica la composizione del tuo gruppo per un preventivo più accurato
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Selezione del tipo di gruppo */}
            <div className="space-y-3">
              <Label>Tipo di gruppo</Label>
              <RadioGroup
                value={form.getValues("groupType") || "families"}
                onValueChange={(value) => form.setValue("groupType", value as "families" | "couples")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="families" id="group-families" />
                  <Label htmlFor="group-families" className="cursor-pointer">
                    Famiglie
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="couples" id="group-couples" />
                  <Label htmlFor="group-couples" className="cursor-pointer">
                    Coppie
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Lista dei gruppi familiari */}
            <div className="space-y-6">
              {familyGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      {form.getValues("groupType") === "couples" ? `Coppia ${groupIndex + 1}` : `Famiglia ${groupIndex + 1}`}
                    </h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFamilyGroup(groupIndex)}
                      className="h-8 px-2 text-destructive"
                      disabled={familyGroups.length <= 1}
                    >
                      Rimuovi
                    </Button>
                  </div>
                  
                  {/* Numero di adulti */}
                  <div className="space-y-2">
                    <Label>Adulti</Label>
                    <div className="flex items-center space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          if (group.adults > 1) {
                            updateFamilyGroup(groupIndex, 'adults', group.adults - 1);
                          }
                        }}
                        disabled={group.adults <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="w-20 text-center"
                        value={group.adults}
                        readOnly
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => updateFamilyGroup(groupIndex, 'adults', group.adults + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Numero di bambini */}
                  <div className="space-y-2">
                    <Label>Bambini</Label>
                    <div className="flex items-center space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          if (group.children > 0) {
                            updateFamilyGroup(groupIndex, 'children', group.children - 1);
                          }
                        }}
                        disabled={group.children <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="w-20 text-center"
                        value={group.children}
                        readOnly
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => updateFamilyGroup(groupIndex, 'children', group.children + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Dettagli dei bambini per questo gruppo */}
                  {group.children > 0 && (
                    <div className="space-y-4 mt-2 border-t pt-4">
                      <h4 className="font-medium">Dettagli bambini</h4>
                      {(group.childrenDetails || []).map((child, childIndex) => (
                        <div key={childIndex} className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0">
                          <h5>Bambino {childIndex + 1}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`group-${groupIndex}-child-age-${childIndex}`}>Età</Label>
                              <select
                                id={`group-${groupIndex}-child-age-${childIndex}`}
                                value={child.age}
                                onChange={(e) => updateGroupChildDetails(groupIndex, childIndex, 'age', parseInt(e.target.value))}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background focus-visible:outline-none"
                              >
                                {Array.from({ length: 18 }, (_, i) => (
                                  <option key={i} value={i}>{i} {i === 1 ? "anno" : "anni"}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`group-${groupIndex}-sleeps-with-parents-${childIndex}`}
                                checked={child.sleepsWithParents}
                                onCheckedChange={(checked) => {
                                  updateGroupChildDetails(groupIndex, childIndex, 'sleepsWithParents', checked === true);
                                }}
                              />
                              <Label htmlFor={`group-${groupIndex}-sleeps-with-parents-${childIndex}`}>Dorme con i genitori</Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Pulsante per aggiungere un nuovo gruppo */}
            <Button 
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={addFamilyGroup}
            >
              <Plus className="h-4 w-4" />
              Aggiungi {form.getValues("groupType") === "couples" ? "coppia" : "famiglia"}
            </Button>
            
            {/* Riepilogo */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Riepilogo</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Totale adulti:</span> {familyGroups.reduce((sum, group) => sum + group.adults, 0)}
                </p>
                <p>
                  <span className="font-medium">Totale bambini:</span> {familyGroups.reduce((sum, group) => sum + group.children, 0)}
                </p>
                <p>
                  <span className="font-medium">Totale ospiti:</span> {
                    familyGroups.reduce((sum, group) => sum + group.adults + group.children, 0)
                  }
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setGroupDialog(false);
              form.setValue("isGroupBooking", false);
            }}>Annulla</Button>
            <Button type="button" onClick={closeGroupDialog}>Conferma</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestQuotePage;
