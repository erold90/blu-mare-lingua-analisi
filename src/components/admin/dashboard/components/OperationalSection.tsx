
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Calendar, 
  CleaningServices, 
  Plus,
  Eye,
  ArrowRight
} from "lucide-react";

// Import existing components
import { ActiveReservations } from "../ActiveReservations";
import { CleaningStats } from "../CleaningStats";

interface OperationalSectionProps {
  data: any;
}

const OperationalSection: React.FC<OperationalSectionProps> = ({ data }) => {
  const {
    activeReservations,
    apartments,
    cleaningStats
  } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Prenotazioni Attive */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Prenotazioni Attive
              <Badge variant="outline" className="ml-2">
                {activeReservations.length} attive
              </Badge>
            </span>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Vedi tutte
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeReservations.length > 0 ? (
            <ActiveReservations 
              activeReservations={activeReservations}
              apartments={apartments}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessuna prenotazione attiva oggi</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi prenotazione
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stato Pulizie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CleaningServices className="h-5 w-5 text-green-600" />
              Stato Pulizie
            </span>
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CleaningStats cleaningStats={cleaningStats} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationalSection;
