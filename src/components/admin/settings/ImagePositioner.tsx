
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MoveHorizontal, MoveVertical, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface ImagePositionerProps {
  imageUrl: string;
  currentPosition: string;
  onPositionChange: (position: string) => void;
}

export const ImagePositioner = ({ imageUrl, currentPosition, onPositionChange }: ImagePositionerProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  
  const [position, setPosition] = React.useState({
    x: 50, // percentage values (0-100)
    y: 50,
  });
  
  const [zoom, setZoom] = React.useState(100); // percentage 100 = normal
  
  // Parse the current position on component mount
  React.useEffect(() => {
    if (currentPosition) {
      // Map CSS background positions to percentage values
      const posMap: Record<string, {x: number, y: number}> = {
        "center": { x: 50, y: 50 },
        "top": { x: 50, y: 0 },
        "bottom": { x: 50, y: 100 },
        "left": { x: 0, y: 50 },
        "right": { x: 100, y: 50 },
        "top left": { x: 0, y: 0 },
        "top right": { x: 100, y: 0 },
        "bottom left": { x: 0, y: 100 },
        "bottom right": { x: 100, y: 100 },
      };
      
      const posValues = posMap[currentPosition] || { x: 50, y: 50 };
      setPosition(posValues);
    }
  }, [currentPosition]);
  
  // Convert percentage position to CSS background-position
  const getBackgroundPositionValue = (x: number, y: number) => {
    // Convert percentages to string representation
    const getPosString = (val: number) => {
      if (val <= 10) return "0%";
      if (val >= 90) return "100%";
      return "50%";
    };
    
    const xPos = getPosString(x);
    const yPos = getPosString(y);
    
    // Map to CSS positions
    if (xPos === "50%" && yPos === "50%") return "center";
    if (xPos === "50%" && yPos === "0%") return "top";
    if (xPos === "50%" && yPos === "100%") return "bottom";
    if (xPos === "0%" && yPos === "50%") return "left";
    if (xPos === "100%" && yPos === "50%") return "right";
    if (xPos === "0%" && yPos === "0%") return "top left";
    if (xPos === "100%" && yPos === "0%") return "top right";
    if (xPos === "0%" && yPos === "100%") return "bottom left";
    if (xPos === "100%" && yPos === "100%") return "bottom right";
    
    return "center"; // default
  };

  // Apply position changes and notify parent
  const applyPositionChange = (x: number, y: number) => {
    const newPosition = getBackgroundPositionValue(x, y);
    onPositionChange(newPosition);
  };
  
  // Handle horizontal position change
  const handleHorizontalChange = (value: number[]) => {
    const newX = value[0];
    setPosition(prev => ({ ...prev, x: newX }));
    applyPositionChange(newX, position.y);
  };
  
  // Handle vertical position change
  const handleVerticalChange = (value: number[]) => {
    const newY = value[0];
    setPosition(prev => ({ ...prev, y: newY }));
    applyPositionChange(position.x, newY);
  };
  
  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 80));
  };
  
  const handleReset = () => {
    setPosition({ x: 50, y: 50 });
    setZoom(100);
    onPositionChange("center");
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <div 
          ref={containerRef}
          className="w-full aspect-video rounded-md overflow-hidden border bg-muted relative"
        >
          <div 
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Posizionamento immagine"
              className="min-w-full min-h-full object-cover transition-all duration-150"
              style={{ 
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${zoom / 100})`,
              }}
            />
          </div>
        </div>
        
        {/* Position markers overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-6 pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MoveHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Posizione orizzontale</span>
          </div>
          <Slider
            value={[position.x]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleHorizontalChange}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MoveVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Posizione verticale</span>
          </div>
          <Slider
            value={[position.y]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVerticalChange}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Zoom ({zoom}%)</span>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleZoomOut}
                disabled={zoom <= 80}
                className="h-6 w-6"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleZoomIn}
                disabled={zoom >= 150}
                className="h-6 w-6"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Slider
            value={[zoom]}
            min={80}
            max={150}
            step={1}
            onValueChange={handleZoomChange}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-1" /> Ripristina impostazioni
          </Button>
        </div>
      </div>
    </div>
  );
};
