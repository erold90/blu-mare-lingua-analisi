
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

const SummaryLayout: React.FC<SummaryLayoutProps> = ({ children, footer }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl">Riepilogo prenotazione</CardTitle>
        <CardDescription>Verifica i dettagli del tuo preventivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row gap-4 justify-between pt-3 pb-6">
        {footer}
      </CardFooter>
    </Card>
  );
};

export default SummaryLayout;
