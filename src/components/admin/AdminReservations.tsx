import * as React from "react";
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
import { Pencil, Plus, Trash2, CalendarIcon, Info, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReservations, Reservation } from "@/hooks/useReservations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

// Separate dialog component for reservation details on mobile
const ReservationDetailsDialog = ({ reservation, apartments, onClose, onEdit }) => {
  if (!reservation) return null;

  // Find apartment names
  const apartmentNames = reservation.apartmentIds.map(id => {
    const apartment = apartments.find(a => a.id === id);
    return apartment?.name || '';
  }).join(", ");

  // Format payment status for display
  const getPaymentStatusText = () => {
    switch (reservation.paymentStatus) {
      case "notPaid": return "Non Pagato";
      case "deposit": return `Caparra: €${reservation.depositAmount}`;
      case "paid": return "Pagato";
      default: return "";
    }
  };

  return (
    <Dialog open={!!reservation} onOpenChange={() => onClose()}>
      <DialogContent className="w-[95vw] p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Prenotazione</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{reservation.guestName}</h3>
            <p className="text-muted-foreground">
              {reservation.adults} {reservation.adults === 1 ? 'adulto' : 'adulti'}
              {reservation.children > 0 && `, ${reservation.children} ${reservation.children === 1 ? 'bambino' : 'bambini'}`}
              {reservation.cribs > 0 && `, ${reservation.cribs} ${reservation.cribs === 1 ? 'culla' : 'culle'}`}
              {reservation.hasPets && ', con animali'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Check-in</p>
              <p>{format(new Date(reservation.startDate), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Check-out</p>
              <p>{format(new Date(reservation.endDate), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium">Appartamento</p>
            <p>{apartmentNames}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Prezzo Totale</p>
              <p>€{reservation.finalPrice}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Stato Pagamento</p>
              <p>{getPaymentStatusText()}</p>
            </div>
          </div>
          
          {reservation.notes && (
            <div>
              <p className="text-sm font-medium">Note</p>
              <p className="text-sm">{reservation.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline"
            onClick={() => onClose()}
            className="w-full"
          >
            Chiudi
          </Button>
          <Button onClick={() => onEdit(reservation.id)} className="w-full">
            <Pencil className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MobileReservationCard = ({ reservation, apartments, onEdit, onDelete, onViewDetails }) => {
  // Find apartment names
  const apartmentNames = reservation.apartmentIds.map(id => {
    const apartment = apartments.find(a => a.id === id);
    return apartment?.name || '';
  }).join(", ");

  // Calculate number of nights
  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  // Get payment status icon/color
  let statusColor = "bg-gray-200";
  if (reservation.paymentStatus === "paid") {
    statusColor = "bg-green-200";
  } else if (reservation.paymentStatus === "deposit") {
    statusColor = "bg-yellow-200";
  } else {
    statusColor = "bg-red-200";
  }

  return (
    <Card className="mb-3">
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusColor}`} />
          <CardTitle className="text-base">{reservation.guestName}</CardTitle>
        </div>
        <div className="text-sm font-medium">€{reservation.finalPrice}</div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in:</span>
            <span>{format(startDate, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out:</span>
            <span>{format(endDate, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durata:</span>
            <span>{nights} {nights === 1 ? 'notte' : 'notti'}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {apartmentNames}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-2 py-2 flex justify-between gap-1">
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(reservation)}>
          <Info className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(reservation.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(reservation.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const AdminReservations = () => {
  const { 
    reservations, 
    apartments, 
    addReservation, 
    updateReservation, 
    deleteReservation,
    refreshData,
    isLoading
  } = useReservations();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [reservationToDelete, setReservationToDelete] = React.useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);
  const isMobile = useIsMobile();

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
  
  // Handle manual refresh button click
  const handleRefresh = () => {
    refreshData();
  };

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
    setSelectedReservation(null); // Close details dialog if open
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

  // Function to handle deletion process
  const handleDelete = (id: string) => {
    setReservationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Function to view reservation details (mobile only)
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  // Function to handle form submission
  const onSubmit = (data: ReservationFormData) => {
    try {
      if (editingId) {
        updateReservation({
          ...data,
          id: editingId,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          guestName: data.guestName,
          adults: data.adults,
          children: data.children,
          cribs: data.cribs,
          hasPets: data.hasPets,
          apartmentIds: data.apartmentIds,
          finalPrice: data.finalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus
        });
        toast.success("Prenotazione aggiornata con successo!");
      } else {
        addReservation({
          guestName: data.guestName,
          adults: data.adults,
          children: data.children,
          cribs: data.cribs,
          hasPets: data.hasPets,
          apartmentIds: data.apartmentIds,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold">Gestione Prenotazioni</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            {!isMobile && <span className="ml-2">Sincronizza</span>}
          </Button>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {!isMobile && "Nuova Prenotazione"}
            {isMobile && "Nuovo"}
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Sincronizzazione in corso...</p>
          </div>
        </div>
      )}

      {/* Mobile view */}
      {!isLoading && isMobile && (
        <div className="mt-4">
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna prenotazione trovata
            </div>
          ) : (
            reservations.map(reservation => (
              <MobileReservationCard
                key={reservation.id}
                reservation={reservation}
                apartments={apartments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
          
          {/* Mobile reservation details dialog */}
          <ReservationDetailsDialog 
            reservation={selectedReservation}
            apartments={apartments}
            onClose={() => setSelectedReservation(null)}
            onEdit={handleEdit}
          />
        </div>
      )}

      {/* Desktop view */}
      {!isLoading && !isMobile && (
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
                          onClick={() => handleDelete(reservation.id)}
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
      )}

      {/* Reservation Form Dialog - Same for mobile and desktop with responsive adjustments */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isMobile && "w-[95vw] p-4"
        )}>
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Guest Information */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Informazioni Ospite</h3>
                
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

                <div className={cn(
                  "grid gap-2",
                  isMobile ? "grid-cols-3" : "grid-cols-3"
                )}>
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">Animali Domestici</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Reservation Details */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Dettagli Soggiorno</h3>

                <FormField
                  control={form.control}
                  name="apartmentIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appartamenti</FormLabel>
                      <FormDescription className="text-xs">
                        Seleziona uno o più appartamenti
                      </FormDescription>
                      <div className={cn(
                        "grid gap-2 mt-2",
                        isMobile ? "grid-cols-2" : "grid-cols-2"
                      )}>
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
                            <Label htmlFor={`apartment-${apartment.id}`} className="text-sm">
                              {apartment.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className={cn(
                  "grid gap-3",
                  "grid-cols-2"
                )}>
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Check-in</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal text-sm",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
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
                              initialFocus
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
                        <FormLabel>Check-out</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal text-sm",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
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
                                return date <= startDate;
                              }}
                              initialFocus
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
                <h3 className="text-base font-medium">Dettagli Pagamento</h3>
                
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
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metodo Pagamento</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Seleziona metodo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Contanti</SelectItem>
                            <SelectItem value="bankTransfer">Bonifico</SelectItem>
                            <SelectItem value="creditCard">Carta</SelectItem>
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
                        <FormLabel>Stato Pagamento</FormLabel>
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
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Seleziona stato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="notPaid">Non Pagato</SelectItem>
                            <SelectItem value="deposit">Caparra</SelectItem>
                            <SelectItem value="paid">Pagato</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
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
                        placeholder="Note aggiuntive..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className={isMobile ? "w-full" : ""}
                >
                  Annulla
                </Button>
                <Button type="submit" className={isMobile ? "w-full" : ""}>
                  {editingId ? "Aggiorna" : "Salva"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={isMobile ? "w-[95vw] p-4" : ""}>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa prenotazione? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className={isMobile ? "w-full" : ""}
            >
              Annulla
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className={isMobile ? "w-full" : ""}
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
