
import * as React from "react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MockDatabaseService } from "@/utils/mockDatabaseService";
import { toast } from "sonner";

/**
 * Componente per attivare/disattivare il database simulato
 */
const MockDatabaseToggle: React.FC = () => {
  const [useMockDb, setUseMockDb] = useState<boolean>(false);

  // Controlla se la modalità simulazione è attiva
  useEffect(() => {
    const isActive = MockDatabaseService.isActive();
    setUseMockDb(isActive);
  }, []);

  // Gestisce il cambio di stato
  const handleToggle = (checked: boolean) => {
    MockDatabaseService.toggleActive(checked);
    setUseMockDb(checked);

    if (checked) {
      toast.success("Modalità database simulato attivata", {
        description: "I dati verranno caricati dal database di test locale"
      });
    } else {
      toast.info("Modalità database simulato disattivata", {
        description: "L'app tenterà di connettersi al database remoto"
      });
    }

    // Ricarica la pagina per applicare i cambiamenti
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modalità Test Database</CardTitle>
        <CardDescription>
          Attiva questa opzione per utilizzare un database simulato quando quello reale non è disponibile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="mock-db-toggle" className="flex-1">
            Utilizza database simulato
          </Label>
          <Switch
            id="mock-db-toggle"
            checked={useMockDb}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className={`p-3 text-sm rounded-md ${useMockDb ? "bg-green-50 text-green-800 border border-green-200" : "bg-muted text-muted-foreground"}`}>
          {useMockDb ? (
            <>
              <p className="font-medium">Database simulato attivo</p>
              <p className="mt-1">Vengono utilizzati dati di esempio per testare l'applicazione.</p>
            </>
          ) : (
            <>
              <p className="font-medium">Database reale in uso</p>
              <p className="mt-1">L'applicazione tenta di connettersi al database remoto.</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MockDatabaseToggle;
