import React from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, LayoutDashboard, Calendar, Building, Euro, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/area-riservata/dashboard', icon: LayoutDashboard },
    { name: 'Prenotazioni', href: '/area-riservata/prenotazioni', icon: Calendar },
    { name: 'Appartamenti', href: '/area-riservata/appartamenti', icon: Building },
    { name: 'Prezzi', href: '/area-riservata/prezzi', icon: Euro },
    { name: 'Impostazioni', href: '/area-riservata/impostazioni', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Villa Mare Blu</h1>
            <p className="text-sm text-gray-500 mt-1">Area Riservata</p>
          </div>
          
          <nav className="mt-6 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md mb-1 transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-600">Benvenuto</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <Button 
              onClick={signOut} 
              variant="outline" 
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;