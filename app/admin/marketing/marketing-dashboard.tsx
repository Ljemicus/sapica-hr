'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { 
  Mail, 
  Send, 
  Users, 
  BarChart3, 
  Plus, 
  Eye, 
  Trash2, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Search,
  Megaphone,
  Target,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  segment: string[];
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'transactional' | 'marketing' | 'notification';
  lastUsed?: string;
}

const SEGMENTS = [
  { id: 'all', label: 'Svi korisnici', icon: Users },
  { id: 'owners', label: 'Vlasnici', icon: Target },
  { id: 'sitters', label: 'Sitteri', icon: Sparkles },
  { id: 'groomers', label: 'Groomeri', icon: Sparkles },
  { id: 'trainers', label: 'Treneri', icon: Sparkles },
  { id: 'breeders', label: 'Uzgajivači', icon: Sparkles },
  { id: 'rescue', label: 'Rescue udruge', icon: Megaphone },
  { id: 'inactive', label: 'Neaktivni (30+ dana)', icon: Clock },
  { id: 'new', label: 'Novi korisnici (7 dana)', icon: Sparkles },
];

const MOCK_CAMPAIGNS: EmailCampaign[] = [
  {
    id: '1',
    name: 'Proljetna promocija',
    subject: '🌸 Proljeće je tu — 20% popusta na prvo čuvanje!',
    content: '<h1>Proljetna akcija</h1><p>Iskoristite 20% popusta...</p>',
    status: 'sent',
    segment: ['owners', 'new'],
    recipientCount: 245,
    sentCount: 245,
    openRate: 42.5,
    clickRate: 12.3,
    sentAt: '2026-04-01T10:00:00Z',
    createdAt: '2026-03-28T14:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '2',
    name: 'Novi sitteri u Zagrebu',
    subject: 'Novi verificirani sitteri u vašem gradu 🐕',
    content: '<h1>Novi sitteri</h1><p>Upoznajte naše nove čuvare...</p>',
    status: 'draft',
    segment: ['owners'],
    recipientCount: 189,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    createdAt: '2026-04-05T09:15:00Z',
    createdBy: 'admin',
  },
  {
    id: '3',
    name: 'Weekly newsletter',
    subject: 'PetPark Weekly: Novosti i savjeti',
    content: '<h1>Weekly</h1><p>Novosti iz svijeta ljubimaca...</p>',
    status: 'scheduled',
    segment: ['all'],
    recipientCount: 1200,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    scheduledAt: '2026-04-08T08:00:00Z',
    createdAt: '2026-04-06T07:00:00Z',
    createdBy: 'admin',
  },
];

const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: '1', name: 'Welcome vlasnik', subject: 'Dobrodošli u PetPark!', content: '<h1>Dobrodošli!</h1><p>Hvala vam što ste se pridružili PetParku.</p>', category: 'welcome', lastUsed: '2026-04-05' },
  { id: '2', name: 'Booking confirmation', subject: 'Vaša rezervacija je potvrđena', content: '<h1>Rezervacija potvrđena</h1><p>Vaša rezervacija je uspješno potvrđena.</p>', category: 'transactional', lastUsed: '2026-04-06' },
  { id: '3', name: 'Review request', subject: 'Kako je prošlo čuvanje?', content: '<h1>Kako je prošlo?</h1><p>Molimo vas da ostavite recenziju.</p>', category: 'transactional', lastUsed: '2026-04-04' },
  { id: '4', name: 'Proljetna akcija', subject: '🌸 Proljeće je tu — 20% popusta!', content: '<h1>Proljetna akcija</h1><p>Iskoristite 20% popusta na prvu rezervaciju!</p>', category: 'marketing', lastUsed: '2026-04-01' },
];

export function MarketingDashboard() {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(MOCK_CAMPAIGNS);
  const [templates, _setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_selectedCampaign, _setSelectedCampaign] = useState<EmailCampaign | null>(null);
  
  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    segment: [] as string[],
    scheduledAt: '',
  });

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: EmailCampaign['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      sending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      sent: 'bg-green-50 text-green-700 border-green-200',
      paused: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    const labels = {
      draft: 'Skica',
      scheduled: 'Zakazano',
      sending: 'Šalje se',
      sent: 'Poslano',
      paused: 'Pauzirano',
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast.error('Ispunite sva obavezna polja');
      return;
    }
    if (newCampaign.segment.length === 0) {
      toast.error('Odaberite barem jedan segment');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      subject: newCampaign.subject,
      content: newCampaign.content,
      status: newCampaign.scheduledAt ? 'scheduled' : 'draft',
      segment: newCampaign.segment,
      recipientCount: Math.floor(Math.random() * 500) + 100,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      scheduledAt: newCampaign.scheduledAt || undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    setCampaigns([campaign, ...campaigns]);
    setNewCampaign({ name: '', subject: '', content: '', segment: [], scheduledAt: '' });
    setIsCreating(false);
    toast.success(newCampaign.scheduledAt ? 'Kampanja zakazana!' : 'Kampanja spremljena kao skica');
  };

  const handleSendCampaign = async (campaignId: string) => {
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCampaigns(campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, status: 'sent' as const, sentAt: new Date().toISOString(), sentCount: c.recipientCount }
        : c
    ));
    
    setIsSending(false);
    toast.success('Kampanja poslana!');
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
    toast.success('Kampanja obrisana');
  };

  const toggleSegment = (segmentId: string) => {
    setNewCampaign(prev => ({
      ...prev,
      segment: prev.segment.includes(segmentId)
        ? prev.segment.filter(s => s !== segmentId)
        : [...prev.segment, segmentId]
    }));
  };

  const stats = {
    totalSent: campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + c.sentCount, 0),
    avgOpenRate: campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + c.openRate, 0) / campaigns.filter(c => c.status === 'sent').length || 0,
    avgClickRate: campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + c.clickRate, 0) / campaigns.filter(c => c.status === 'sent').length || 0,
    activeCampaigns: campaigns.filter(c => c.status === 'scheduled' || c.status === 'sending').length,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-warm-orange flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Marketing</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Email Marketing</h1>
          <p className="text-muted-foreground mt-1">Upravljanje email kampanjama, segmentacijom i analitikom.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/founder-dashboard">
            <Button variant="outline" size="sm">Founder Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ukupno poslano</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Prosječan open rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgClickRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Prosječan click rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">Aktivnih kampanja</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="campaigns" className="gap-2">
            <Megaphone className="h-4 w-4" />
            Kampanje
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Mail className="h-4 w-4" />
            Predlošci
          </TabsTrigger>
          <TabsTrigger value="segments" className="gap-2">
            <Users className="h-4 w-4" />
            Segmenti
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova kampanja
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Sve kampanje</CardTitle>
                <CardDescription>Upravljajte postojećim email kampanjama</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pretraži kampanje..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCampaigns.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nema kampanja. Kreirajte prvu!</p>
                  </div>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border hover:border-warm-orange/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(campaign.status)}
                          <span className="font-medium truncate">{campaign.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{campaign.subject}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.segment.map(s => SEGMENTS.find(seg => seg.id === s)?.label).join(', ')}
                          </span>
                          <span>•</span>
                          <span>{campaign.recipientCount.toLocaleString()} primatelja</span>
                          {campaign.scheduledAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Zakazano: {format(new Date(campaign.scheduledAt), 'dd.MM.yyyy. HH:mm', { locale: hr })}
                              </span>
                            </>
                          )}
                          {campaign.sentAt && (
                            <>
                              <span>•</span>
                              <span>Poslano: {format(new Date(campaign.sentAt), 'dd.MM.yyyy.', { locale: hr })}</span>
                            </>
                          )}
                        </div>
                        {campaign.status === 'sent' && (
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-green-600 flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {campaign.openRate.toFixed(1)}% otvoreno
                            </span>
                            <span className="text-purple-600 flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {campaign.clickRate.toFixed(1)}% klikova
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendCampaign(campaign.id)}
                              disabled={isSending}
                            >
                              {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              Pošalji
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {campaign.status === 'scheduled' && (
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Otkaži
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger onClick={() => _setSelectedCampaign(campaign)}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{campaign.name}</DialogTitle>
                              <DialogDescription>Pregled kampanje</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Subject</Label>
                                <p className="text-sm mt-1">{campaign.subject}</p>
                              </div>
                              <div>
                                <Label>Sadržaj</Label>
                                <div 
                                  className="mt-2 p-4 bg-gray-50 rounded-lg text-sm"
                                  dangerouslySetInnerHTML={{ __html: campaign.content }}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Segmenti</Label>
                                  <p className="text-sm mt-1">{campaign.segment.join(', ')}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <p className="text-sm mt-1">{getStatusBadge(campaign.status)}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Email predlošci</CardTitle>
              <CardDescription>Ponovo iskoristite postojeće predloške</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="border hover:border-warm-orange/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setNewCampaign({
                        ...newCampaign,
                        name: template.name,
                        subject: template.subject,
                        content: template.content,
                      });
                      setActiveTab('create');
                      toast.success('Predložak učitan!');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className={
                          template.category === 'welcome' ? 'bg-green-50 text-green-700' :
                          template.category === 'transactional' ? 'bg-blue-50 text-blue-700' :
                          template.category === 'marketing' ? 'bg-purple-50 text-purple-700' :
                          'bg-gray-50 text-gray-700'
                        }>
                          {template.category}
                        </Badge>
                        {template.lastUsed && (
                          <span className="text-xs text-muted-foreground">
                            Zadnje korištenje: {template.lastUsed}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{template.subject}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Segmenti korisnika</CardTitle>
              <CardDescription>Pregled dostupnih segmentacija</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {SEGMENTS.map((segment) => (
                  <Card key={segment.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-warm-orange/10 flex items-center justify-center">
                          <segment.icon className="h-5 w-5 text-warm-orange" />
                        </div>
                        <div>
                          <h3 className="font-medium">{segment.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {segment.id === 'all' ? '~1,200' : 
                             segment.id === 'owners' ? '~850' :
                             segment.id === 'sitters' ? '~180' :
                             segment.id === 'rescue' ? '~25' :
                             '~100+'} korisnika
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Nova email kampanja</CardTitle>
              <CardDescription>Kreirajte i pošaljite novu email kampanju</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv kampanje</Label>
                <Input
                  id="name"
                  placeholder="npr. Proljetna promocija 2026"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject line</Label>
                <Input
                  id="subject"
                  placeholder="npr. 🌸 Proljeće je tu — 20% popusta na prvo čuvanje!"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Savjet: Emoji u subjectu povećavaju open rate za ~15%
                </p>
              </div>

              <div className="space-y-2">
                <Label>Segmenti primatelja</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SEGMENTS.map((segment) => (
                    <div key={segment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={segment.id}
                        checked={newCampaign.segment.includes(segment.id)}
                        onCheckedChange={() => toggleSegment(segment.id)}
                      />
                      <Label htmlFor={segment.id} className="text-sm cursor-pointer">
                        {segment.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Sadržaj emaila (HTML)</Label>
                <Textarea
                  id="content"
                  placeholder="<h1>Pozdrav!</h1><p>Vaš email sadržaj...</p>"
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Zakaži slanje (opcionalno)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={newCampaign.scheduledAt}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Ostavite prazno za odmah slanje ili spremanje kao skicu
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={isCreating}
                  className="bg-warm-orange hover:bg-warm-orange/90"
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : newCampaign.scheduledAt ? (
                    <Clock className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {newCampaign.scheduledAt ? 'Zakaži kampanju' : 'Spremi kao skicu'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewCampaign({ name: '', subject: '', content: '', segment: [], scheduledAt: '' })}
                >
                  Očisti
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
