
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ExperienceItemProps {
  imageUrl: string;
  title: string;
  description: string;
}

const ExperienceItem = ({ imageUrl, title, description }: ExperienceItemProps) => (
  <Card className="border-0 shadow-lg overflow-hidden bg-white">
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div 
        className="h-56 md:h-auto bg-cover bg-center" 
        style={{ backgroundImage: `url('${imageUrl}')` }}
      ></div>
      <CardContent className="p-6 md:p-8 flex flex-col justify-center">
        <h3 className="text-xl font-medium mb-4">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </div>
  </Card>
);

export const ExperienceCarousel = () => {
  const experiences = [
    {
      imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
      title: "Spiagge da Sogno",
      description: "A soli 100 metri dalla nostra struttura, troverete l'accesso privato al mare cristallino del Salento. Acque turchesi, scogliere basse e insenature nascoste vi attendono per giornate di puro relax al sole."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
      title: "Relax e Divertimento",
      description: "Nelle vicine località di Torre Vado e Santa Maria di Leuca, troverete spiagge attrezzate, ristoranti tipici e un'animata vita notturna per rendere la vostra vacanza indimenticabile."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1605215811803-1b8c81a96a74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
      title: "Esperienze Uniche",
      description: "La nostra struttura vi offre convenzioni speciali per escursioni in barca alle famose grotte marine e l'accesso privilegiato ai migliori lidi della costa salentina."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
      title: "Comfort All'Aperto",
      description: "Godetevi le ampie aree esterne con barbecue, forno a legna e zone relax arredate con eleganti sedute. Cene all'aperto con vista sul mare e brezza marina, per vivere il Salento in tutto il suo splendore."
    }
  ];

  return (
    <div className="bg-primary/5 py-14">
      <div className="container px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-center">L'Esperienza Villa MareBlu</h2>
        
        <Carousel className="max-w-5xl mx-auto">
          <CarouselContent>
            {experiences.map((experience, index) => (
              <CarouselItem key={index}>
                <ExperienceItem 
                  imageUrl={experience.imageUrl} 
                  title={experience.title} 
                  description={experience.description}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="relative static mx-2 transform-none" />
            <CarouselNext className="relative static mx-2 transform-none" />
          </div>
        </Carousel>
      </div>
    </div>
  );
};
