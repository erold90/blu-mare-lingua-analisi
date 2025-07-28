
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
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-border/50 pb-6 mb-8">
        <h2 className="text-2xl font-light mb-2">Ospiti</h2>
        <p className="text-muted-foreground font-light">Indica il numero di ospiti che soggiorneranno</p>
      </div>
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Numero di adulti */}
          <div className="space-y-4">
            <Label htmlFor="adults" className="text-sm font-medium uppercase tracking-wider">Adulti</Label>
            <div className="flex items-center space-x-4">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={decrementAdults}
                disabled={form.getValues("adults") <= 1}
                className="h-10 w-10 border border-border hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="adults"
                type="number"
                className="w-20 text-center border-0 border-b border-border rounded-none bg-transparent font-medium text-lg"
                {...form.register("adults", { valueAsNumber: true })}
                readOnly
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={incrementAdults}
                className="h-10 w-10 border border-border hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Numero di bambini */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="children" className="text-sm font-medium uppercase tracking-wider">Bambini</Label>
              
              {/* Badge showing children sleeping with parents or in cribs */}
              {childrenNotOccupyingBed > 0 && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <BedDouble className="h-3 w-3" />
                  {childrenNotOccupyingBed} non occupano letto
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={decrementChildren}
                disabled={form.getValues("children") <= 0}
                className="h-10 w-10 border border-border hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="children"
                type="number"
                className="w-20 text-center border-0 border-b border-border rounded-none bg-transparent font-medium text-lg"
                {...form.register("children", { valueAsNumber: true })}
                readOnly
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={incrementChildren}
                className="h-10 w-10 border border-border hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Gruppo section */}
        <div className="flex justify-center">
          {form.watch("adults") > 3 && !form.watch("isGroupBooking") && (
            <Button 
              type="button"
              variant="ghost"
              className="gap-2 text-sm border border-border hover:bg-muted"
              onClick={openGroupDialog}
              size="sm"
            >
              <Users className="h-4 w-4" />
              Configura gruppo
            </Button>
          )}
          
          {form.watch("isGroupBooking") && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                <Users className="h-3 w-3" />
                Gruppo configurato
              </span>
              <Button 
                type="button"
                variant="ghost"
                size="sm"
                onClick={openGroupDialog}
                className="text-xs underline"
              >
                Modifica
              </Button>
            </div>
          )}
        </div>
        
        {/* Dettagli bambini */}
        {childrenArray.length > 0 && !form.watch("isGroupBooking") && (
          <div className="space-y-6">
            <div className="border-t border-border/50 pt-6">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-6">Dettagli bambini</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {childrenArray.map((child, index) => (
                  <div key={`child-${index}`} className="space-y-4 p-4 border border-border/50">
                    <h4 className="font-medium text-sm uppercase tracking-wider">Bambino {index + 1}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id={`under-12-${index}`}
                          checked={child.isUnder12}
                          onCheckedChange={(checked) => {
                            updateChildDetails(index, 'isUnder12', checked === true);
                          }}
                        />
                        <Label htmlFor={`under-12-${index}`} className="text-sm">Minore di 12 anni</Label>
                      </div>
                      
                      {child.isUnder12 && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id={`sleeps-with-parents-${index}`}
                              checked={child.sleepsWithParents}
                              onCheckedChange={(checked) => {
                                const newValue = checked === true;
                                updateChildDetails(index, 'sleepsWithParents', newValue);
                                if (newValue && child.sleepsInCrib) {
                                  updateChildDetails(index, 'sleepsInCrib', false);
                                }
                              }}
                            />
                            <Label htmlFor={`sleeps-with-parents-${index}`} className="text-sm">Dorme con i genitori</Label>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id={`sleeps-in-crib-${index}`}
                              checked={child.sleepsInCrib}
                              onCheckedChange={(checked) => {
                                const newValue = checked === true;
                                updateChildDetails(index, 'sleepsInCrib', newValue);
                                if (newValue && child.sleepsWithParents) {
                                  updateChildDetails(index, 'sleepsWithParents', false);
                                }
                              }}
                            />
                            <Label htmlFor={`sleeps-in-crib-${index}`} className="text-sm">Dorme in culla</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {childrenNotOccupyingBed > 0 && (
                <div className="mt-6 pt-4 border-t border-border/50 text-sm text-muted-foreground space-y-1">
                  {childrenSleepingWithParents > 0 && (
                    <p className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4" />
                      {childrenSleepingWithParents} {childrenSleepingWithParents === 1 ? "bambino dorme" : "bambini dormono"} con i genitori
                    </p>
                  )}
                  {childrenSleepingInCribs > 0 && (
                    <p className="flex items-center gap-2">
                      <Baby className="h-4 w-4" />
                      {childrenSleepingInCribs} {childrenSleepingInCribs === 1 ? "bambino dorme" : "bambini dormono"} in culla (gratuito)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end pt-8 border-t border-border/50 mt-8">
        <Button type="button" onClick={nextStep} variant="default" className="px-8">
          Continua
        </Button>
      </div>
    </div>
  );
};

export default GuestInfoStep;
