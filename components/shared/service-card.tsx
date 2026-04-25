'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dog, Home, Scissors, GraduationCap, Stethoscope, PawPrint } from 'lucide-react';

export type ServiceType = 'šetanje' | 'čuvanje' | 'grooming' | 'dresura' | 'veterinar';

interface ServiceCardProps {
  service: ServiceType;
  title: string;
  description: string;
  className?: string;
  href?: string;
}

const serviceIcons: Record<ServiceType, React.ElementType> = {
  'šetanje': Dog,
  'čuvanje': Home,
  'grooming': Scissors,
  'dresura': GraduationCap,
  'veterinar': Stethoscope,
};

const serviceColors: Record<ServiceType, string> = {
  'šetanje': 'from-blue-500 to-cyan-400',
  'čuvanje': 'from-amber-500 to-orange-400',
  'grooming': 'from-pink-500 to-rose-400',
  'dresura': 'from-purple-500 to-violet-400',
  'veterinar': 'from-emerald-500 to-teal-400',
};

// const _serviceTranslations: Record<ServiceType, { hr: string; en: string }> = {
//   'šetanje': { hr: 'Šetanje pasa', en: 'Dog walking' },
//   'čuvanje': { hr: 'Čuvanje ljubimaca', en: 'Pet sitting' },
//   'grooming': { hr: 'Njega i grooming', en: 'Grooming & care' },
//   'dresura': { hr: 'Dresura i trening', en: 'Training & agility' },
//   'veterinar': { hr: 'Veterinarske usluge', en: 'Veterinary services' },
// };

export function ServiceCard({ 
  service, 
  title, 
  description, 
  className,
  href: _href = '#' 
}: ServiceCardProps) {
  const Icon = serviceIcons[service];
  const gradient = serviceColors[service];
  
  return (
    <motion.div
      className={cn(
        'group relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg',
        'border border-gray-200 dark:border-gray-800',
        'transition-all duration-200 ease-out',
        'hover:shadow-xl hover:-translate-y-1',
        'cursor-pointer',
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-white/5 group-hover:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Gradient ring on hover */}
      <div className={cn(
        'absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-20',
        gradient,
        'blur-sm group-hover:blur transition-all duration-300 pointer-events-none'
      )} />
      
      <div className="relative z-10">
        {/* Icon with bounce animation */}
        <motion.div
          className={cn(
            'w-14 h-14 rounded-xl mb-5 flex items-center justify-center',
            'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900',
            'border border-gray-200 dark:border-gray-700'
          )}
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, -5, 0],
            transition: { duration: 0.5 }
          }}
        >
          <motion.div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              'bg-gradient-to-br',
              gradient
            )}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-heading)]">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Learn more link with arrow animation */}
        <div className="flex items-center text-sm font-medium">
          <span className={cn(
            'text-transparent bg-clip-text bg-gradient-to-r',
            gradient
          )}>
            Saznajte više
          </span>
          <motion.div
            className="ml-2"
            animate={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                className={cn(
                  'stroke-gradient-to-r',
                  gradient.split(' ')[0].replace('from-', '')
                )}
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Subtle paw pattern in background */}
      <div className="absolute bottom-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <PawPrint className="h-16 w-16" />
      </div>
    </motion.div>
  );
}

// Example usage component with all services
export function ServiceCardsGrid() {
  const services: Array<{ type: ServiceType; title: string; description: string; href: string }> = [
    {
      type: 'šetanje',
      title: 'Šetanje pasa',
      description: 'Profesionalno šetanje pasa po vašem rasporedu. Aktivnost, druženje i briga za vašeg psa dok ste zauzeti.',
      href: '/pretraga?service=walking'
    },
    {
      type: 'čuvanje',
      title: 'Čuvanje ljubimaca',
      description: 'Pouzdani sitteri koji će se brinuti za vašeg ljubimca kao za svog — kod vas ili kod njih.',
      href: '/pretraga?service=boarding'
    },
    {
      type: 'grooming',
      title: 'Njega i grooming',
      description: 'Profesionalna njega dlake, kupanje, šišanje i styling. Vaš ljubimac zaslužuje da bude u najboljem izdanju.',
      href: '/njega'
    },
    {
      type: 'dresura',
      title: 'Dresura i trening',
      description: 'Certificirani treneri za poslušnost, socijalizaciju i agility. Pomozite svom psu da bude najbolja verzija sebe.',
      href: '/dresura'
    },
    {
      type: 'veterinar',
      title: 'Veterinarske usluge',
      description: 'Veterinarske ordinacije i hitne službe. Preventivni pregledi, cijepljenja i specijalističke usluge.',
      href: '/pretraga'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.type}
          service={service.type}
          title={service.title}
          description={service.description}
          href={service.href}
        />
      ))}
    </div>
  );
}