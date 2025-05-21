
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";

export const BlockedDatesTab = () => {
  const { siteSettings, addBlockedDate, removeBlockedDate, isDateBlocked } = useSettings();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if date is already selected
    const dateIndex = selectedDates.findIndex(selectedDate => 
      isSameDay(selectedDate, date)
    );
    
    if (dateIndex !== -1) {
      // Remove date if already selected
      const newSelectedDates = [...selectedDates];
      newSelectedDates.splice(dateIndex, 1);
      setSelectedDates(newSelectedDates);
    } else {
      // Add date if not already selected
      setSelectedDates([...selectedDates, date]);
    }
  };
  
  const blockSelectedDates = () => {
    if (selectedDates.length === 0) {
      toast.error("Nessuna data selezionata");
      return;
    }
    
    selectedDates.forEach(date => {
      addBlockedDate(format(date, 'yyyy-MM-dd'));
    });
    
    toast.success(`${selectedDates.length} date bloccate`);
    setSelectedDates([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Date Bloccate</CardTitle>
        <CardDescription>
          Seleziona le date da bloccare per tutti gli appartamenti
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(date) => {
                if (Array.isArray(date)) {
                  setSelectedDates(date);
                } else {
                  handleDateSelect(date);
                }
              }}
              className="rounded-md border max-w-full"
              locale={it}
              disabled={(date) => isDateBlocked(date)}
            />
            <div className="mt-4">
              <Button 
                onClick={blockSelectedDates}
                disabled={selectedDates.length === 0}
              >
                Blocca date selezionate
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Date attualmente bloccate</h3>
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-4">
              {siteSettings.blockedDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {siteSettings.blockedDates
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                    .map((dateStr, index) => {
                      const date = new Date(dateStr);
                      return (
                        <Badge key={index} variant="outline" className="flex gap-1 items-center">
                          {format(date, 'dd/MM/yyyy', { locale: it })}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full ml-1 hover:bg-destructive/20"
                            onClick={() => {
                              removeBlockedDate(dateStr);
                              toast.success("Data sbloccata");
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessuna data bloccata
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
