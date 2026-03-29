'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SitterProfile, User } from '@/lib/types';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  sitters: (SitterProfile & { user: User })[];
}

export default function MapView({ sitters }: MapViewProps) {
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

    // Custom orange marker icon
    const orangeIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #F97316; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const bounds: L.LatLngExpression[] = [];

    sitters.forEach((sitter) => {
      if (sitter.location_lat && sitter.location_lng) {
        const latLng: L.LatLngExpression = [sitter.location_lat, sitter.location_lng];
        bounds.push(latLng);

        const marker = L.marker(latLng, { icon: orangeIcon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width: 180px; font-family: system-ui;">
            <strong style="font-size: 14px;">${sitter.user?.name || 'Sitter'}</strong>
            <div style="color: #666; font-size: 12px; margin: 4px 0;">📍 ${sitter.city || ''}</div>
            <div style="color: #F97316; font-size: 12px;">⭐ ${sitter.rating_avg.toFixed(1)} (${sitter.review_count} recenzija)</div>
            <a href="/sitter/${sitter.user_id}" style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #F97316; color: white; border-radius: 6px; text-decoration: none; font-size: 12px;">
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
  }, [sitters]);

  return <div ref={mapRef} className="h-full w-full" />;
}
