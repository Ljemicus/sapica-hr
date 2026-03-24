'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import Link from 'next/link';
import type { LostPet } from '@/lib/types';
import { LOST_PET_STATUS_LABELS } from '@/lib/types';

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface LostPetsMapProps {
  pets: LostPet[];
}

export default function LostPetsMap({ pets }: LostPetsMapProps) {
  const petsWithCoords = pets.filter(p => p.location_lat && p.location_lng);

  // Calculate bounds to fit all markers
  const bounds = petsWithCoords.length > 0
    ? L.latLngBounds(petsWithCoords.map(p => [p.location_lat, p.location_lng] as [number, number]))
    : L.latLngBounds([[42.4, 13.5], [46.6, 19.5]]); // Croatia bounds fallback

  return (
    <MapContainer
      bounds={bounds.pad(0.1)}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {petsWithCoords.map(pet => (
        <Marker
          key={pet.id}
          position={[pet.location_lat, pet.location_lng]}
          icon={pet.status === 'lost' ? redIcon : greenIcon}
        >
          <Popup>
            <div className="w-48">
              <div className="relative h-24 w-full mb-2 rounded overflow-hidden">
                <Image src={pet.image_url} alt={pet.name} fill className="object-cover" />
              </div>
              <p className="font-bold text-sm">{pet.name}</p>
              <p className="text-xs text-gray-600">{pet.city}, {pet.neighborhood}</p>
              <p className="text-xs text-gray-500">{formatDate(pet.date_lost)}</p>
              <span className={`inline-block text-xs font-semibold mt-1 px-2 py-0.5 rounded ${
                pet.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {LOST_PET_STATUS_LABELS[pet.status]}
              </span>
              <Link
                href={`/izgubljeni/${pet.id}`}
                className="block mt-2 text-center text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded py-1.5 transition-colors"
              >
                Pogledaj detalje
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
