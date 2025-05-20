
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Pencil, Plus, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReservations, Reservation } from "@/hooks/useReservations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the form schema
const reservationSchema = z.object({
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
  notes: z.string().optional()
}).refine(data => {
  return data.endDate > data.startDate;
}, {
  message: "La data di fine deve essere successiva alla data di inizio",
  path: ["endDate"]
});

type ReservationFormData = z.infer<typeof reservationSchema>;

const AdminReservations = () => {
  const { reservations, apartments, addReservation, updateReservation, deleteReservation } = useReservations();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [reservationToDelete, setReservationToDelete] = React.useState<string | null>(null);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestName: "",
      adults: 1,
      children: 0,
      cribs: 0,
      hasPets: false,
      apartmentIds: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // a week from now
      finalPrice: 0,
      paymentMethod: "cash",
      paymentStatus: "notPaid",
      depositAmount: 0,
      notes: ""
    }
  });

  // Function to open dialog for adding a new reservation
  const handleAddNew = () => {
    setEditingId(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // Function to open dialog for editing a reservation
  const handleEdit = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;
    
    setEditingId(id);
    form.reset({
      id: reservation.id,
      guestName: reservation.guestName,
      adults: reservation.adults,
      children: reservation.children,
      cribs: reservation.cribs,
      hasPets: reservation.hasPets,
      apartmentIds: reservation.apartmentIds,
      startDate: new Date(reservation.startDate),
      endDate: new Date(reservation.endDate),
      finalPrice: reservation.finalPrice,
      paymentMethod: reservation.paymentMethod,
      paymentStatus: reservation.paymentStatus,
      depositAmount: reservation.depositAmount || 0,
      notes: reservation.notes
    });
    setIsDialogOpen(true);
  };

  // Function to confirm deletion
  const handleDeleteConfirm = () => {
    if (reservationToDelete) {
      deleteReservation(reservationToDelete);
      toast.success("Prenotazione eliminata con successo!");
      setIsDeleteDialogOpen(false);
      setReservationToDelete(null);
    }
  };

  // Function to handle form submission
  const onSubmit = (data: ReservationFormData) => {
    try {
      if (editingId) {
        updateReservation({
          ...data,
          id: editingId,
          // Ensure all required fields are present and convert Date objects to strings
          guestName: data.guestName,
          adults: data.adults,
          children: data.children,
          cribs: data.cribs,
          hasPets: data.hasPets,
          apartmentIds: data.apartmentIds,
          startDate: data.startDate.toISOString(), // Convert Date to ISO string
          endDate: data.endDate.toISOString(), // Convert Date to ISO string
          finalPrice: data.finalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus
        });
        toast.success("Prenotazione aggiornata con successo!");
      } else {
        addReservation({
          // Ensure all required fields are present and convert Date objects to strings
          guestName: data.guestName,
          adults: data.adults,
          children: data.children,
          cribs: data.cribs,
          hasPets: data.hasPets,
          apartmentIds: data.apartmentIds,
          startDate: data.startDate.toISOString(), // Convert Date to ISO string
          endDate: data.endDate.toISOString(), // Convert Date to ISO string
          finalPrice: data.finalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          depositAmount: data.depositAmount,
          notes: data.notes
        });
        toast.success("Nuova prenotazione aggiunta con successo!");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving reservation:", error);
      toast.error("Errore nel salvare la prenotazione");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestione Prenotazioni</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Prenotazione
        </Button>
      </div>

      {/* Reservations Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Appartamenti</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Prezzo</TableHead>
              <TableHead>Stato Pagamento</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nessuna prenotazione trovata
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.guestName}
                    <div className="text-xs text-muted-foreground">
                      Adulti: {reservation.adults}, Bambini: {reservation.children}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reservation.apartmentIds.map(id => {
                      const apartment = apartments.find(a => a.id === id);
                      return apartment?.name;
                    }).join(", ")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(reservation.startDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(reservation.endDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>€{reservation.finalPrice}</TableCell>
                  <TableCell>
                    {reservation.paymentStatus === "notPaid" && "Non Pagato"}
                    {reservation.paymentStatus === "deposit" && 
                      `Caparra: €${reservation.depositAmount}`}
                    {reservation.paymentStatus === "paid" && "Pagato"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(reservation.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setReservationToDelete(reservation.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reservation Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifica Prenotazione" : "Nuova Prenotazione"}
            </DialogTitle>
            <DialogDescription>
              {editingId 
                ? "Modifica i dettagli della prenotazione esistente."
                : "Compila il form per aggiungere una nuova prenotazione."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Guest Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informazioni Ospite</h3>
                
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Cliente</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome e Cognome" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adulti</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min={1}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="children"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bambini</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cribs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Culle</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hasPets"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Animali Domestici</FormLabel>
                        <FormDescription>
                          L'ospite porta animali domestici
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Reservation Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dettagli Soggiorno</h3>

                <FormField
                  control={form.control}
                  name="apartmentIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appartamenti</FormLabel>
                      <FormDescription>
                        Seleziona uno o più appartamenti per questa prenotazione
                      </FormDescription>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {apartments.map((apartment) => (
                          <div 
                            key={apartment.id} 
                            className="flex items-center space-x-2"
                          >
                            <Checkbox 
                              id={`apartment-${apartment.id}`}
                              checked={field.value.includes(apartment.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, apartment.id]);
                                } else {
                                  field.onChange(
                                    field.value.filter((id) => id !== apartment.id)
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`apartment-${apartment.id}`}>
                              {apartment.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Check-in</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: it })
                                ) : (
                                  <span>Seleziona data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Check-out</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: it })
                                ) : (
                                  <span>Seleziona data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const startDate = form.getValues("startDate");
                                return date < startDate;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dettagli Pagamento</h3>
                
                <FormField
                  control={form.control}
                  name="finalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prezzo Totale (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metodo di Pagamento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona metodo di pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Contanti</SelectItem>
                          <SelectItem value="bankTransfer">Bonifico Bancario</SelectItem>
                          <SelectItem value="creditCard">Carta di Credito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stato del Pagamento</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset deposit amount if not deposit
                          if (value !== "deposit") {
                            form.setValue("depositAmount", 0);
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona stato del pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="notPaid">Non Pagato</SelectItem>
                          <SelectItem value="deposit">Caparra Versata</SelectItem>
                          <SelectItem value="paid">Pagamento Completo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("paymentStatus") === "deposit" && (
                  <FormField
                    control={form.control}
                    name="depositAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Importo Caparra (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            max={form.getValues("finalPrice")}
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Additional Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        placeholder="Note aggiuntive sulla prenotazione..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button type="submit">
                  {editingId ? "Aggiorna" : "Salva"} Prenotazione
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa prenotazione? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservations;
