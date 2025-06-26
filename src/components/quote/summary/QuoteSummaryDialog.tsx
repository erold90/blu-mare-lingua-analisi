
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "@/utils/price/types";
import { Calendar, Users, Home, Euro, CheckCircle } from "lucide-react";

interface QuoteSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formValues?: FormValues;
  apartments?: Apartment[];
  priceInfo?: PriceCalculation;
}

// Helper function to format dates
const formatDate = (dateValue: string | Date | undefined): string => {
  if (!dateValue) return 'N/A';
  
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const QuoteSummaryDialog: React.FC<QuoteSummaryDialogProps> = ({
  open,
  onOpenChange,
  formValues,
  apartments,
  priceInfo,
}) => {
  if (!formValues || !apartments || !priceInfo) {
    return null;
  }

  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Riepilogo della Prenotazione
          </DialogTitle>
          <DialogDescription>
            Ecco il riepilogo completo del tuo preventivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date del soggiorno */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Date del soggiorno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Check-in</p>
                  <p className="font-medium">{formatDate(formValues.checkIn)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-out</p>
                  <p className="font-medium">{formatDate(formValues.checkOut)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Durata: <span className="font-medium">{priceInfo.nights} notti</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ospiti */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Ospiti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Adulti</p>
                  <p className="font-medium">{formValues.adults}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bambini</p>
                  <p className="font-medium">{formValues.children || 0}</p>
                </div>
              </div>
              {formValues.hasPets && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Animali domestici: <span className="font-medium">Sì</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appartamenti */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Home className="h-4 w-4" />
                Appartamenti selezionati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedApartments.map((apartment) => (
                  <div key={apartment.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{apartment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {apartment.capacity} ospiti • {apartment.bedrooms} camere
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {priceInfo.apartmentPrices?.[apartment.id] || 0}€
                      </p>
                      <p className="text-xs text-muted-foreground">{priceInfo.nights} notti</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Riepilogo prezzi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Euro className="h-4 w-4" />
                Riepilogo prezzi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prezzo base appartamenti:</span>
                  <span>{priceInfo.basePrice}€</span>
                </div>
                
                {priceInfo.extras > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servizi extra:</span>
                    <span>{priceInfo.extras}€</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pulizia finale:</span>
                  <span className="text-green-600">(inclusa)</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tassa di soggiorno:</span>
                  <span className="text-green-600">(inclusa)</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotale:</span>
                  <span>{priceInfo.totalBeforeDiscount}€</span>
                </div>
                
                {priceInfo.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Sconto:</span>
                    <span>-{priceInfo.discount}€</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Totale:</span>
                  <span>{priceInfo.totalAfterDiscount}€</span>
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Caparra (30%):</span>
                    <span className="font-medium">{priceInfo.deposit}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cauzione:</span>
                    <span className="font-medium">200€ (restituibile)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteSummaryDialog;
