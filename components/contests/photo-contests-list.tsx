'use client';

import { useState, useEffect } from 'react';
import { Trophy, Camera, Calendar, Users, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/context';
import Link from 'next/link';

interface Contest {
  id: string;
  title: string;
  description: string;
  theme: string;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'voting' | 'closed';
  prize_description: string | null;
  entries_count?: number;
}

export function PhotoContestsList() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch('/api/contests?status=all&limit=6');
      const data = await res.json();
      setContests(data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">{isEn ? 'Active' : 'Aktivno'}</Badge>;
      case 'voting':
        return <Badge className="bg-orange-500 text-white">{isEn ? 'Voting' : 'Glasanje'}</Badge>;
      case 'closed':
        return <Badge variant="secondary">{isEn ? 'Closed' : 'Završeno'}</Badge>;
      default:
        return <Badge variant="outline">{isEn ? 'Upcoming' : 'Uskoro'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <Card className="community-section-card">
        <CardContent className="p-8 text-center">
          <Camera className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {isEn ? 'No contests at the moment. Check back soon!' : 'Trenutno nema natjecanja. Vratite se uskoro!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contests.map((contest) => (
        <Link key={contest.id} href={`/natjecanja/${contest.id}`}>
          <Card className="community-section-card overflow-hidden hover:shadow-eve transition-all cursor-pointer h-full">
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-coral-100 relative">
              {contest.cover_image_url ? (
                <img 
                  src={contest.cover_image_url} 
                  alt={contest.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Trophy className="h-12 w-12 text-orange-300" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                {getStatusBadge(contest.status)}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg text-slate-900 mb-1">{contest.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{contest.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(contest.end_date).toLocaleDateString(isEn ? 'en-US' : 'hr-HR')}
                </span>
                {contest.entries_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {contest.entries_count} {isEn ? 'entries' : 'prijava'}
                  </span>
                )}
              </div>

              {contest.prize_description && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-orange-600 font-medium">
                    🎁 {contest.prize_description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
