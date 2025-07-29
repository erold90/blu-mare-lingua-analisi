import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, Home, BarChart, Plus, Edit, Trash2, Euro, ArrowLeft, Receipt, ImageIcon, TrendingUp } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { apartments } from '@/data/apartments';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import { PricingManagement } from '@/components/admin/PricingManagement';
import { VisitAnalytics } from '@/components/admin/VisitAnalytics';
import { QuoteRequestsManager } from '@/components/admin/QuoteRequestsManager';
import { ReservationsCalendar } from '@/components/admin/ReservationsCalendar';
import { ApartmentImageGallery } from '@/components/admin/ApartmentImageGallery';
import { HomeImageGallery } from '@/components/admin/HomeImageGallery';
import { SeasonalRevenueAnalytics } from '@/components/admin/SeasonalRevenueAnalytics';

const LOGIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    localStorage.getItem('admin-auth') === 'true'
  );
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('pricing');
  const { reservations, loading, addReservation, updateReservation, deleteReservation, fetchReservations } = useReservations();

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

  // New reservation form state
  const [newReservation, setNewReservation] = useState({
    guest_name: '',
    start_date: '',
    end_date: '',
    apartment_ids: [] as string[],
    adults: 1,
    children: 0,
    cribs: 0,
    has_pets: false,
    linen_option: 'no',
    final_price: '',
    deposit_amount: '',
    payment_status: 'notPaid',
    payment_method: 'cash',
    notes: ''
  });

  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Handle add reservation
  const handleAddReservation = async () => {
    if (!newReservation.guest_name || !newReservation.start_date || !newReservation.end_date) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    const result = await addReservation({
      ...newReservation,
      final_price: parseFloat(newReservation.final_price) || 0,
      deposit_amount: parseFloat(newReservation.deposit_amount) || 0,
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    if (result.error) {
      toast.error('Errore nell\'aggiunta della prenotazione: ' + result.error);
    } else {
      toast.success('Prenotazione aggiunta con successo!');
      setShowAddDialog(false);
      setNewReservation({
        guest_name: '',
        start_date: '',
        end_date: '',
        apartment_ids: [],
        adults: 1,
        children: 0,
        cribs: 0,
        has_pets: false,
        linen_option: 'no',
        final_price: '',
        deposit_amount: '',
        payment_status: 'notPaid',
        payment_method: 'cash',
        notes: ''
      });
    }
  };

  // Handle edit reservation
  const handleEditReservation = async () => {
    if (!editingReservation) return;

    const result = await updateReservation(editingReservation.id, editingReservation);

    if (result.error) {
      toast.error('Errore nella modifica della prenotazione: ' + result.error);
    } else {
      toast.success('Prenotazione modificata con successo!');
      setShowEditDialog(false);
      setEditingReservation(null);
    }
  };

  // Handle delete reservation
  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;

    const result = await deleteReservation(id);

    if (result.error) {
      toast.error('Errore nell\'eliminazione della prenotazione: ' + result.error);
    } else {
      toast.success('Prenotazione eliminata con successo!');
    }
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
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Home
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Area Riservata Villa MareBlu</h1>
          </div>
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
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Preventivi
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Visite
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ricavi Estivi
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Prenotazioni
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Prezzi
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Galleria Appartamenti
            </TabsTrigger>
            <TabsTrigger value="home-gallery" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Galleria Home
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <SeasonalRevenueAnalytics />
          </TabsContent>
          
          <TabsContent value="quotes" className="space-y-6">
            <QuoteRequestsManager />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <VisitAnalytics />
          </TabsContent>
          
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

          <TabsContent value="calendar" className="space-y-6">
            <ReservationsCalendar reservations={reservations} />
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Tutte le Prenotazioni</CardTitle>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nuova Prenotazione
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Aggiungi Nuova Prenotazione</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="guest_name">Nome Ospite *</Label>
                          <Input
                            id="guest_name"
                            value={newReservation.guest_name}
                            onChange={(e) => setNewReservation(prev => ({ ...prev, guest_name: e.target.value }))}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="start_date">Data Check-in *</Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={newReservation.start_date}
                            onChange={(e) => setNewReservation(prev => ({ ...prev, start_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_date">Data Check-out *</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={newReservation.end_date}
                            onChange={(e) => setNewReservation(prev => ({ ...prev, end_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="adults">Adulti</Label>
                          <Input
                            id="adults"
                            type="number"
                            min="1"
                            value={newReservation.adults}
                            onChange={(e) => setNewReservation(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="children">Bambini</Label>
                          <Input
                            id="children"
                            type="number"
                            min="0"
                            value={newReservation.children}
                            onChange={(e) => setNewReservation(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="apartment">Appartamento</Label>
                          <Select 
                            value={newReservation.apartment_ids[0] || ''} 
                            onValueChange={(value) => setNewReservation(prev => ({ ...prev, apartment_ids: [value] }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona appartamento" />
                            </SelectTrigger>
                            <SelectContent>
                              {apartments.map(apt => (
                                <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="final_price">Prezzo Finale €</Label>
                          <Input
                            id="final_price"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newReservation.final_price}
                            onChange={(e) => setNewReservation(prev => ({ ...prev, final_price: e.target.value }))}
                            placeholder="Inserisci l'importo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="payment_status">Stato Pagamento</Label>
                          <Select 
                            value={newReservation.payment_status} 
                            onValueChange={(value) => setNewReservation(prev => ({ ...prev, payment_status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="notPaid">Non Pagato</SelectItem>
                               <SelectItem value="deposit">Caparra</SelectItem>
                               <SelectItem value="paid">Pagato</SelectItem>
                            </SelectContent>
                           </Select>
                         </div>
                         {newReservation.payment_status === 'deposit' && (
                           <div>
                             <Label htmlFor="deposit_amount">Importo Caparra €</Label>
                             <Input
                               id="deposit_amount"
                               type="text"
                               inputMode="numeric"
                               pattern="[0-9]*"
                               value={newReservation.deposit_amount}
                               onChange={(e) => setNewReservation(prev => ({ ...prev, deposit_amount: e.target.value }))}
                               placeholder="Inserisci importo caparra"
                             />
                           </div>
                         )}
                         <div>
                           <Label htmlFor="payment_method">Metodo Pagamento</Label>
                           <Select 
                             value={newReservation.payment_method} 
                             onValueChange={(value) => setNewReservation(prev => ({ ...prev, payment_method: value }))}
                           >
                             <SelectTrigger>
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="cash">Contanti</SelectItem>
                               <SelectItem value="card">Carta</SelectItem>
                               <SelectItem value="bank_transfer">Bonifico</SelectItem>
                               <SelectItem value="paypal">PayPal</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label htmlFor="has_pets">Animali Domestici</Label>
                           <div className="flex items-center space-x-2 mt-2">
                             <input
                               type="checkbox"
                               id="has_pets"
                               checked={newReservation.has_pets}
                               onChange={(e) => setNewReservation(prev => ({ ...prev, has_pets: e.target.checked }))}
                               className="rounded border-gray-300"
                             />
                             <Label htmlFor="has_pets" className="text-sm font-normal">
                               Ha animali domestici
                             </Label>
                           </div>
                         </div>
                         <div>
                           <Label htmlFor="linen_option">Biancheria</Label>
                           <div className="flex items-center space-x-2 mt-2">
                             <input
                               type="checkbox"
                               id="linen_option"
                               checked={newReservation.linen_option === 'yes'}
                               onChange={(e) => setNewReservation(prev => ({ ...prev, linen_option: e.target.checked ? 'yes' : 'no' }))}
                               className="rounded border-gray-300"
                             />
                             <Label htmlFor="linen_option" className="text-sm font-normal">
                               Ha richiesto la biancheria
                             </Label>
                           </div>
                         </div>
                         <div className="col-span-2">
                          <Label htmlFor="notes">Note</Label>
                          <Textarea
                            id="notes"
                            value={newReservation.notes}
                            onChange={(e) => setNewReservation(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Note aggiuntive..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Annulla
                        </Button>
                        <Button onClick={handleAddReservation}>
                          Aggiungi Prenotazione
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingReservation({...reservation});
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReservation(reservation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nessuna prenotazione trovata</p>
                )}
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Modifica Prenotazione</DialogTitle>
                </DialogHeader>
                {editingReservation && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_guest_name">Nome Ospite</Label>
                      <Input
                        id="edit_guest_name"
                        value={editingReservation.guest_name}
                        onChange={(e) => setEditingReservation(prev => ({ ...prev, guest_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_start_date">Data Check-in</Label>
                      <Input
                        id="edit_start_date"
                        type="date"
                        value={editingReservation.start_date}
                        onChange={(e) => setEditingReservation(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_end_date">Data Check-out</Label>
                      <Input
                        id="edit_end_date"
                        type="date"
                        value={editingReservation.end_date}
                        onChange={(e) => setEditingReservation(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_adults">Adulti</Label>
                      <Input
                        id="edit_adults"
                        type="number"
                        min="1"
                        value={editingReservation.adults}
                        onChange={(e) => setEditingReservation(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_final_price">Prezzo Finale €</Label>
                      <Input
                        id="edit_final_price"
                        type="number"
                        value={editingReservation.final_price || 0}
                        onChange={(e) => setEditingReservation(prev => ({ ...prev, final_price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_payment_status">Stato Pagamento</Label>
                      <Select 
                        value={editingReservation.payment_status || 'notPaid'} 
                        onValueChange={(value) => setEditingReservation(prev => ({ ...prev, payment_status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notPaid">Non Pagato</SelectItem>
                          <SelectItem value="partiallyPaid">Parzialmente Pagato</SelectItem>
                          <SelectItem value="paid">Pagato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit_notes">Note</Label>
                      <Textarea
                        id="edit_notes"
                        value={editingReservation.notes || ''}
                        onChange={(e) => setEditingReservation(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Note aggiuntive..."
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Annulla
                  </Button>
                  <Button onClick={handleEditReservation}>
                    Salva Modifiche
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PricingManagement />
          </TabsContent>
          
          <TabsContent value="gallery" className="space-y-6">
            <ApartmentImageGallery />
          </TabsContent>
          
          <TabsContent value="home-gallery" className="space-y-6">
            <HomeImageGallery />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}