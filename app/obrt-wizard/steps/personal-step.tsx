// Korak 2: Osobni podaci

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateOIB, validateEmail, validatePhone, validateAge, formatOIB, formatPhone } from '@/lib/obrt-wizard/validations';
import { PersonalData } from '@/types/obrt-wizard';
import { AlertCircle } from 'lucide-react';

interface PersonalStepProps {
  onNext: (data: PersonalData) => void;
  onBack: () => void;
  initialData?: PersonalData;
}

export function PersonalStep({ onNext, onBack, initialData }: PersonalStepProps) {
  const [formData, setFormData] = useState<PersonalData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    oib: initialData?.oib || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    address: {
      street: initialData?.address?.street || '',
      houseNumber: initialData?.address?.houseNumber || '',
      city: initialData?.address?.city || '',
      postalCode: initialData?.address?.postalCode || '',
    },
    email: initialData?.email || '',
    phone: initialData?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        return value.trim().length < 2 ? 'Ime mora imati najmanje 2 znaka' : '';
      case 'lastName':
        return value.trim().length < 2 ? 'Prezime mora imati najmanje 2 znaka' : '';
      case 'oib':
        return !validateOIB(value) ? 'Unesite valjani OIB (11 znamenki)' : '';
      case 'dateOfBirth':
        return !validateAge(value) ? 'Morate imati najmanje 18 godina' : '';
      case 'address.street':
        return value.trim().length < 2 ? 'Unesite ulicu' : '';
      case 'address.houseNumber':
        return value.trim().length < 1 ? 'Unesite kućni broj' : '';
      case 'address.city':
        return value.trim().length < 2 ? 'Unesite grad' : '';
      case 'address.postalCode':
        return !/^\d{5}$/.test(value) ? 'Unesite valjani poštanski broj (5 znamenki)' : '';
      case 'email':
        return !validateEmail(value) ? 'Unesite valjani email' : '';
      case 'phone':
        return !validatePhone(value) ? 'Unesite valjani telefon' : '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string) => {
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = name.startsWith('address.') 
      ? formData.address[name.split('.')[1] as keyof typeof formData.address]
      : formData[name as keyof PersonalData] as string;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleOIBChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 11);
    handleChange('oib', clean);
  };

  const handlePhoneChange = (value: string) => {
    const clean = value.replace(/\s/g, '');
    handleChange('phone', clean);
  };

  const handleSubmit = () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    newErrors.firstName = validateField('firstName', formData.firstName);
    newErrors.lastName = validateField('lastName', formData.lastName);
    newErrors.oib = validateField('oib', formData.oib);
    newErrors.dateOfBirth = validateField('dateOfBirth', formData.dateOfBirth);
    newErrors['address.street'] = validateField('address.street', formData.address.street);
    newErrors['address.houseNumber'] = validateField('address.houseNumber', formData.address.houseNumber);
    newErrors['address.city'] = validateField('address.city', formData.address.city);
    newErrors['address.postalCode'] = validateField('address.postalCode', formData.address.postalCode);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      oib: true,
      dateOfBirth: true,
      'address.street': true,
      'address.houseNumber': true,
      'address.city': true,
      'address.postalCode': true,
      email: true,
      phone: true,
    });

    const hasErrors = Object.values(newErrors).some(e => e !== '');
    if (!hasErrors) {
      onNext(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Osobni podaci</h2>
        <p className="text-gray-600 mt-2">
          Unesi svoje osnovne podatke. Oni će se koristiti za registraciju obrta.
        </p>
      </div>

      <div className="space-y-4">
        {/* Ime i prezime */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Ime *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              placeholder="Ivan"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Prezime *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              placeholder="Horvat"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* OIB i datum rođenja */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="oib">OIB *</Label>
            <Input
              id="oib"
              value={formatOIB(formData.oib)}
              onChange={(e) => handleOIBChange(e.target.value)}
              onBlur={() => handleBlur('oib')}
              placeholder="123 456 789 01"
              maxLength={14}
              className={errors.oib ? 'border-red-500' : ''}
            />
            {errors.oib && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.oib}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Datum rođenja *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              onBlur={() => handleBlur('dateOfBirth')}
              className={errors.dateOfBirth ? 'border-red-500' : ''}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.dateOfBirth}
              </p>
            )}
          </div>
        </div>

        {/* Adresa */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">Adresa prebivališta</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street">Ulica *</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                onBlur={() => handleBlur('address.street')}
                placeholder="Ilica"
                className={errors['address.street'] ? 'border-red-500' : ''}
              />
              {errors['address.street'] && (
                <p className="text-sm text-red-500">{errors['address.street']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseNumber">Kućni br. *</Label>
              <Input
                id="houseNumber"
                value={formData.address.houseNumber}
                onChange={(e) => handleChange('address.houseNumber', e.target.value)}
                onBlur={() => handleBlur('address.houseNumber')}
                placeholder="1"
                className={errors['address.houseNumber'] ? 'border-red-500' : ''}
              />
              {errors['address.houseNumber'] && (
                <p className="text-sm text-red-500">{errors['address.houseNumber']}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Grad *</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                onBlur={() => handleBlur('address.city')}
                placeholder="Zagreb"
                className={errors['address.city'] ? 'border-red-500' : ''}
              />
              {errors['address.city'] && (
                <p className="text-sm text-red-500">{errors['address.city']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Poštanski broj *</Label>
              <Input
                id="postalCode"
                value={formData.address.postalCode}
                onChange={(e) => handleChange('address.postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                onBlur={() => handleBlur('address.postalCode')}
                placeholder="10000"
                maxLength={5}
                className={errors['address.postalCode'] ? 'border-red-500' : ''}
              />
              {errors['address.postalCode'] && (
                <p className="text-sm text-red-500">{errors['address.postalCode']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Kontakt */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">Kontakt podaci</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="ivan@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                value={formatPhone(formData.phone)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="+385 91 123 4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Nazad
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          Nastavi
        </Button>
      </div>
    </div>
  );
}
