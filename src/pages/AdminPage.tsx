import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Home, BarChart } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    localStorage.getItem('admin-auth') === 'true'
  );
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const { reservations, loading } = useReservations();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === LOGIN_CREDENTIALS.username && 
        loginData.password === LOGIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      localStorage.setItem('admin-auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Credenziali non valide');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin-auth');
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Area Riservata</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Inserisci username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Inserisci password"
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm">{loginError}</p>
              )}
              <Button type="submit" className="w-full">
                Accedi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  const upcomingReservations = reservations
    .filter(r => new Date(r.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  const currentReservations = reservations
    .filter(r => {
      const now = new Date();
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return start <= now && end >= now;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Area Riservata Villa MareBlu</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prenotazioni
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Prenotazioni Totali
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reservations.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Ospiti Attuali
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{currentReservations.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Prossimi Arrivi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{upcomingReservations.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>Prossime Prenotazioni</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Caricamento...</p>
                ) : upcomingReservations.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingReservations.map((reservation) => (
                      <div key={reservation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{reservation.guest_name}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(reservation.start_date), 'dd MMMM yyyy', { locale: it })} - {' '}
                            {format(new Date(reservation.end_date), 'dd MMMM yyyy', { locale: it })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {reservation.adults} adulti
                            {reservation.children > 0 && `, ${reservation.children} bambini`}
                          </Badge>
                          {reservation.final_price && (
                            <Badge>€{reservation.final_price}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nessuna prenotazione in arrivo</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tutte le Prenotazioni</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Caricamento...</p>
                ) : reservations.length > 0 ? (
                  <div className="space-y-3">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{reservation.guest_name}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(reservation.start_date), 'dd/MM/yyyy')} - {' '}
                            {format(new Date(reservation.end_date), 'dd/MM/yyyy')}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {reservation.id}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {reservation.adults} adulti
                              {reservation.children > 0 && `, ${reservation.children} bambini`}
                            </Badge>
                          </div>
                          {reservation.final_price && (
                            <div className="font-medium">€{reservation.final_price}</div>
                          )}
                          {reservation.payment_status && (
                            <Badge 
                              variant={reservation.payment_status === 'paid' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {reservation.payment_status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nessuna prenotazione trovata</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}