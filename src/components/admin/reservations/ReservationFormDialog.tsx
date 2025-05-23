
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Reservation, Apartment } from "@/hooks/useReservations";
import { ReservationFormData, reservationSchema } from "./reservationSchema";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface ReservationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  apartments: Apartment[];
  onSubmit: (data: ReservationFormData) => void;
  initialData?: Reservation | null;
}

export const ReservationFormDialog = ({ 
  isOpen, 
  onOpenChange, 
  editingId, 
  apartments, 
  onSubmit,
  initialData 
}: ReservationFormDialogProps) => {
  const isMobile = useIsMobile();

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: initialData ? {
      id: initialData.id,
      guestName: initialData.guestName,
      adults: initialData.adults,
      children: initialData.children,
      cribs: initialData.cribs,
      hasPets: initialData.hasPets,
      apartmentIds: initialData.apartmentIds,
      startDate: new Date(initialData.startDate),
      endDate: new Date(initialData.endDate),
      finalPrice: initialData.finalPrice,
      paymentMethod: initialData.paymentMethod,
      paymentStatus: initialData.paymentStatus,
      depositAmount: initialData.depositAmount || 0,
      notes: initialData.notes
    } : {
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

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        guestName: initialData.guestName,
        adults: initialData.adults,
        children: initialData.children,
        cribs: initialData.cribs,
        hasPets: initialData.hasPets,
        apartmentIds: initialData.apartmentIds,
        startDate: new Date(initialData.startDate),
        endDate: new Date(initialData.endDate),
        finalPrice: initialData.finalPrice,
        paymentMethod: initialData.paymentMethod,
        paymentStatus: initialData.paymentStatus,
        depositAmount: initialData.depositAmount || 0,
        notes: initialData.notes
      });
    } else {
      form.reset({
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
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = (data: ReservationFormData) => {
    onSubmit(data);
  };

  // Handle date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      form.setValue("startDate", range.from);
    }
    if (range?.to) {
      form.setValue("endDate", range.to);
    }
  };

  // Get current date range from form values
  const getCurrentDateRange = (): DateRange | undefined => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    
    if (startDate && endDate) {
      return { from: startDate, to: endDate };
    } else if (startDate) {
      return { from: startDate, to: undefined };
    }
    
    return undefined;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

              {/* Date Range Picker */}
              <FormItem className="flex flex-col">
                <FormLabel>Periodo Soggiorno</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !getCurrentDateRange() && "text-muted-foreground"
                        )}
                      >
                        {getCurrentDateRange()?.from ? (
                          getCurrentDateRange()?.to ? (
                            <>
                              {format(getCurrentDateRange()!.from!, "dd/MM/yyyy")} -{" "}
                              {format(getCurrentDateRange()!.to!, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(getCurrentDateRange()!.from!, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Seleziona check-in e check-out</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={getCurrentDateRange()?.from}
                      selected={getCurrentDateRange()}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={1}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs">
                  Seleziona prima la data di check-in, poi quella di check-out
                </FormDescription>
              </FormItem>
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
                        value={field.value}
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
                        value={field.value}
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
                onClick={() => onOpenChange(false)}
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
  );
};
