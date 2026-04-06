'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Veterinarian } from '@/lib/db/veterinarian-helpers';
import { MapPin, Phone, Clock3, Building2, Siren, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface VeterinariMapProps {
  veterinarians: Veterinarian[];
  selectedCity: string;
}

export function VeterinariMap({ veterinarians, selectedCity }: VeterinariMapProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Filter veterinarians with coordinates
  const veterinariansWithCoords = veterinarians.filter(
    (vet) => vet.latitude && vet.longitude
  );

  // Filter by selected city
  const filteredVeterinarians = selectedCity === 'all' 
    ? veterinariansWithCoords 
    : veterinariansWithCoords.filter(vet => vet.city === selectedCity);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      setIsLoading(true);
      
      // Default to Croatia center if no veterinarians with coordinates
      const defaultCenter: L.LatLngExpression = [45.1, 15.2];
      let initialZoom = 7;
      
      // If we have veterinarians, calculate bounds
      if (filteredVeterinarians.length > 0) {
        const coords = filteredVeterinarians.map(vet => 
          [vet.latitude!, vet.longitude!] as L.LatLngExpression
        );
        const bounds = L.latLngBounds(coords);
        initialZoom = 10;
        
        const map = L.map(mapRef.current).setView(bounds.getCenter(), initialZoom);
        map.fitBounds(bounds, { padding: [50, 50] });
        mapInstanceRef.current = map;
      } else {
        const map = L.map(mapRef.current).setView(defaultCenter, initialZoom);
        mapInstanceRef.current = map;
      }

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(isEn ? 'Failed to load map. Please try again.' : 'Greška pri učitavanju karte. Pokušajte ponovno.');
      setIsLoading(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filteredVeterinarians changes
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredVeterinarians.forEach(vet => {
      if (!vet.latitude || !vet.longitude) return;

      const icon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-8 h-8 rounded-full ${
              vet.emergency_verified 
                ? 'bg-red-500 border-2 border-white shadow-lg' 
                : 'bg-emerald-500 border-2 border-white shadow-lg'
            } flex items-center justify-center">
              ${vet.emergency_verified 
                ? '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z"/></svg>'
                : '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
              }
            </div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([vet.latitude, vet.longitude], { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div class="p-2 max-w-xs">
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <h3 class="font-bold text-sm mb-1">${vet.name}</h3>
                ${vet.organization_name && vet.organization_name !== vet.name 
                  ? `<p class="text-xs text-gray-600 mb-1">${vet.organization_name}</p>` 
                  : ''}
                
                <div class="flex items-center gap-1 text-xs text-gray-600 mb-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>${vet.address}, ${vet.city}</span>
                </div>
                
                ${vet.phone ? `
                <div class="flex items-center gap-1 text-xs text-gray-600 mb-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  <a href="tel:${vet.phone.replace(/\s/g, '')}" class="hover:text-blue-600">${vet.phone}</a>
                </div>` : ''}
                
                ${vet.emergency_phone ? `
                <div class="flex items-center gap-1 text-xs text-red-600 font-medium mb-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z"/></svg>
                  <a href="tel:${vet.emergency_phone.replace(/\s/g, '')}" class="hover:text-red-800">${vet.emergency_phone} (${isEn ? 'Emergency' : 'Hitno'})</a>
                </div>` : ''}
                
                <div class="flex flex-wrap gap-1 mt-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    vet.type === 'veterinarska_stanica' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }">
                    ${vet.type === 'veterinarska_stanica' 
                      ? (isEn ? 'Station' : 'Stanica') 
                      : (isEn ? 'Clinic' : 'Ambulanta')}
                  </span>
                  
                  ${vet.emergency_verified ? `
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    ${isEn ? 'Emergency' : 'Hitno'}
                  </span>` : ''}
                  
                  ${vet.verified ? `
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    ${isEn ? 'Verified' : 'Verificirano'}
                  </span>` : ''}
                </div>
                
                <a href="/veterinari/${vet.slug}" class="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800">
                  ${isEn ? 'View details' : 'Pogledaj detalje'}
                  <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </a>
              </div>
            </div>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Fit bounds to markers if we have any
    if (filteredVeterinarians.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        filteredVeterinarians
          .filter(vet => vet.latitude && vet.longitude)
          .map(vet => [vet.latitude!, vet.longitude!] as L.LatLngExpression)
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [filteredVeterinarians, isLoading, isEn]);

  if (mapError) {
    return (
      <div className="h-[500px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  if (veterinariansWithCoords.length === 0) {
    return (
      <div className="h-[500px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {isEn 
              ? 'No veterinarians with location data available.' 
              : 'Nema veterinara s dostupnim podacima o lokaciji.'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {isEn 
              ? 'Location data will be added soon.' 
              : 'Podaci o lokaciji bit će dodani uskoro.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              {isEn ? 'Loading map...' : 'Učitavanje karte...'}
            </p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="h-[500px] rounded-lg border border-gray-200 overflow-hidden"
      />
      
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
          <span>{isEn ? 'Regular clinic' : 'Redovna ambulanta'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
          <span>{isEn ? 'Emergency service' : 'Hitna služba'}</span>
        </div>
        <div className="text-xs text-gray-500">
          {filteredVeterinarians.length} {isEn ? 'locations shown' : 'lokacija prikazano'}
        </div>
      </div>
    </div>
  );
}