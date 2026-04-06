'use client';

import { useState, useEffect } from 'react';
import { BookHeart, Calendar, Image, Plus, Stethoscope, Award, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n/context';
import type { Pet } from '@/lib/types';

interface JournalEntry {
  id: string;
  entry_type: 'milestone' | 'health' | 'behavior' | 'photo' | 'note';
  title: string | null;
  content: string | null;
  image_url: string | null;
  event_date: string | null;
  created_at: string;
}

interface PetDiaryProps {
  pet: Pet;
}

export function PetDiary({ pet }: PetDiaryProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEntries();
    fetchMilestones();
  }, [pet.id]);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/pets/${pet.id}/journal`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`/api/pets/${pet.id}/milestones`);
      const data = await res.json();
      setMilestones(data.milestones || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'health': return <Stethoscope className="h-4 w-4 text-red-500" />;
      case 'photo': return <Image className="h-4 w-4 text-blue-500" />;
      default: return <BookHeart className="h-4 w-4 text-slate-400" />;
    }
  };

  const getEntryLabel = (type: string) => {
    const labels: Record<string, { en: string; hr: string }> = {
      milestone: { en: 'Milestone', hr: 'Prekretnica' },
      health: { en: 'Health', hr: 'Zdravlje' },
      behavior: { en: 'Behavior', hr: 'Ponašanje' },
      photo: { en: 'Photo', hr: 'Fotografija' },
      note: { en: 'Note', hr: 'Bilješka' },
    };
    return labels[type]?.[isEn ? 'en' : 'hr'] || type;
  };

  const filteredEntries = activeTab === 'all' 
    ? entries 
    : entries.filter(e => e.entry_type === activeTab);

  return (
    <Card className="community-section-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-100 to-coral-100 p-2.5 rounded-xl">
              <BookHeart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {isEn ? 'Pet Diary' : 'Dnevnik Ljubimca'}
              </h3>
              <p className="text-sm text-slate-500">{pet.name}</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {isEn ? 'Add Entry' : 'Dodaj'}
          </Button>
        </div>

        {/* Upcoming Milestones */}
        {milestones.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
            <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              {isEn ? 'Upcoming Milestones' : 'Nadolazeće Prekretnice'}
            </h4>
            <div className="space-y-2">
              {milestones.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-600 font-medium">
                    {new Date(m.milestone_date).toLocaleDateString(isEn ? 'en-US' : 'hr-HR', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-slate-700">{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">{isEn ? 'All' : 'Sve'}</TabsTrigger>
            <TabsTrigger value="milestone">{isEn ? 'Milestones' : 'Prekretnice'}</TabsTrigger>
            <TabsTrigger value="health">{isEn ? 'Health' : 'Zdravlje'}</TabsTrigger>
            <TabsTrigger value="photo">{isEn ? 'Photos' : 'Fotke'}</TabsTrigger>
            <TabsTrigger value="note">{isEn ? 'Notes' : 'Bilješke'}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500">
                {isEn ? 'Loading...' : 'Učitavanje...'}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookHeart className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>{isEn ? 'No entries yet' : 'Još nema zapisa'}</p>
                <p className="text-sm">{isEn ? 'Start documenting your pet\'s journey!' : 'Započnite dokumentirati putovanje vašeg ljubimca!'}</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getEntryIcon(entry.entry_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getEntryLabel(entry.entry_type)}
                        </Badge>
                        {entry.event_date && (
                          <span className="text-xs text-slate-500">
                            {new Date(entry.event_date).toLocaleDateString(isEn ? 'en-US' : 'hr-HR')}
                          </span>
                        )}
                      </div>
                      {entry.title && (
                        <h4 className="font-medium text-slate-900">{entry.title}</h4>
                      )}
                      {entry.content && (
                        <p className="text-sm text-slate-600 mt-1">{entry.content}</p>
                      )}
                      {entry.image_url && (
                        <img 
                          src={entry.image_url} 
                          alt="" 
                          className="mt-2 rounded-lg max-h-40 object-cover"
                        />
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
