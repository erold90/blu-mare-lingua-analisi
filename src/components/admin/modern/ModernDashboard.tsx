import React, { useState, useEffect, useCallback } from "react";
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
  ArrowRight,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/components/auth/AdminAuthProvider";

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
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [stats, setStats] = useState({
    reservationsToday: 0,
    occupiedApartments: 0,
    totalApartments: 4,
    monthlyRevenue: 0,
    totalGuests: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica le statistiche dal database
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🏠 Dashboard: Fetching dashboard data...');
      
      // Prima verifica se l'utente è autenticato
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Current session:', session?.user?.email || 'No session');
      
      // Carica prenotazioni
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (reservationsError) {
        console.error('❌ Error fetching reservations:', reservationsError);
        return;
      }

      console.log('✅ Reservations loaded:', reservations?.length || 0);

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Calcola statistiche
      const reservationsToday = reservations?.filter(r => {
        const startDate = new Date(r.start_date);
        const endDate = new Date(r.end_date);
        return startDate <= today && endDate >= today;
      }).length || 0;

      const monthlyReservations = reservations?.filter(r => {
        const startDate = new Date(r.start_date);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      }) || [];

      const monthlyRevenue = monthlyReservations.reduce((sum, r) => sum + (r.final_price || 0), 0);

      const currentGuests = reservations?.filter(r => {
        const startDate = new Date(r.start_date);
        const endDate = new Date(r.end_date);
        return startDate <= today && endDate >= today;
      }).reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0) || 0;

      setStats({
        reservationsToday,
        occupiedApartments: reservationsToday,
        totalApartments: 4,
        monthlyRevenue,
        totalGuests: currentGuests
      });

      // Attività recenti (ultime 5 prenotazioni)
      const activities = reservations?.slice(0, 4).map(r => ({
        action: `Prenotazione di ${r.guest_name}`,
        time: getTimeAgo(r.created_at),
        status: 'info'
      })) || [];

      setRecentActivities(activities);
      console.log('Dashboard data loaded successfully');

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    } else {
      return 'Pochi minuti fa';
    }
  };

  useEffect(() => {
    // Solo se l'autenticazione è completata e l'utente è autenticato
    if (!authLoading && isAuthenticated) {
      console.log('🏠 Dashboard: Starting fetchDashboardData');
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated, fetchDashboardData]);

  // Real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservations' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, fetchDashboardData]);

  if (authLoading || loading) {
    return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="ml-2 text-slate-600">
            {authLoading ? 'Verifica autenticazione...' : 'Caricamento dashboard...'}
            <div className="text-xs text-slate-400 mt-1">
              Configurazione permessi completata. Ricarica la pagina se il caricamento continua.
            </div>
          </div>
        </div>
    );
  }
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
          title="Prenotazioni Attive"
          value={stats.reservationsToday.toString()}
          description="In corso oggi"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Appartamenti Occupati"
          value={`${stats.occupiedApartments}/${stats.totalApartments}`}
          description={`Tasso di occupazione ${Math.round((stats.occupiedApartments / stats.totalApartments) * 100)}%`}
          icon={Building}
          color="green"
        />
        <StatCard
          title="Fatturato Mensile"
          value={`€${stats.monthlyRevenue.toLocaleString()}`}
          description={`${new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`}
          icon={Euro}
          color="purple"
        />
        <StatCard
          title="Ospiti Totali"
          value={stats.totalGuests.toString()}
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
                {recentActivities.length > 0 ? recentActivities.map((item, index) => (
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
                )) : (
                  <p className="text-sm text-slate-500">Nessuna attività recente</p>
                )}
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
              • {stats.reservationsToday} prenotazioni attive oggi
            </p>
            <p className="text-sm text-amber-800">
              • {stats.totalGuests} ospiti totali in struttura
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}