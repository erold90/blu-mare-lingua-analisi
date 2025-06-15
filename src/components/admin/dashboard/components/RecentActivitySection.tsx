
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  ArrowUpDown, 
  Eye,
  Calendar as CalendarIcon,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Import existing component
import { UpcomingMovements } from "../UpcomingMovements";

interface RecentActivitySectionProps {
  data: any;
}

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ data }) => {
  const {
    upcomingMovements,
    apartments
  } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Prossimi Movimenti
            <Badge variant="outline" className="ml-2">
              Prossimi 7 giorni
            </Badge>
          </span>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Calendario completo
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingMovements.length > 0 ? (
          <UpcomingMovements 
            upcomingMovements={upcomingMovements}
            apartments={apartments}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium mb-1">Nessun movimento programmato</p>
            <p className="text-sm">Non ci sono check-in o check-out nei prossimi 7 giorni</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-700">
                Periodo tranquillo - perfetto per manutenzione programmata
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivitySection;
