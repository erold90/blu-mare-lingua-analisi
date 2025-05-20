
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ReservedAreaPage = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulazione di login
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="container flex items-center justify-center min-h-[70vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Area Riservata</CardTitle>
            <CardDescription>
              Accedi alla tua area personale per gestire le tue prenotazioni.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="register">Registrati</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="La tua email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="La tua password" required />
                  </div>
                  <div className="flex justify-end text-sm">
                    <a href="#" className="text-primary hover:underline">
                      Password dimenticata?
                    </a>
                  </div>
                  <Button type="submit" className="w-full">Accedi</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input id="firstName" placeholder="Il tuo nome" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Cognome</Label>
                      <Input id="lastName" placeholder="Il tuo cognome" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="La tua email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Crea una password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Conferma Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Conferma la password" required />
                  </div>
                  <Button type="submit" className="w-full">Registrati</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Vista dell'area riservata dopo il login
  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Benvenuto, Ospite</h1>
          <p className="text-muted-foreground">Gestisci le tue prenotazioni e i tuoi dati personali</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Le Tue Prenotazioni</CardTitle>
            <CardDescription>Visualizza e gestisci le tue prenotazioni</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Simulazione di prenotazioni */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="font-medium">Prenotazione #12345</div>
                <div className="text-sm text-muted-foreground">
                  Dal 15/07/2025 al 22/07/2025
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-medium">Prenotazione #12346</div>
                <div className="text-sm text-muted-foreground">
                  Dal 10/08/2025 al 17/08/2025
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Visualizza Tutte</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documenti</CardTitle>
            <CardDescription>I tuoi documenti e fatture</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-primary">📄</span> Fattura #F-2024-001
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-primary">📄</span> Fattura #F-2024-002
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-primary">📄</span> Contratto di soggiorno
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Scarica Tutti</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profilo</CardTitle>
            <CardDescription>Gestisci i tuoi dati personali</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span>Mario Rossi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>mario.rossi@example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefono:</span>
                <span>+39 123 456 7890</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Modifica Profilo</Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Offerte speciali per te</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sconto Early Booking</CardTitle>
              <CardDescription>Prenota in anticipo e risparmia</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Prenota con almeno 3 mesi di anticipo e ricevi uno sconto del 15% sul prezzo totale.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Scopri di più</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pacchetto Famiglia</CardTitle>
              <CardDescription>Offerta speciale per famiglie</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Soggiorno gratuito per bambini sotto i 12 anni e attività incluse per tutta la famiglia.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Scopri di più</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReservedAreaPage;
