import * as React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    toast.success('Logout effettuato con successo');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger className="-ml-1" />
        
        <div className="flex-1 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Cerca prenotazioni, ospiti..." 
              className="pl-9 bg-muted/20 border-0 focus:bg-background focus:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              E
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}