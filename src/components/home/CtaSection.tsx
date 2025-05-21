
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const CtaSection = () => {
  return (
    <div className="py-14 bg-primary/5">
      <div className="container px-6">
        <Card className="shadow-md border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Pronto per prenotare la tua vacanza?</h2>
                <p className="text-muted-foreground">Contattaci oggi per disponibilità e offerte speciali.</p>
              </div>
              <Button size="lg" className="w-full md:w-auto" asChild>
                <Link to="/preventivo">Richiedi un Preventivo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
