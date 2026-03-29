'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UnifiedProvider } from './types';
import { CATEGORY_LABELS, CATEGORY_EMOJI } from './types';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MARKER_COLORS: Record<string, string> = {
  sitter: '#F97316',
  grooming: '#EC4899',
  dresura: '#6366F1',
};

interface MapViewProps {
  providers: UnifiedProvider[];
}

export default function MapView({ providers }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default to Croatia center
    const defaultCenter: L.LatLngExpression = [45.1, 15.2];
    const map = L.map(mapRef.current).setView(defaultCenter, 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const bounds: L.LatLngExpression[] = [];

    providers.forEach((provider) => {
      if (provider.locationLat && provider.locationLng) {
        const latLng: L.LatLngExpression = [provider.locationLat, provider.locationLng];
        bounds.push(latLng);

        const color = MARKER_COLORS[provider.category] || '#F97316';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const categoryLabel = `${CATEGORY_EMOJI[provider.category]} ${CATEGORY_LABELS[provider.category]}`;
        const marker = L.marker(latLng, { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width: 180px; font-family: system-ui;">
            <div style="font-size: 10px; color: #888; margin-bottom: 4px;">${categoryLabel}</div>
            <strong style="font-size: 14px;">${provider.name}</strong>
            <div style="color: #666; font-size: 12px; margin: 4px 0;">${provider.city || ''}</div>
            <div style="color: #F97316; font-size: 12px;">${provider.rating.toFixed(1)} (${provider.reviews} recenzija)</div>
            <a href="${provider.profileUrl}" style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: ${color}; color: white; border-radius: 6px; text-decoration: none; font-size: 12px;">
              Pogledaj profil
            </a>
          </div>
        `);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [providers]);

  return <div ref={mapRef} className="h-full w-full" />;
}
