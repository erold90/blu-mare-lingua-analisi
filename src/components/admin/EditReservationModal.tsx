import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useReservations, Reservation } from '@/hooks/useReservations';
import { apartments } from '@/data/apartments';
import { toast } from 'sonner';

const formSchema = z.object({
  guest_name: z.string().min(2, 'Il nome è obbligatorio'),
  guest_phone: z.string().optional(),
  start_date: z.date({ required_error: 'La data di inizio è obbligatoria' }),
  end_date: z.date({ required_error: 'La data di fine è obbligatoria' }),
  apartment_ids: z.array(z.string()).min(1, 'Seleziona almeno un appartamento'),
  adults: z.number().min(1, 'Almeno un adulto richiesto'),
  children: z.number().min(0),
  cribs: z.number().min(0),
  has_pets: z.boolean(),
  linen_option: z.enum(['yes', 'no', 'partial']),
  final_price: z.number().min(0, 'Il prezzo deve essere positivo'),
  deposit_amount: z.number().min(0),
  payment_status: z.enum(['paid', 'deposit', 'notPaid']),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditReservationModalProps {
  reservation: Reservation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReservationModal({ reservation, open, onOpenChange }: EditReservationModalProps) {
  const { updateReservation } = useReservations();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (reservation) {
      const apartmentIds = Array.isArray(reservation.apartment_ids) 
        ? reservation.apartment_ids 
        : [];

      form.reset({
        guest_name: reservation.guest_name,
        guest_phone: reservation.guest_phone || '',
        start_date: parseISO(reservation.start_date),
        end_date: parseISO(reservation.end_date),
        apartment_ids: apartmentIds,
        adults: reservation.adults,
        children: reservation.children,
        cribs: reservation.cribs,
        has_pets: reservation.has_pets,
        linen_option: reservation.linen_option as 'yes' | 'no' | 'partial',
        final_price: reservation.final_price || 0,
        deposit_amount: reservation.deposit_amount || 0,
        payment_status: (reservation.payment_status as 'paid' | 'deposit' | 'notPaid') || 'notPaid',
        payment_method: reservation.payment_method || 'cash',
        notes: reservation.notes || '',
      });
    }
  }, [reservation, form]);

  const onSubmit = async (data: FormData) => {
    const updatedData = {
      ...data,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: format(data.end_date, 'yyyy-MM-dd'),
    };

    const { error } = await updateReservation(reservation.id, updatedData);

    if (error) {
      toast.error('Errore durante l\'aggiornamento della prenotazione');
    } else {
      toast.success('Prenotazione aggiornata con successo');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Prenotazione</DialogTitle>
          <DialogDescription>
            Aggiorna i dettagli della prenotazione
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Guest Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guest_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Ospite *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mario Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guest_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input placeholder="+39 333 1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Inizio *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'dd/MM/yyyy') : 'Seleziona data'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Fine *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'dd/MM/yyyy') : 'Seleziona data'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Apartments */}
            <FormField
              control={form.control}
              name="apartment_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Appartamenti *</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {apartments.map((apt) => (
                      <FormField
                        key={apt.id}
                        control={form.control}
                        name="apartment_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(`appartamento-${apt.id}`)}
                                onCheckedChange={(checked) => {
                                  const aptId = `appartamento-${apt.id}`;
                                  return checked
                                    ? field.onChange([...field.value, aptId])
                                    : field.onChange(field.value?.filter((id) => id !== aptId));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {apt.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Guests */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adulti *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="has_pets"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Ha animali domestici</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linen_option"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biancheria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Sì</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="partial">Parziale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="final_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prezzo Finale (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deposit_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acconto (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato Pagamento *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Pagato</SelectItem>
                        <SelectItem value="deposit">Acconto</SelectItem>
                        <SelectItem value="notPaid">Non Pagato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodo Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Contanti</SelectItem>
                        <SelectItem value="card">Carta</SelectItem>
                        <SelectItem value="bank_transfer">Bonifico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Note aggiuntive..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit">Salva Modifiche</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
