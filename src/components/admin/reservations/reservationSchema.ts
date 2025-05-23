
import { z } from "zod";

// Define the form schema
export const reservationSchema = z.object({
  id: z.string().optional(),
  guestName: z.string().min(2, "Nome obbligatorio"),
  adults: z.coerce.number().min(1, "Almeno 1 adulto richiesto"),
  children: z.coerce.number().min(0, "Non può essere negativo"),
  cribs: z.coerce.number().min(0, "Non può essere negativo"),
  hasPets: z.boolean(),
  apartmentIds: z.array(z.string()).min(1, "Seleziona almeno un appartamento"),
  startDate: z.date(),
  endDate: z.date(),
  finalPrice: z.coerce.number().min(0, "Il prezzo non può essere negativo"),
  paymentMethod: z.enum(["cash", "bankTransfer", "creditCard"]),
  paymentStatus: z.enum(["notPaid", "deposit", "paid"]),
  depositAmount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  linenOption: z.enum(["standard", "extra", "deluxe"]).default("standard"),
  lastUpdated: z.number().optional(), // Campo per tracciare l'ultima modifica
  syncId: z.string().optional(), // Identificativo univoco per sincronizzazione
  deviceId: z.string().optional() // Identificativo del dispositivo di origine
}).refine(data => {
  return data.endDate > data.startDate;
}, {
  message: "La data di fine deve essere successiva alla data di inizio",
  path: ["endDate"]
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
