import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Camera, CheckCircle, ClipboardList, Navigation, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { SERVICE_LABELS, STATUS_LABELS, type PetUpdate, type ServiceType } from '@/lib/types';
import { statusColors, type DashboardBooking } from './sitter-dashboard-types';

interface Props {
  bookings: DashboardBooking[];
  pendingBookings: DashboardBooking[];
  upcomingBookings: DashboardBooking[];
  sentUpdates: PetUpdate[];
  onUpdateStatus: (bookingId: string, status: 'accepted' | 'rejected') => void;
  onOpenUpdateDialog: (bookingId: string) => void;
}

export function SitterBookingsTab({ bookings, pendingBookings, upcomingBookings, sentUpdates, onUpdateStatus, onOpenUpdateDialog }: Props) {
  const historicalBookings = bookings.filter(
    (b) => b.status !== 'pending' && !(b.status === 'accepted' && new Date(b.start_date) >= new Date())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {pendingBookings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Novi zahtjevi ({pendingBookings.length})
          </h3>
          {pendingBookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src={booking.owner?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold">{booking.owner?.name}</h4>
                        <Badge className={statusColors.pending}>{STATUS_LABELS[booking.status]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium text-foreground">{booking.pet?.name}</span> · {booking.pet?.species === 'dog' ? 'Pas' : booking.pet?.species === 'cat' ? 'Mačka' : booking.pet?.species}
                      </p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.start_date), 'd. MMM', { locale: hr })} - {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                        <p className="font-semibold text-green-600">{booking.total_price}€</p>
                      </div>
                      {booking.message && (
                        <p className="mt-3 text-sm bg-white/80 dark:bg-gray-900/50 rounded-xl p-3 italic text-muted-foreground">
                          “{booking.message}”
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => onUpdateStatus(booking.id, 'accepted')} className="bg-green-500 hover:bg-green-600 text-white shadow-sm btn-hover">
                      <CheckCircle className="h-4 w-4 mr-1" /> Prihvati
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onUpdateStatus(booking.id, 'rejected')} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 btn-hover">
                      <XCircle className="h-4 w-4 mr-1" /> Odbij
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Nadolazeće rezervacije ({upcomingBookings.length})
          </h3>
          {upcomingBookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src={booking.owner?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-300 text-white">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold">{booking.owner?.name}</h4>
                        <Badge className={statusColors.accepted}>{STATUS_LABELS[booking.status]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium text-foreground">{booking.pet?.name}</span> · {SERVICE_LABELS[booking.service_type as ServiceType]}
                      </p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{format(new Date(booking.start_date), 'd. MMM', { locale: hr })} - {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                        <p className="font-semibold text-green-600">{booking.total_price}€</p>
                        {booking.address && (
                          <a href={`https://maps.apple.com/?q=${encodeURIComponent(booking.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs mt-1">
                            <Navigation className="h-3 w-3" /> {booking.address}
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => onOpenUpdateDialog(booking.id)} className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 btn-hover">
                          <Camera className="h-4 w-4 mr-1" /> Pošalji ažuriranje
                        </Button>
                        <Link href={`/poruke?to=${booking.owner?.id}`} className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-[color,box-shadow] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                          Poruke
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {historicalBookings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Povijest rezervacija ({historicalBookings.length})
          </h3>
          {historicalBookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{booking.owner?.name} - {booking.pet?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.start_date), 'd. MMM', { locale: hr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
                    <p className="text-sm font-medium mt-1">{booking.total_price}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <EmptyState icon={ClipboardList} title="Nema rezervacija" description="Kada vlasnici rezerviraju vaše usluge, vidjet ćete ih ovdje." />
      )}

      {sentUpdates.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            Poslana ažuriranja ({sentUpdates.length})
          </h3>
          {sentUpdates.slice(0, 5).map((update) => (
            <Card key={update.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                {update.photo_url ? (
                  <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                    <Image src={update.photo_url} alt="Fotografija ažuriranja" fill className="object-cover" sizes="48px" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center flex-shrink-0 border border-orange-100/50">
                    <span className="text-2xl">{update.emoji}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{update.caption}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {update.type === 'photo' ? 'Foto' : update.type === 'video' ? 'Video' : 'Tekst'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(update.created_at), 'd. MMM, HH:mm', { locale: hr })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
