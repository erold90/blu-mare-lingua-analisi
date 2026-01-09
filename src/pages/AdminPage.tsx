import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Home, BarChart, Euro, LogOut, UserCog, Shield } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { apartments } from '@/data/apartments';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { PricingManagement } from '@/components/admin/PricingManagement';
import { VisitAnalytics } from '@/components/admin/VisitAnalytics';
import { UnifiedAnalyticsDashboard } from '@/components/admin/UnifiedAnalyticsDashboard';
import { QuoteRequestsManager } from '@/components/admin/QuoteRequestsManager';
import { ReservationsCalendar } from '@/components/admin/ReservationsCalendar';
import { ReservationsList } from '@/components/admin/ReservationsList';
import { ArchiveManager } from '@/components/admin/ArchiveManager';
import { ApartmentImageGallery } from '@/components/admin/ApartmentImageGallery';
import { HomeImageGallery } from '@/components/admin/HomeImageGallery';
import { SeasonalRevenueAnalytics } from '@/components/admin/SeasonalRevenueAnalytics';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { reservations, loading: reservationsLoading } = useReservations();
  const isMobile = useIsMobile();

  // Redirect if not authenticated or not admin
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-destructive">
              Accesso Negato
            </CardTitle>
            <CardDescription className="text-center">
              Non hai i permessi per accedere a questa area
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={signOut} variant="outline">
              Torna al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current reservations stats
  const today = new Date();
  const currentGuests = reservations.filter(r => {
    const startDate = new Date(r.start_date);
    const endDate = new Date(r.end_date);
    return startDate <= today && endDate >= today;
  }).length;

  const upcomingArrivals = reservations.filter(r => {
    const startDate = new Date(r.start_date);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const totalReservations = reservations.length;

  const tabOptions = [
    { value: 'dashboard', label: 'Dashboard', icon: Home },
    { value: 'reservations', label: 'Prenotazioni', icon: Calendar },
    { value: 'calendar', label: 'Calendario', icon: Calendar },
    { value: 'quotes', label: 'Preventivi', icon: Euro },
    { value: 'revenue', label: 'Ricavi', icon: BarChart },
    { value: 'pricing', label: 'Prezzi', icon: Euro },
    { value: 'analytics', label: 'Analisi', icon: BarChart },
    { value: 'security', label: 'Sicurezza', icon: Shield },
    { value: 'gallery', label: 'Gallerie', icon: Home },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                {isMobile ? 'Admin' : 'Area Amministrativa'}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">
                {user.email}
              </span>
              <Button
                onClick={signOut}
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-1 sm:gap-2 touch-manipulation"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Dropdown */}
          {isMobile ? (
            <div className="w-full">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue>
                    {tabOptions.find(tab => tab.value === activeTab)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {tabOptions.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <SelectItem key={tab.value} value={tab.value} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {tab.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : (
            /* Desktop Tabs */
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Prenotazioni
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendario
              </TabsTrigger>
              <TabsTrigger value="quotes" className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Preventivi
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Ricavi
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Prezzi
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Analisi
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sicurezza
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Gallerie
              </TabsTrigger>
            </TabsList>
          )}

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ospiti Attuali</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentGuests}</div>
                  <p className="text-xs text-muted-foreground">
                    Prenotazioni attive oggi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Arrivi Prossimi</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingArrivals}</div>
                  <p className="text-xs text-muted-foreground">
                    Nei prossimi 7 giorni
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totale Prenotazioni</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalReservations}</div>
                  <p className="text-xs text-muted-foreground">
                    Tutte le prenotazioni
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>Prenotazioni Recenti</CardTitle>
              </CardHeader>
              <CardContent>
                {reservationsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : reservations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nessuna prenotazione trovata
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{reservation.guest_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reservation.start_date), 'dd MMM', { locale: it })} - {format(new Date(reservation.end_date), 'dd MMM yyyy', { locale: it })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{reservation.final_price}</p>
                          <Badge variant="outline">{reservation.adults + (reservation.children || 0)} ospiti</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reservations Management */}
          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Prenotazioni</CardTitle>
              </CardHeader>
              <CardContent>
                <ReservationsList />
              </CardContent>
            </Card>

            <ArchiveManager />
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <ReservationsCalendar reservations={reservations} />
          </TabsContent>

          {/* Quote Requests */}
          <TabsContent value="quotes">
            <QuoteRequestsManager />
          </TabsContent>

          {/* Revenue Analytics */}
          <TabsContent value="revenue">
            <SeasonalRevenueAnalytics />
          </TabsContent>

          {/* Pricing Management */}
          <TabsContent value="pricing">
            <PricingManagement />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Tabs defaultValue="unified" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="unified">Sessioni & Funnel</TabsTrigger>
                <TabsTrigger value="visits">Visite Geografiche</TabsTrigger>
              </TabsList>
              <TabsContent value="unified">
                <UnifiedAnalyticsDashboard />
              </TabsContent>
              <TabsContent value="visits">
                <VisitAnalytics />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Security Dashboard */}
          <TabsContent value="security">
            <SecurityDashboard />
          </TabsContent>

          {/* Gallery Management */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Galleria Appartamenti</CardTitle>
                </CardHeader>
                <CardContent>
                  <ApartmentImageGallery />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Galleria Home Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <HomeImageGallery />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}