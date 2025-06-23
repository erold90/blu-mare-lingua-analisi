
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReservations } from "@/hooks/useReservations";
import { usePrices } from "@/hooks/usePrices";
import { getWeeksForYear } from "@/utils/price/dateUtils";
import { format, addDays, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { Copy, Calendar } from "lucide-react";
import { toast } from "sonner";

const AvailableWeeksSummary = () => {
  const { reservations, apartments } = useReservations();
  const { getPriceForWeek } = usePrices();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatedText, setGeneratedText] = useState("");

  // Genera il testo con le settimane disponibili
  const generateAvailabilityText = useMemo(() => {
    if (!apartments || apartments.length === 0) return "";

    const weeks = getWeeksForYear(selectedYear);
    let text = `SETTIMANE DISPONIBILI ${selectedYear} - VILLA MAREBLU\n`;
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
        text += `Nessuna settimana disponibile\n\n`;
      } else {
        availableWeeks.forEach(week => {
          const weekStart = startOfWeek(week.start, { weekStartsOn: 6 }); // Sabato
          const weekEnd = addDays(weekStart, 6); // Venerdì
          const price = getPriceForWeek(apartment.id, weekStart);
          
          const startFormatted = format(weekStart, "d MMM", { locale: it });
          const endFormatted = format(weekEnd, "d MMM", { locale: it });
          
          text += `• ${startFormatted} - ${endFormatted}: €${price || 'N/D'}\n`;
        });
        text += `\n`;
      }
    });

    text += `Generato il: ${format(new Date(), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}\n`;
    text += `Villa MareBlu - Marina di Pescoluse`;

    return text;
  }, [apartments, reservations, selectedYear, getPriceForWeek]);

  const handleGenerate = () => {
    setGeneratedText(generateAvailabilityText);
    toast.success("Testo generato con successo!");
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
          Riepilogo Settimane Disponibili
        </CardTitle>
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
            Genera Riepilogo
          </Button>
        </div>

        {generatedText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Testo generato (pronto per copiare):
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
              placeholder="Il testo generato apparirà qui..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableWeeksSummary;
