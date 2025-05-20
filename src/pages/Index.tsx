
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[50vh] md:h-[60vh] bg-blue-200 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Villa Mare Blu</h1>
            <p className="text-lg md:text-xl mb-6 max-w-2xl">La tua vacanza da sogno sul mare cristallino della Sardegna</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/contacts">Prenota Ora</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur-sm" asChild>
                <Link to="/gallery">Visita la Galleria</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">Benvenuti a Villa Mare Blu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">Vista Mozzafiato</h3>
            <p className="text-muted-foreground">Goditi una vista panoramica sul mare cristallino dalla tua camera da letto e dalla terrazza privata.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">Comfort Moderno</h3>
            <p className="text-muted-foreground">Ogni spazio è progettato per offrire il massimo comfort con arredamenti moderni e servizi di alta qualità.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">Posizione Ideale</h3>
            <p className="text-muted-foreground">Situata a pochi passi dalla spiaggia e vicino a ristoranti, negozi e attrazioni locali.</p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/about">Scopri di più</Link>
          </Button>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary/5 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Pronto per prenotare la tua vacanza?</h2>
              <p className="text-muted-foreground">Contattaci oggi per disponibilità e offerte speciali.</p>
            </div>
            <Button size="lg" asChild>
              <Link to="/contacts">Contattaci</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
