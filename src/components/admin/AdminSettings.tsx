
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminSettings = () => {
  const { siteSettings, adminSettings, updateSiteSettings, updateAdminSettings, addBlockedDate, removeBlockedDate, isDateBlocked } = useSettings();
  const { login } = useAuth();
  const isMobile = useIsMobile();
  
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [newUsername, setNewUsername] = useState(adminSettings.username);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if date is already selected
    const dateIndex = selectedDates.findIndex(selectedDate => 
      isSameDay(selectedDate, date)
    );
    
    if (dateIndex !== -1) {
      // Remove date if already selected
      const newSelectedDates = [...selectedDates];
      newSelectedDates.splice(dateIndex, 1);
      setSelectedDates(newSelectedDates);
    } else {
      // Add date if not already selected
      setSelectedDates([...selectedDates, date]);
    }
  };
  
  const blockSelectedDates = () => {
    if (selectedDates.length === 0) {
      toast.error("Nessuna data selezionata");
      return;
    }
    
    selectedDates.forEach(date => {
      addBlockedDate(format(date, 'yyyy-MM-dd'));
    });
    
    toast.success(`${selectedDates.length} date bloccate`);
    setSelectedDates([]);
  };
  
  const handlePasswordChange = () => {
    if (currentPassword !== adminSettings.password) {
      toast.error("Password attuale non corretta");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("La password deve contenere almeno 6 caratteri");
      return;
    }
    
    updateAdminSettings({
      username: newUsername,
      password: newPassword
    });
    
    // Attempt login with new credentials to update auth state
    login(newUsername, newPassword);
    
    toast.success("Credenziali aggiornate con successo");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleImageUpload = (
    type: 'hero' | 'home',
    index: number | null = null,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // In a real app, you would upload the file to a server and get back a URL
    // For this demo, we'll use local file URLs
    const file = e.target.files[0];
    const objectURL = URL.createObjectURL(file);
    
    if (type === 'hero') {
      updateSiteSettings({ heroImage: objectURL });
      toast.success("Immagine hero aggiornata");
    } else if (type === 'home' && index !== null) {
      const newHomeImages = [...siteSettings.homeImages];
      newHomeImages[index] = objectURL;
      updateSiteSettings({ homeImages: newHomeImages });
      toast.success(`Immagine ${index + 1} aggiornata`);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="blocked-dates">
        <TabsList>
          <TabsTrigger value="blocked-dates">Date Bloccate</TabsTrigger>
          <TabsTrigger value="images">Immagini</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blocked-dates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Date Bloccate</CardTitle>
              <CardDescription>
                Seleziona le date da bloccare per tutti gli appartamenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(date) => handleDateSelect(date)}
                    className="rounded-md border max-w-full"
                    locale={it}
                    disabled={(date) => isDateBlocked(date)}
                  />
                  <div className="mt-4">
                    <Button 
                      onClick={blockSelectedDates}
                      disabled={selectedDates.length === 0}
                    >
                      Blocca date selezionate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Date attualmente bloccate</h3>
                  <div className="max-h-[300px] overflow-y-auto border rounded-md p-4">
                    {siteSettings.blockedDates.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {siteSettings.blockedDates
                          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                          .map((dateStr, index) => {
                            const date = new Date(dateStr);
                            return (
                              <Badge key={index} variant="outline" className="flex gap-1 items-center">
                                {format(date, 'dd/MM/yyyy', { locale: it })}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 rounded-full ml-1 hover:bg-destructive/20"
                                  onClick={() => {
                                    removeBlockedDate(dateStr);
                                    toast.success("Data sbloccata");
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </Badge>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nessuna data bloccata
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Immagine Hero</CardTitle>
              <CardDescription>
                L'immagine principale visualizzata nella home page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-video rounded-md overflow-hidden border">
                    {siteSettings.heroImage ? (
                      <img
                        src={siteSettings.heroImage}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('hero-upload')?.click()}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Cambia immagine
                    </Button>
                    <Input
                      id="hero-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('hero', null, e)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Si consiglia un'immagine in formato 16:9 con alta risoluzione
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Immagini Home Page</CardTitle>
              <CardDescription>
                Immagini aggiuntive visualizzate nella home page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
                {siteSettings.homeImages.map((imageUrl, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-square rounded-md overflow-hidden border">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Home ${index+1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById(`home-upload-${index}`)?.click()}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Cambia
                    </Button>
                    <Input
                      id={`home-upload-${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('home', index, e)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Account</CardTitle>
              <CardDescription>
                Modifica le credenziali di accesso per l'area amministrativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password attuale</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Inserisci la password attuale"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-username">Nuovo username</Label>
                  <Input
                    id="new-username"
                    placeholder="Nuovo username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nuova password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Nuova password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Conferma password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Conferma la nuova password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handlePasswordChange}
                  disabled={
                    !currentPassword || 
                    !newUsername || 
                    !newPassword || 
                    !confirmPassword
                  }
                >
                  Salva credenziali
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
