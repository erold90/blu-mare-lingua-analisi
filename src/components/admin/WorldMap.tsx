import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Globe } from 'lucide-react';

interface WorldMapProps {
  visitData: Array<{
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
    count: number;
  }>;
}

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export const WorldMap: React.FC<WorldMapProps> = ({ visitData }) => {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Raggio fisso per tutti i marker
  const getMarkerRadius = () => 3;

  // Colore del marker con gradiente più sofisticato
  const getMarkerColor = (count: number) => {
    const maxCount = Math.max(...visitData.map(d => d.count));
    const intensity = count / maxCount;
    
    if (intensity > 0.8) return "hsl(0, 84%, 60%)"; // Rosso intenso
    if (intensity > 0.6) return "hsl(25, 95%, 53%)"; // Arancione
    if (intensity > 0.4) return "hsl(45, 93%, 47%)"; // Giallo
    if (intensity > 0.2) return "hsl(142, 76%, 36%)"; // Verde
    return "hsl(210, 40%, 50%)"; // Blu grigio
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setCenter([0, 20]);
    setSelectedCountry(null);
  };

  const handleCountryClick = (geo: any) => {
    const countryData = visitData.find(
      (d) => d.country_code === geo.properties.ISO_A2
    );
    
    if (countryData) {
      setSelectedCountry(geo.properties.NAME);
      setCenter([countryData.longitude, countryData.latitude]);
      setZoom(2.5);
    }
  };

  return (
    <div 
      className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950 rounded-lg overflow-hidden border border-border"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }}
    >
      {/* Controlli mappa */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomIn}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomOut}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleReset}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Paese selezionato */}
      {selectedCountry && (
        <div className="absolute top-4 left-4 z-10">
          <Badge 
            variant="secondary" 
            className="bg-background/80 backdrop-blur-sm text-lg px-3 py-2"
          >
            <Globe className="h-4 w-4 mr-2" />
            {selectedCountry}
          </Badge>
        </div>
      )}

      {/* Tooltip per marker al hover */}
      {hoveredMarker !== null && (
        <div 
          className="absolute z-20 pointer-events-none bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg transition-all duration-200"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 40,
            transform: mousePosition.x > 300 ? 'translateX(-100%)' : 'translateX(0)'
          }}
        >
          <div className="text-sm font-semibold">{visitData[hoveredMarker]?.country}</div>
          <div className="text-xs text-muted-foreground">
            {visitData[hoveredMarker]?.count} visite
          </div>
        </div>
      )}

      <ComposableMap 
        projection="geoMercator" 
        style={{ width: "100%", height: "100%" }}
        projectionConfig={{ 
          scale: 120,
          rotation: [0, 0, 0]
        }}
      >
        <ZoomableGroup zoom={zoom} center={center}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryData = visitData.find(
                  (d) => d.country_code === geo.properties.ISO_A2
                );
                
                const isSelected = selectedCountry === geo.properties.NAME;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isSelected 
                        ? "hsl(220, 90%, 56%)" // Blu acceso per selezione
                        : countryData 
                          ? "hsl(210, 20%, 85%)" // Grigio chiaro per paesi visitati
                          : "hsl(210, 15%, 75%)" // Grigio più scuro per paesi non visitati
                    }
                    stroke="hsl(210, 25%, 25%)" // Bordo scuro per contrasto
                    strokeWidth={isSelected ? 2 : 0.8}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      default: { 
                        outline: "none",
                        transition: "all 0.3s ease"
                      },
                      hover: { 
                        outline: "none", 
                        fill: countryData 
                          ? "hsl(210, 30%, 90%)" // Più chiaro al hover
                          : "hsl(210, 20%, 80%)",
                        cursor: countryData ? "pointer" : "default"
                      },
                      pressed: { 
                        outline: "none",
                        fill: "hsl(220, 80%, 60%)"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
          
          {/* Marker fissi solo colorati */}
          {visitData
            .filter(d => d.latitude && d.longitude)
            .map((marker, index) => (
              <Marker
                key={index}
                coordinates={[marker.longitude, marker.latitude]}
                onMouseEnter={() => setHoveredMarker(index)}
                onMouseLeave={() => setHoveredMarker(null)}
              >
                <circle
                  r={getMarkerRadius()}
                  fill={getMarkerColor(marker.count)}
                  fillOpacity={hoveredMarker === index ? 1 : 0.9}
                  stroke="white"
                  strokeWidth={2}
                  style={{ 
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    filter: hoveredMarker === index ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" : "none"
                  }}
                />
              </Marker>
            ))
          }
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legenda migliorata */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border p-4 rounded-lg shadow-lg">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Intensità Visite
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Bassa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs">Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Massima</span>
          </div>
        </div>
        
        {/* Statistiche rapide */}
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <div>Totale visite: {visitData.reduce((sum, d) => sum + d.count, 0)}</div>
          <div>Paesi visitatori: {visitData.length}</div>
        </div>
      </div>
    </div>
  );
};