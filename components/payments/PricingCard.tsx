'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Tag } from 'lucide-react';

export interface ServiceItem {
  name: string;
  price: number;
  duration: string;
  description: string;
}

interface PricingCardProps {
  services: ServiceItem[];
  onBook?: (service: ServiceItem) => void;
}

export function PricingCard({ services, onBook }: PricingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usluge i cijene</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{service.name}</span>
                <Badge variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {service.price.toFixed(2)} €
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {service.duration}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onBook?.(service)}
              className="mt-2 sm:mt-0"
            >
              Pošalji upit
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
