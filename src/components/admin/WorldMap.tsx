import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';

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
  // Raggio fisso piccolo per tutti i marker
  const getMarkerRadius = () => 4;

  // Colore del marker in base all'intensità
  const getMarkerColor = (count: number) => {
    const maxCount = Math.max(...visitData.map(d => d.count));
    const intensity = count / maxCount;
    
    if (intensity > 0.7) return "#ef4444"; // rosso intenso
    if (intensity > 0.4) return "#f97316"; // arancione
    if (intensity > 0.2) return "#eab308"; // giallo
    return "#22c55e"; // verde
  };

  return (
    <div className="w-full h-96 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
      <ComposableMap 
        projection="geoMercator" 
        style={{ width: "100%", height: "100%" }}
        projectionConfig={{ scale: 120 }}
      >
        <ZoomableGroup zoom={1} center={[0, 20]}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Trova se questo paese ha visite
                const countryData = visitData.find(
                  (d) => d.country_code === geo.properties.ISO_A2
                );
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={countryData ? "#dcfce7" : "#f1f5f9"}
                    stroke="#e2e8f0"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { 
                        outline: "none", 
                        fill: countryData ? "#bbf7d0" : "#e2e8f0",
                        cursor: "pointer"
                      },
                      pressed: { outline: "none" }
                    }}
                  />
                );
              })
            }
          </Geographies>
          
          {/* Marker per ogni paese con visite */}
          {visitData
            .filter(d => d.latitude && d.longitude)
            .map((marker, index) => (
              <Marker
                key={index}
                coordinates={[marker.longitude, marker.latitude]}
              >
                <circle
                  r={getMarkerRadius()}
                  fill={getMarkerColor(marker.count)}
                  fillOpacity={0.9}
                  stroke="#ffffff"
                  strokeWidth={1}
                  style={{ cursor: "pointer" }}
                />
                <title>
                  {`${marker.country}: ${marker.count} visite`}
                </title>
              </Marker>
            ))
          }
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-lg">
        <div className="text-sm font-semibold mb-2">Intensità visite</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs">1-25%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs">26-40%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-xs">41-70%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs">71-100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};