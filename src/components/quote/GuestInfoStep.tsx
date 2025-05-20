
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus, Minus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormValues } from "@/utils/quoteFormSchema";
import { useIsMobile } from "@/hooks/use-mobile";

interface GuestInfoStepProps {
  form: UseFormReturn<FormValues>;
  childrenArray: { age: number; sleepsWithParents: boolean }[];
  openGroupDialog: () => void;
  incrementAdults: () => void;
  decrementAdults: () => void;
  incrementChildren: () => void;
  decrementChildren: () => void;
  updateChildDetails: (index: number, field: 'age' | 'sleepsWithParents', value: number | boolean) => void;
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni sugli ospiti</CardTitle>
        <CardDescription>Indica il numero di ospiti che soggiorneranno a Villa MareBlu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Numero di adulti */}
        <div className="space-y-2">
          <Label htmlFor="adults">Numero di adulti</Label>
          <div className="flex flex-wrap items-center gap-4">
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
            </div>
            
            {/* Mostra il pulsante per i gruppi se ci sono più di 3 adulti */}
            {form.watch("adults") > 3 && !form.watch("isGroupBooking") && (
              <Button 
                type="button"
                variant="outline"
                className="mt-0 flex items-center gap-2 text-sm"
                onClick={openGroupDialog}
                size={isMobile ? "sm" : "default"}
              >
                <Users className="h-4 w-4" />
                {isMobile ? "Composizione" : "Specifica composizione gruppo"}
              </Button>
            )}
            
            {/* Badge che indica che è una prenotazione di gruppo */}
            {form.watch("isGroupBooking") && (
              <div className="flex flex-wrap items-center mt-0">
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
  );
};

export default GuestInfoStep;
