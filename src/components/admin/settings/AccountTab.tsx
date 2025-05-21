
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";

export const AccountTab = () => {
  const { adminSettings, updateAdminSettings } = useSettings();
  const { login } = useAuth();
  
  const [newUsername, setNewUsername] = useState(adminSettings.username);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

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

  return (
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
  );
};
