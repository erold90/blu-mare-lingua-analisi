
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReservations } from "@/hooks/useReservations";
import { usePrices } from "@/hooks/usePrices";
import { format, addDays, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { Copy, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getPriceForWeekSync } from "@/utils/price/weeklyPrice";

// Get summer season weeks (Saturday to Friday) for a specific year
const getSummerWeeksForYear = (year: number): { start: Date; end: Date }[] => {
  const weeks: { start: Date; end: Date }[] = [];
  
  // Start from first Saturday of June (approximately June 2-8)
  let currentDate = new Date(year, 5, 1); // June 1st
  while (currentDate.getDay() !== 6) { // Find first Saturday
    currentDate = addDays(currentDate, 1);
  }
  
  // End at the week that includes October 5th
  const endDate = new Date(year, 9, 5); // October 5th
  
  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = addDays(currentDate, 6); // End on Friday
    
    // Only add if the week end is before or on October 5th
    if (weekEnd <= endDate) {
      weeks.push({
        start: weekStart,
        end: weekEnd
      });
    }
    
    currentDate = addDays(currentDate, 7); // Next Saturday
  }
  
  return weeks;
};

const AvailableWeeksSummary = () => {
  const { reservations, apartments } = useReservations();
  const { prices } = usePrices();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatedText, setGeneratedText] = useState("");

  // Genera il testo con le settimane disponibili della stagione estiva
  const generateAvailabilityText = useMemo(() => {
    if (!apartments || apartments.length === 0) return "";

    const weeks = getSummerWeeksForYear(selectedYear);
    let text = `RIEPILOGO STAGIONE ESTIVA ${selectedYear} - VILLA MAREBLU\n`;
    text += `Periodo: 2 Giugno - 5 Ottobre\n`;
    text += `${"=".repeat(50)}\n\n`;

    apartments.forEach(apartment => {
      text += `${apartment.name.toUpperCase()}\n`;
      text += `${"-".repeat(apartment.name.length)}\n`;

      const availableWeeks = weeks.filter(week => {
        // Controlla se la settimana è libera (nessuna prenotazione sovrapposta)
        const isOccupied = reservations.some(reservation => {
          if (!reservation.apartmentIds.includes(apartment.id)) return false;

          const resStart = new Date(reservation.startDate);
          const resEnd = new Date(reservation.endDate);
          
          // Normalizza le date
          resStart.setHours(0, 0, 0, 0);
          resEnd.setHours(0, 0, 0, 0);
          
          const weekStart = new Date(week.start);
          const weekEnd = addDays(weekStart, 6); // Fine settimana (venerdì)
          weekStart.setHours(0, 0, 0, 0);
          weekEnd.setHours(23, 59, 59, 999);

          // Verifica sovrapposizione
          return resStart <= weekEnd && resEnd >= weekStart;
        });

        return !isOccupied;
      });

      if (availableWeeks.length === 0) {
        text += `Nessuna settimana disponibile nella stagione estiva\n\n`;
      } else {
        availableWeeks.forEach(week => {
          const weekStart = startOfWeek(week.start, { weekStartsOn: 6 }); // Sabato
          const weekEnd = addDays(weekStart, 6); // Venerdì
          
          // Usa la funzione sincrona per ottenere il prezzo
          let price = 0;
          
          // Prima prova a cercare il prezzo nei dati caricati
          if (prices && prices.length > 0) {
            const searchDateStr = weekStart.toISOString().split('T')[0];
            const priceRecord = prices.find(
              (p: any) => p.apartment_id === apartment.id && p.week_start === searchDateStr
            );
            
            if (priceRecord) {
              price = Number(priceRecord.price);
            } else {
              // Fallback alla funzione sincrona che cerca in localStorage
              price = getPriceForWeekSync(apartment.id, weekStart);
            }
          } else {
            // Se non ci sono prezzi caricati, usa la funzione sincrona
            price = getPriceForWeekSync(apartment.id, weekStart);
          }
          
          const startFormatted = format(weekStart, "d MMM", { locale: it });
          const endFormatted = format(weekEnd, "d MMM", { locale: it });
          
          text += `• ${startFormatted} - ${endFormatted}: €${price > 0 ? price : 'N/D'}\n`;
        });
        text += `\n`;
      }
    });

    text += `Generato il: ${format(new Date(), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}\n`;
    text += `Villa MareBlu - Marina di Pescoluse`;

    return text;
  }, [apartments, reservations, selectedYear, prices]);

  const handleGenerate = () => {
    setGeneratedText(generateAvailabilityText);
    toast.success("Riepilogo stagione estiva generato con successo!");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      toast.success("Testo copiato negli appunti!");
    } catch (error) {
      toast.error("Errore nel copiare il testo");
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Riepilogo Stagione Estiva
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Settimane disponibili dal 2 Giugno al 5 Ottobre per l'anno selezionato
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-sm font-medium">
              Anno:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <Button onClick={handleGenerate} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Genera Riepilogo Estivo
          </Button>
        </div>

        {generatedText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Riepilogo stagione estiva (pronto per copiare):
              </label>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copia
              </Button>
            </div>
            
            <Textarea
              value={generatedText}
              readOnly
              rows={20}
              className="font-mono text-sm resize-none"
              placeholder="Il riepilogo della stagione estiva apparirà qui..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableWeeksSummary;
