import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apartments } from "@/data/apartments";

// Hook semplificato per gestione appartamenti
const useApartmentManagement = () => {
  return {
    apartments: apartments.map(apt => ({ id: apt.id, name: apt.name }))
  };
};

export { useApartmentManagement };