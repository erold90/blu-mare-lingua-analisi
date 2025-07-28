import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Building, 
  Euro, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  color = "blue"
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  color?: "blue" | "green" | "amber" | "purple";
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <Card className="border-slate-200/60 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickAction = ({ 
  title, 
  description, 
  icon: Icon, 
  href,
  color = "blue"
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color?: "blue" | "green" | "amber" | "purple";
}) => {
  const navigate = useNavigate();
  
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-300 hover:bg-blue-50/30",
    green: "border-green-200 hover:border-green-300 hover:bg-green-50/30",
    amber: "border-amber-200 hover:border-amber-300 hover:bg-amber-50/30",
    purple: "border-purple-200 hover:border-purple-300 hover:bg-purple-50/30"
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${colorClasses[color]}`}
      onClick={() => navigate(href)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-slate-600" />
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export function ModernDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benvenuto nella Dashboard</h1>
          <p className="text-slate-500">Ecco una panoramica della situazione attuale</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Prenotazioni Oggi"
          value="12"
          description="Check-in e check-out"
          icon={Calendar}
          trend="+8% rispetto a ieri"
          color="blue"
        />
        <StatCard
          title="Appartamenti Occupati"
          value="3/4"
          description="Tasso di occupazione 75%"
          icon={Building}
          trend="+15% questo mese"
          color="green"
        />
        <StatCard
          title="Fatturato Mensile"
          value="€12,450"
          description="Luglio 2025"
          icon={Euro}
          trend="+22% rispetto al mese scorso"
          color="purple"
        />
        <StatCard
          title="Ospiti Totali"
          value="28"
          description="In struttura oggi"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Attività Recenti */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-slate-900">Attività Recenti</CardTitle>
              <CardDescription>Le ultime azioni nel sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Nuova prenotazione confermata", time: "2 minuti fa", status: "success" },
                  { action: "Check-out completato - App. 2", time: "15 minuti fa", status: "info" },
                  { action: "Pulizia programmata - App. 1", time: "1 ora fa", status: "warning" },
                  { action: "Nuovo preventivo richiesto", time: "2 ore fa", status: "info" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <div className={`h-2 w-2 rounded-full ${
                      item.status === 'success' ? 'bg-green-500' :
                      item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.action}</p>
                      <p className="text-xs text-slate-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-slate-900">Azioni Rapide</CardTitle>
              <CardDescription>Accedi rapidamente alle funzioni principali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickAction
                title="Nuova Prenotazione"
                description="Aggiungi una prenotazione"
                icon={Calendar}
                href="/area-riservata/prenotazioni"
                color="blue"
              />
              <QuickAction
                title="Gestisci Prezzi"
                description="Aggiorna le tariffe"
                icon={Euro}
                href="/area-riservata/prezzi"
                color="green"
              />
              <QuickAction
                title="Programma Pulizie"
                description="Organizza le pulizie"
                icon={Clock}
                href="/area-riservata/pulizie"
                color="amber"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avvisi */}
      <Card className="border-amber-200/60 bg-amber-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900">Avvisi Importanti</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-amber-800">
              • 2 appartamenti necessitano di pulizie programmate per domani
            </p>
            <p className="text-sm text-amber-800">
              • Check-in previsto alle 15:00 per Appartamento 3
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}