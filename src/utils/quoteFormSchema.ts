
import { z } from "zod";

// Schema per i dettagli bambini
export const childDetailSchema = z.object({
  age: z.number().min(0).max(17),
  sleepsWithParents: z.boolean().default(false),
});

// Schema per il gruppo familiare
export const familyGroupSchema = z.object({
  adults: z.number().min(1, { message: "Almeno un adulto per famiglia" }),
  children: z.number().min(0),
  childrenDetails: z.array(childDetailSchema).optional(),
});

// Schema dello step 1: Informazioni sugli ospiti
export const guestSchema = z.object({
  adults: z.number().min(1, { message: "È richiesto almeno un adulto" }),
  children: z.number().min(0),
  childrenDetails: z.array(childDetailSchema).optional(),
  isGroupBooking: z.boolean().default(false),
  groupType: z.enum(["families", "couples"]).optional(),
  familyGroups: z.array(familyGroupSchema).optional(),
});

// Schema dello step 2: Date del soggiorno
export const dateSchema = z.object({
  checkIn: z.date({ required_error: "La data di arrivo è obbligatoria" }),
  checkOut: z.date({ required_error: "La data di partenza è obbligatoria" }),
});

// Schema dello step 3: Appartamento selezionato
export const apartmentSchema = z.object({
  selectedApartment: z.string().min(1, { message: "Seleziona un appartamento" }),
  selectedApartments: z.array(z.string()).optional(),
});

// Schema dello step 4: Servizi extra
export const extrasSchema = z.object({
  linenOption: z.enum(["standard", "extra", "deluxe"], {
    required_error: "Seleziona un'opzione per la biancheria",
  }),
  hasPets: z.boolean().default(false),
  petsCount: z.number().optional(),
  petSize: z.enum(["small", "medium", "large"]).optional(),
  additionalServices: z.array(z.string()).optional(),
});

// Schema dello step 5: Informazioni di contatto
export const contactSchema = z.object({
  name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  email: z.string().email({ message: "Inserisci un'email valida" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

// Schema completo del form
export const formSchema = z.object({
  step: z.number(),
  ...guestSchema.shape,
  ...dateSchema.shape,
  ...apartmentSchema.shape,
  ...extrasSchema.shape,
  ...contactSchema.shape,
});

export type FormValues = z.infer<typeof formSchema>;
