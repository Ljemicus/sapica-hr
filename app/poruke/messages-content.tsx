'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  ArrowLeft,
  CalendarDays,
  CheckCheck,
  Clock3,
  Home,
  ImagePlus,
  MapPin,
  MessageCircle,
  Paperclip,
  PawPrint,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  IconButton,
  Input,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';
import type { Message, User } from '@/lib/types';
import type { ConversationState } from './message-state';

interface Props {
  currentUser: User;
  conversations: ConversationState[];
}

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/grupni-treninzi', label: 'Grupni treninzi' },
  { href: '/pet-passport', label: 'Pet Passport' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '/moje-usluge' },
  { label: 'Poruke', icon: MessageCircle, href: '/poruke', active: true },
  { label: 'Kalendar', icon: CalendarDays, href: '/kalendar' },
  { label: 'Moje usluge', icon: PawPrint, href: '/moje-usluge' },
  { label: 'Profil', icon: UserRound, href: '/dashboard/profile' },
];

const filters = ['Sve', 'Nepročitano', 'Rezervacije', 'Podrška'];

function formatDateHeader(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Danas';
  if (isYesterday(date)) return 'Jučer';
  return format(date, 'd. MMMM yyyy.', { locale: hr });
}

function formatMessageTime(dateStr?: string | null) {
  if (!dateStr) return '—';
  return format(new Date(dateStr), 'HH:mm');
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd');
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: msg.created_at, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
}

function initials(name?: string) {
  return (name || 'P').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function getConversationContext(conversation: ConversationState) {
  const text = `${conversation.partnerName} ${conversation.lastMessage?.content || ''}`.toLowerCase();
  if (text.includes('podrš') || text.includes('support')) return 'Podrška';
  if (text.includes('groom') || text.includes('šiš') || text.includes('termin')) return 'Grooming termin';
  if (text.includes('trening') || text.includes('grup')) return 'Trening';
  return conversation.lastMessage?.booking_id ? 'Rezervacija' : 'Upit';
}

function demoMessages(currentUser: User, partnerId: string): Message[] {
  const now = new Date();
  return [
    {
      id: 'demo-system-note',
      sender_id: partnerId,
      receiver_id: currentUser.id,
      booking_id: null,
      content: 'Pozdrav! Zanima me termin za čuvanje idući tjedan.',
      image_url: null,
      read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 38).toISOString(),
    },
    {
      id: 'demo-reply-note',
      sender_id: currentUser.id,
      receiver_id: partnerId,
      booking_id: null,
      content: 'Može, pošaljite mi samo okvirne datume i navike ljubimca.',
      image_url: null,
      read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 22).toISOString(),
    },
  ];
}

function normalizeConversations(currentUser: User, conversations: ConversationState[]): ConversationState[] {
  if (conversations.length > 0) {
    return conversations.map((conversation) => ({
      ...conversation,
      messages: conversation.messages.length > 0
        ? conversation.messages
        : conversation.lastMessage
          ? [conversation.lastMessage]
          : [],
    }));
  }

  return [
    {
      partnerId: 'preview-luna',
      partnerName: 'Maja i Luna',
      partnerAvatar: null,
      messages: demoMessages(currentUser, 'preview-luna'),
      lastMessage: {
        id: 'preview-last',
        sender_id: 'preview-luna',
        receiver_id: currentUser.id,
        booking_id: null,
        content: 'Super, šaljem detalje danas popodne.',
        image_url: null,
        read: false,
        created_at: new Date().toISOString(),
      },
      unreadCount: 1,
    },
  ];
}

function ProviderSidebar({ totalUnread }: { totalUnread: number }) {
  return (
    <aside className="hidden xl:block">
      <Card radius="28" className="sticky top-28 p-4">
        <div className="flex items-center gap-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-sage-surface)] p-3">
          <Avatar initials="PP" alt="PetPark" size="md" />
          <div>
            <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">PetPark inbox</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">{totalUnread} nepročitanih</p>
          </div>
        </div>
        <nav aria-label="Inbox navigacija" className="mt-5 space-y-2">
          {sidebarItems.map((item) => (
            <ButtonLink
              href={item.href}
              key={item.label}
              variant={item.active ? 'primary' : 'ghost'}
              size="md"
              className="w-full justify-start"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </ButtonLink>
          ))}
        </nav>
      </Card>
    </aside>
  );
}

function ConversationList({
  conversations,
  selectedPartnerId,
  onSelect,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
}: {
  conversations: ConversationState[];
  selectedPartnerId: string | null;
  onSelect: (partnerId: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) {
  const visible = conversations.filter((conversation) => {
    const context = getConversationContext(conversation);
    const matchesFilter = filter === 'Sve'
      || (filter === 'Nepročitano' && conversation.unreadCount > 0)
      || context.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = !searchTerm
      || conversation.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
      || (conversation.lastMessage?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Card radius="28" className="overflow-hidden p-0">
      <div className="border-b border-[color:var(--pp-color-warm-border)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Razgovori</h2>
            <p className="mt-1 text-xs font-bold text-[color:var(--pp-color-muted-text)]">Upiti, rezervacije i podrška</p>
          </div>
          <Badge variant="orange">{conversations.length}</Badge>
        </div>
        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pretraži razgovore..."
            className="pl-11 shadow-none"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                'rounded-full px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
                filter === item
                  ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]'
                  : 'border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-muted-text)] hover:text-[color:var(--pp-color-forest-text)]',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[620px] overflow-y-auto p-3">
        {visible.length === 0 ? (
          <div className="rounded-[var(--pp-radius-card-24)] bg-[color:var(--pp-color-sage-surface)] p-6 text-center">
            <MessageCircle className="mx-auto size-9 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
            <p className="mt-3 text-sm font-black text-[color:var(--pp-color-forest-text)]">Još nema poruka.</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[color:var(--pp-color-muted-text)]">
              Kad pošaljete upit ili primite rezervaciju, razgovori će se pojaviti ovdje.
            </p>
          </div>
        ) : (
          visible.map((conversation) => {
            const context = getConversationContext(conversation);
            const active = selectedPartnerId === conversation.partnerId;
            return (
              <button
                key={conversation.partnerId}
                type="button"
                onClick={() => onSelect(conversation.partnerId)}
                className={cn(
                  'mb-2 flex w-full items-start gap-3 rounded-[var(--pp-radius-card-24)] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
                  active
                    ? 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-warning-surface)] shadow-[var(--pp-shadow-small-card)]'
                    : 'border-transparent hover:border-[color:var(--pp-color-warm-border)] hover:bg-[color:var(--pp-color-cream-surface)]',
                )}
              >
                <Avatar src={conversation.partnerAvatar || undefined} initials={initials(conversation.partnerName)} alt={conversation.partnerName} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-[color:var(--pp-color-forest-text)]">{conversation.partnerName}</span>
                      <span className="mt-1 inline-flex rounded-full bg-[color:var(--pp-color-sage-surface)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[color:var(--pp-color-teal-accent)]">
                        {context}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] font-bold text-[color:var(--pp-color-muted-text)]">
                      {formatMessageTime(conversation.lastMessage?.created_at)}
                    </span>
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-[color:var(--pp-color-muted-text)]">
                      {conversation.lastMessage?.content || 'Nova poruka'}
                    </span>
                    {conversation.unreadCount > 0 ? <Badge variant="orange">{conversation.unreadCount}</Badge> : null}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}

function ReservationSummary({ conversation }: { conversation: ConversationState }) {
  const context = getConversationContext(conversation);
  return (
    <Card tone="sage" radius="24" shadow="none" className="mb-5 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
            <CalendarDays className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Sažetak razgovora</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[color:var(--pp-color-muted-text)]">
              {context} · sigurni dogovor kroz PetPark poruke · bez realnih akcija u ovom UI previewu.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="teal"><ShieldCheck className="size-3" /> Sigurno</Badge>
          <Badge variant="orange"><Clock3 className="size-3" /> Brzi odgovor</Badge>
        </div>
      </div>
    </Card>
  );
}

function ChatArea({
  currentUser,
  selectedConversation,
  onBack,
}: {
  currentUser: User;
  selectedConversation: ConversationState | undefined;
  onBack: () => void;
}) {
  const messageGroups = selectedConversation ? groupMessagesByDate(selectedConversation.messages) : [];

  if (!selectedConversation) {
    return (
      <Card radius="28" className="flex min-h-[640px] items-center justify-center p-8 text-center">
        <div>
          <span className="mx-auto flex size-16 items-center justify-center rounded-[28px] bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-teal-accent)]">
            <MessageCircle className="size-8" aria-hidden />
          </span>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Odaberite razgovor</h2>
          <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
            S lijeve strane odaberite upit ili rezervaciju za pregled razgovora.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card radius="28" className="flex min-h-[640px] flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-5">
        <div className="flex items-center gap-3">
          <IconButton aria-label="Natrag na razgovore" variant="ghost" className="lg:hidden" onClick={onBack}>
            <ArrowLeft className="size-5" aria-hidden />
          </IconButton>
          <Avatar src={selectedConversation.partnerAvatar || undefined} initials={initials(selectedConversation.partnerName)} alt={selectedConversation.partnerName} size="lg" />
          <div>
            <h2 className="text-lg font-black text-[color:var(--pp-color-forest-text)]">{selectedConversation.partnerName}</h2>
            <p className="mt-1 text-xs font-bold text-[color:var(--pp-color-muted-text)]">Aktivan razgovor · odgovor obično stiže brzo</p>
          </div>
        </div>
        <Badge variant="teal">Online</Badge>
      </div>

      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,var(--pp-color-cream-surface),var(--pp-color-card-surface))] p-5">
        <ReservationSummary conversation={selectedConversation} />

        <div className="rounded-[var(--pp-radius-card-24)] border border-dashed border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)]/72 p-4 text-center text-xs font-bold text-[color:var(--pp-color-muted-text)]">
          PetPark napomena: dogovori termin, cijenu i detalje ljubimca prije potvrde rezervacije.
        </div>

        <div className="mt-5 space-y-5">
          {messageGroups.length > 0 ? (
            messageGroups.map((group) => (
              <div key={group.date}>
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-[color:var(--pp-color-sage-surface)] px-3 py-1 text-[11px] font-black text-[color:var(--pp-color-muted-text)]">
                    {formatDateHeader(group.date)}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.messages.map((message, index) => {
                    const mine = message.sender_id === currentUser.id;
                    return (
                      <div key={message.id || `${group.date}-${index}`} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[82%] rounded-[24px] px-4 py-3 shadow-[var(--pp-shadow-small-card)] md:max-w-[68%]',
                            mine
                              ? 'rounded-br-md bg-[color:var(--pp-color-orange-primary)] text-white'
                              : 'rounded-bl-md border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-forest-text)]',
                          )}
                        >
                          <p className="text-sm font-semibold leading-6">{message.content || (message.image_url ? 'Fotografija' : 'Poruka')}</p>
                          <div className={cn('mt-2 flex items-center justify-end gap-1 text-[10px] font-bold', mine ? 'text-white/75' : 'text-[color:var(--pp-color-muted-text)]')}>
                            <span>{formatMessageTime(message.created_at)}</span>
                            {mine ? <CheckCheck className="size-3" aria-hidden /> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-14 text-center">
              <MessageCircle className="mx-auto size-11 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
              <p className="mt-3 text-sm font-black text-[color:var(--pp-color-forest-text)]">Započnite razgovor s {selectedConversation.partnerName}</p>
              <p className="mt-1 text-xs font-semibold text-[color:var(--pp-color-muted-text)]">Upit, termin ili napomena bit će prikazani ovdje.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm"><Sparkles className="size-4" /> Pošalji ponudu</Button>
          <Button type="button" variant="secondary" size="sm"><CheckCheck className="size-4" /> Potvrdi termin</Button>
          <Button type="button" variant="secondary" size="sm"><MapPin className="size-4" /> Podijeli lokaciju</Button>
        </div>
        <div className="flex gap-2">
          <IconButton aria-label="Dodaj privitak" variant="secondary"><Paperclip className="size-5" aria-hidden /></IconButton>
          <IconButton aria-label="Dodaj fotografiju" variant="secondary"><ImagePlus className="size-5" aria-hidden /></IconButton>
          <Input placeholder="Napišite poruku..." readOnly aria-label="Napišite poruku" className="flex-1" />
          <IconButton aria-label="Pošalji poruku" variant="primary" disabled><Send className="size-5" aria-hidden /></IconButton>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-[color:var(--pp-color-muted-text)]">
          Slanje je namjerno isključeno u ovom UI-first prolazu — postojeći podaci se samo prikazuju.
        </p>
      </div>
    </Card>
  );
}

export function MessagesContent({ currentUser, conversations: initialConversations }: Props) {
  const searchParams = useSearchParams();
  const toParam = searchParams.get('to');
  const conversations = useMemo(() => normalizeConversations(currentUser, initialConversations), [currentUser, initialConversations]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(toParam || (conversations[0]?.partnerId ?? null));
  const [filter, setFilter] = useState('Sve');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedConversation = conversations.find((conversation) => conversation.partnerId === selectedPartnerId);
  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  return (
    <main data-petpark-route="poruke" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/moje-usluge" size="sm">Moje usluge</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[620px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[11%] top-[330px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[260px_1fr]">
          <ProviderSidebar totalUnread={totalUnread} />

          <div className="space-y-6">
            <Card radius="28" className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-8 top-8 hidden size-24 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <Badge variant="teal"><UsersRound className="size-3" /> Rezervacije · Upiti · Podrška</Badge>
                  <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-6xl">Poruke</h1>
                  <p className="mt-4 max-w-[720px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">
                    Razgovori s vlasnicima, sitterima, groomerima i trenerima na jednom sigurnom mjestu.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge variant="orange">Rezervacije</Badge>
                    <Badge variant="teal">Upiti</Badge>
                    <Badge variant="sage">Podrška</Badge>
                  </div>
                </div>
                <ButtonLink href="/usluge" variant="secondary" size="lg"><Search className="size-5" /> Pronađi uslugu</ButtonLink>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[410px_minmax(0,1fr)]">
              <div className={cn(selectedPartnerId ? 'hidden lg:block' : 'block')}>
                <ConversationList
                  conversations={conversations}
                  selectedPartnerId={selectedPartnerId}
                  onSelect={setSelectedPartnerId}
                  filter={filter}
                  setFilter={setFilter}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
              <div className={cn(!selectedPartnerId ? 'hidden lg:block' : 'block')}>
                <ChatArea
                  currentUser={currentUser}
                  selectedConversation={selectedConversation}
                  onBack={() => setSelectedPartnerId(null)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
