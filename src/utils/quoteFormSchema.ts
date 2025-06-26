
import { z } from "zod";

// Schema per i dettagli bambini
export const childDetailSchema = z.object({
  isUnder12: z.boolean().default(false),
  sleepsWithParents: z.boolean().default(false),
  sleepsInCrib: z.boolean().default(false),
});

// Schema per il gruppo familiare
export const familyGroupSchema = z.object({
  adults: z.number().min(1, { message: "Almeno un adulto per famiglia" }),
  children: z.number().min(0),
  childrenDetails: z.array(childDetailSchema).optional(),
});

// Schema completo del form (semplificato per corrispondere alla realtà)
export const formSchema = z.object({
  step: z.number().default(1),
  // Step 1: Date e ospiti
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  adults: z.number().min(1).default(1),
  children: z.number().min(0).default(0),
  childrenDetails: z.array(childDetailSchema).optional(),
  isGroupBooking: z.boolean().default(false),
  groupType: z.enum(["families", "couples"]).optional(),
  familyGroups: z.array(familyGroupSchema).optional(),
  
  // Step 2: Appartamenti
  selectedApartment: z.string().optional(),
  selectedApartments: z.array(z.string()).optional(),
  apartments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().optional(),
  })).optional(),
  
  // Step 3: Servizi
  needsLinen: z.boolean().default(false),
  hasPets: z.boolean().default(false),
  petsCount: z.number().optional(),
  petSize: z.enum(["small", "medium", "large"]).optional(),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().optional(),
  })).optional(),
  
  // Step 4: Info personali
  personalInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
  
  // Altri campi
  guests: z.number().optional(),
  notes: z.string().optional(),
  name: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
