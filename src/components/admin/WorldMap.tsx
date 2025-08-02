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

  // Calcola raggio in base al numero di visite
  const getMarkerRadius = (count: number) => {
    const maxCount = Math.max(...visitData.map(d => d.count));
    const minRadius = 3;
    const maxRadius = 12;
    const normalizedCount = count / maxCount;
    return minRadius + (normalizedCount * (maxRadius - minRadius));
  };

  // Colore del marker con gradiente più sofisticato
  const getMarkerColor = (count: number) => {
    const maxCount = Math.max(...visitData.map(d => d.count));
    const intensity = count / maxCount;
    
    if (intensity > 0.8) return "hsl(var(--destructive))"; // Rosso intenso
    if (intensity > 0.6) return "hsl(25, 95%, 53%)"; // Arancione
    if (intensity > 0.4) return "hsl(45, 93%, 47%)"; // Giallo
    if (intensity > 0.2) return "hsl(142, 76%, 36%)"; // Verde
    return "hsl(var(--primary))"; // Colore primario
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
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border border-border">
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
                        ? "hsl(var(--primary) / 0.3)"
                        : countryData 
                          ? "hsl(var(--primary) / 0.1)" 
                          : "hsl(var(--muted) / 0.5)"
                    }
                    stroke="hsl(var(--border))"
                    strokeWidth={isSelected ? 1.5 : 0.5}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      default: { 
                        outline: "none",
                        transition: "all 0.3s ease"
                      },
                      hover: { 
                        outline: "none", 
                        fill: countryData 
                          ? "hsl(var(--primary) / 0.2)" 
                          : "hsl(var(--muted) / 0.3)",
                        cursor: countryData ? "pointer" : "default",
                        transform: "scale(1.005)"
                      },
                      pressed: { 
                        outline: "none",
                        fill: "hsl(var(--primary) / 0.4)"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
          
          {/* Marker con animazioni */}
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
                  r={getMarkerRadius(marker.count)}
                  fill={getMarkerColor(marker.count)}
                  fillOpacity={hoveredMarker === index ? 1 : 0.8}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  style={{ 
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: hoveredMarker === index ? "scale(1.3)" : "scale(1)",
                    filter: hoveredMarker === index ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "none"
                  }}
                />
                
                {/* Cerchio pulsante per i marker più importanti */}
                {marker.count >= Math.max(...visitData.map(d => d.count)) * 0.5 && (
                  <circle
                    r={getMarkerRadius(marker.count) + 3}
                    fill={getMarkerColor(marker.count)}
                    fillOpacity={0.3}
                    style={{
                      animation: "pulse 2s infinite"
                    }}
                  />
                )}
                
                {/* Tooltip migliorato */}
                <title>
                  {`${marker.country}\n${marker.count} visite\n${((marker.count / visitData.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}% del totale`}
                </title>
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
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
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
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--destructive))" }}></div>
            <span className="text-xs">Massima</span>
          </div>
        </div>
        
        {/* Statistiche rapide */}
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <div>Totale visite: {visitData.reduce((sum, d) => sum + d.count, 0)}</div>
          <div>Paesi visitatori: {visitData.length}</div>
        </div>
      </div>

      {/* CSS per animazioni */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};