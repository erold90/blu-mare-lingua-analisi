
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

const SummaryLayout: React.FC<SummaryLayoutProps> = ({ children, footer }) => {
  return (
    <Card className="max-w-4xl mx-auto border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-serif text-primary">Riepilogo prenotazione</CardTitle>
        <CardDescription className="text-base">Verifica i dettagli del tuo preventivo</CardDescription>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row gap-4 justify-between pt-4 pb-6 border-t">
        {footer}
      </CardFooter>
    </Card>
  );
};

export default SummaryLayout;
