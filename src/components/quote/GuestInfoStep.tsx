
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus, Minus, Users, BedDouble, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormValues } from "@/utils/quoteFormSchema";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface ChildDetail {
  isUnder12: boolean;
  sleepsWithParents: boolean;
  sleepsInCrib: boolean;
}

interface GuestInfoStepProps {
  form: UseFormReturn<FormValues>;
  childrenArray: ChildDetail[];
  openGroupDialog: () => void;
  incrementAdults: () => void;
  decrementAdults: () => void;
  incrementChildren: () => void;
  decrementChildren: () => void;
  updateChildDetails: (index: number, field: 'isUnder12' | 'sleepsWithParents' | 'sleepsInCrib', value: boolean) => void;
  nextStep: () => void;
}

const GuestInfoStep: React.FC<GuestInfoStepProps> = ({
  form,
  childrenArray,
  openGroupDialog,
  incrementAdults,
  decrementAdults,
  incrementChildren,
  decrementChildren,
  updateChildDetails,
  nextStep
}) => {
  const isMobile = useIsMobile();
  
  // Count children sleeping with parents or in cribs
  const childrenSleepingWithParents = childrenArray.filter(child => child.sleepsWithParents).length;
  const childrenSleepingInCribs = childrenArray.filter(child => child.sleepsInCrib).length;
  const childrenNotOccupyingBed = childrenSleepingWithParents + childrenSleepingInCribs;
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Informazioni sugli ospiti</CardTitle>
        <CardDescription>Indica il numero di ospiti che soggiorneranno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Numero di adulti */}
          <div className="space-y-2">
            <Label htmlFor="adults">Numero di adulti</Label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-3">
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
                  className="w-16 text-center"
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
              </div>
            </div>
          </div>
          
          {/* Numero di bambini */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="children">Numero di bambini</Label>
              
              {/* Badge showing children sleeping with parents or in cribs */}
              {childrenNotOccupyingBed > 0 && (
                <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                  <BedDouble className="h-3 w-3 mr-1" />
                  {childrenNotOccupyingBed} {childrenNotOccupyingBed === 1 ? "bambino non" : "bambini non"} occupa posto letto
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
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
                className="w-16 text-center"
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
        </div>
        
        {/* Mostra il pulsante per i gruppi se ci sono più di 3 adulti */}
        <div className="flex justify-center mt-2">
          {form.watch("adults") > 3 && !form.watch("isGroupBooking") && (
            <Button 
              type="button"
              variant="outline"
              className="gap-2 text-sm"
              onClick={openGroupDialog}
              size={isMobile ? "sm" : "default"}
            >
              <Users className="h-4 w-4" />
              {isMobile ? "Composizione" : "Specifica composizione gruppo"}
            </Button>
          )}
          
          {/* Badge che indica che è una prenotazione di gruppo */}
          {form.watch("isGroupBooking") && (
            <div className="flex flex-wrap items-center">
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
        
        {/* Dettagli dei bambini - mostrati solo se non è una prenotazione di gruppo */}
        {childrenArray.length > 0 && !form.watch("isGroupBooking") && (
          <div className="mt-2 border rounded-lg p-3">
            <h3 className="font-medium mb-2">Dettagli bambini</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {childrenArray.map((child, index) => (
                <div key={`child-${index}`} className="space-y-3 p-3 border rounded-md">
                  <h4 className="font-medium">Bambino {index + 1}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`under-12-${index}`}
                        checked={child.isUnder12}
                        onCheckedChange={(checked) => {
                          updateChildDetails(index, 'isUnder12', checked === true);
                        }}
                      />
                      <Label htmlFor={`under-12-${index}`}>Minore di 12 anni</Label>
                    </div>
                    
                    {/* Opzioni aggiuntive solo per bambini sotto i 12 anni */}
                    {child.isUnder12 && (
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`sleeps-with-parents-${index}`}
                            checked={child.sleepsWithParents}
                            onCheckedChange={(checked) => {
                              const newValue = checked === true;
                              updateChildDetails(index, 'sleepsWithParents', newValue);
                              // Se selezionato, deseleziona l'opzione culla
                              if (newValue && child.sleepsInCrib) {
                                updateChildDetails(index, 'sleepsInCrib', false);
                              }
                            }}
                          />
                          <Label htmlFor={`sleeps-with-parents-${index}`}>Dorme con i genitori</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`sleeps-in-crib-${index}`}
                            checked={child.sleepsInCrib}
                            onCheckedChange={(checked) => {
                              const newValue = checked === true;
                              updateChildDetails(index, 'sleepsInCrib', newValue);
                              // Se selezionato, deseleziona l'opzione dorme con i genitori
                              if (newValue && child.sleepsWithParents) {
                                updateChildDetails(index, 'sleepsWithParents', false);
                              }
                            }}
                          />
                          <Label htmlFor={`sleeps-in-crib-${index}`}>Dorme in culla</Label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add explanation about bed occupancy */}
            {childrenNotOccupyingBed > 0 && (
              <div className="mt-3 pt-3 border-t text-sm">
                {childrenSleepingWithParents > 0 && (
                  <p className="flex items-center text-blue-600 mb-2">
                    <BedDouble className="h-4 w-4 mr-2" />
                    {childrenSleepingWithParents} {childrenSleepingWithParents === 1 ? "bambino dorme" : "bambini dormono"} con i genitori (non occupa posto letto).
                  </p>
                )}
                {childrenSleepingInCribs > 0 && (
                  <p className="flex items-center text-green-600">
                    <Baby className="h-4 w-4 mr-2" />
                    {childrenSleepingInCribs} {childrenSleepingInCribs === 1 ? "bambino dorme" : "bambini dormono"} in culla (gratuito, non occupa posto letto).
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-2">
        <Button type="button" onClick={nextStep}>Avanti</Button>
      </CardFooter>
    </Card>
  );
};

export default GuestInfoStep;
