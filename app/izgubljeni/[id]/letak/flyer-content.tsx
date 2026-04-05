'use client';

import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Printer, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LostPet } from '@/lib/types';
import { LOST_PET_SPECIES_LABELS } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function LostPetFlyerContent({ pet }: { pet: LostPet }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? 'en-GB' : 'hr-HR';
  const speciesLabels = isEn
    ? { pas: 'Dog', macka: 'Cat', ostalo: 'Other' }
    : LOST_PET_SPECIES_LABELS;
  const sexLabels = isEn
    ? { 'muško': 'Male', 'žensko': 'Female' }
    : { 'muško': 'Muško', 'žensko': 'Žensko' };

  const listingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/izgubljeni/${pet.id}`
    : `/izgubljeni/${pet.id}`;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Screen-only toolbar */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/izgubljeni/${pet.id}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEn ? 'Back to listing' : 'Natrag na oglas'}
          </Link>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            {isEn ? 'Print flyer' : 'Isprintaj letak'}
          </Button>
        </div>
      </div>

      {/* Printable flyer */}
      <div className="max-w-3xl mx-auto p-4 print:p-0 print:max-w-none">
        <div className="bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none p-6 md:p-10 print:p-8 flyer-page">

          {/* Header banner */}
          <div className="bg-red-600 text-white rounded-xl print:rounded-lg px-6 py-4 text-center mb-6">
            <h1 className="text-3xl md:text-4xl print:text-4xl font-heading font-extrabold tracking-tight uppercase">
              {pet.status === 'lost'
                ? (isEn ? 'LOST PET' : 'IZGUBLJEN LJUBIMAC')
                : (isEn ? 'FOUND!' : 'PRONAĐEN!')}
            </h1>
            {pet.status === 'lost' && (
              <p className="text-red-100 text-sm mt-1 font-medium">
                {isEn ? 'Please help us find our beloved pet!' : 'Molimo pomozite nam pronaći našeg ljubimca!'}
              </p>
            )}
          </div>

          {/* Photo + key info layout */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Pet photo */}
            {pet.image_url && (
              <div className="md:w-1/2 shrink-0">
                <div className="relative aspect-square rounded-xl print:rounded-lg overflow-hidden border-4 border-red-200 print:border-red-300">
                  <Image
                    src={pet.image_url}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 384px"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Key facts */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl print:text-4xl font-heading font-bold text-gray-900 mb-4">
                {pet.name}
              </h2>

              <dl className="space-y-2 text-base print:text-lg">
                <div className="flex gap-2">
                  <dt className="font-semibold text-gray-600 w-24 shrink-0">{isEn ? 'Species' : 'Vrsta'}:</dt>
                  <dd className="text-gray-900">{speciesLabels[pet.species]}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold text-gray-600 w-24 shrink-0">{isEn ? 'Breed' : 'Pasmina'}:</dt>
                  <dd className="text-gray-900">{pet.breed}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold text-gray-600 w-24 shrink-0">{isEn ? 'Color' : 'Boja'}:</dt>
                  <dd className="text-gray-900">{pet.color}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold text-gray-600 w-24 shrink-0">{isEn ? 'Sex' : 'Spol'}:</dt>
                  <dd className="text-gray-900">{sexLabels[pet.sex]}</dd>
                </div>
                {pet.has_collar && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-gray-600 w-24 shrink-0">{isEn ? 'Collar' : 'Ogrlica'}:</dt>
                    <dd className="text-gray-900">{isEn ? 'Yes' : 'Da'}</dd>
                  </div>
                )}
                {pet.has_microchip && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-gray-600 w-24 shrink-0">{isEn ? 'Microchip' : 'Čip'}:</dt>
                    <dd className="text-gray-900">{isEn ? 'Yes' : 'Da'}</dd>
                  </div>
                )}
              </dl>

              {pet.special_marks && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 print:bg-amber-50">
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    {isEn ? 'Special markings' : 'Posebne oznake'}
                  </p>
                  <p className="text-sm text-amber-700">{pet.special_marks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Last seen */}
          <div className="bg-gray-50 print:bg-gray-100 rounded-xl print:rounded-lg p-4 mb-6 space-y-2">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              {isEn ? 'Last seen' : 'Zadnje viđen/a'}
            </h3>
            <p className="text-gray-900 font-medium text-lg">
              {pet.neighborhood}, {pet.city}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(pet.date_lost, locale)}
            </p>
          </div>

          {/* Description (truncated for flyer) */}
          {pet.description && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed text-sm print:text-base">
                {pet.description.length > 300 ? `${pet.description.slice(0, 300)}...` : pet.description}
              </p>
            </div>
          )}

          {/* Contact + QR code */}
          <div className="flex flex-col sm:flex-row gap-6 items-start border-t-2 border-dashed border-gray-300 pt-6">
            {/* Contact info */}
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg mb-3">
                {isEn ? 'If you see this pet, please contact:' : 'Ako vidite ovog ljubimca, javite se:'}
              </h3>
              <div className="space-y-2">
                {pet.contact_name && (
                  <p className="font-semibold text-lg text-gray-900">{pet.contact_name}</p>
                )}
                {pet.contact_phone && (
                  <p className="flex items-center gap-2 text-lg font-bold text-green-700">
                    <Phone className="h-5 w-5" />
                    {pet.contact_phone}
                  </p>
                )}
                {pet.contact_email && (
                  <p className="flex items-center gap-2 text-sm text-blue-600">
                    <Mail className="h-4 w-4" />
                    {pet.contact_email}
                  </p>
                )}
              </div>
            </div>

            {/* QR code */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-2">
                <QRCodeSVG
                  value={listingUrl}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 text-center max-w-[140px]">
                {isEn ? 'Scan to view listing & report sightings' : 'Skenirajte za oglas i prijavu viđenja'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">PetPark — petpark.hr</p>
          </div>
        </div>
      </div>
    </div>
  );
}
