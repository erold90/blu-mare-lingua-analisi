
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const CtaSection = () => {
  console.log("CtaSection rendering - Link pointing to /preventivo");
  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="container px-6">
        <Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-r from-primary/10 to-secondary">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-3 text-primary">Pronto per prenotare la tua vacanza?</h2>
                <p className="text-lg text-muted-foreground">Contattaci oggi per disponibilità e offerte speciali.</p>
              </div>
              <Button 
                size="lg" 
                className="w-full md:w-auto text-base" 
                asChild
                onClick={() => console.log("Preventivo button clicked")}
              >
                <Link to="/preventivo">Richiedi un Preventivo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
