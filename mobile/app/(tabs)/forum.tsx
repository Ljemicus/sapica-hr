import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';

const CATEGORIES = [
  { key: 'sve', label: 'Sve', emoji: '💬' },
  { key: 'pitanja', label: 'Pitanja', emoji: '❓' },
  { key: 'savjeti', label: 'Savjeti', emoji: '💡' },
  { key: 'price', label: 'Priče', emoji: '❤️' },
  { key: 'izgubljeni', label: 'SOS', emoji: '🚨' },
];

const TOPICS = [
  {
    id: 'ft-1',
    category: 'pitanja',
    title: 'Koliko često trebam voditi psa veterinaru?',
    excerpt: 'Redoviti pregledi su ključ prevencije. Evo što preporučuju veterinari.',
    author: 'Marina K.',
    initial: 'M',
    timeAgo: 'prije 2 dana',
    comments: 8,
    likes: 24,
    pinned: true,
    hot: true,
  },
  {
    id: 'ft-2',
    category: 'savjeti',
    title: '5 trikova za učenje štenca da ne grize',
    excerpt: 'Jednostavne metode koje funkcioniraju od prvog dana.',
    author: 'Luka J.',
    initial: 'L',
    timeAgo: 'prije 3 dana',
    comments: 12,
    likes: 45,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-3',
    category: 'price',
    title: 'Kako je Bella spasila moj dan — priča o udomljavanju',
    excerpt: 'Nisam znala da mi treba pas dok se Bella nije pojavila u mom životu.',
    author: 'Ana H.',
    initial: 'A',
    timeAgo: 'prije 4 dana',
    comments: 15,
    likes: 67,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-4',
    category: 'izgubljeni',
    title: '🚨 Izgubljen zlatni retriver u Maksimiru',
    excerpt: 'Molim pomoć! Nestao je jučer oko 17h kod jezera.',
    author: 'Tomislav B.',
    initial: 'T',
    timeAgo: 'jučer',
    comments: 22,
    likes: 38,
    pinned: true,
    hot: true,
  },
  {
    id: 'ft-5',
    category: 'pitanja',
    title: 'Preporuka za hranu za mačke s osjetljivim želucem?',
    excerpt: 'Probali smo sve iz dućana, ništa ne pomaže. Ima tko savjet?',
    author: 'Petra K.',
    initial: 'P',
    timeAgo: 'prije 6 dana',
    comments: 7,
    likes: 18,
    pinned: false,
    hot: false,
  },
  {
    id: 'ft-6',
    category: 'savjeti',
    title: 'Kako pripremiti ljubimca za putovanje avionom',
    excerpt: 'Sve što trebate znati — od dokumentacije do transportera.',
    author: 'Filip M.',
    initial: 'F',
    timeAgo: 'prije tjedan',
    comments: 11,
    likes: 52,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-7',
    category: 'pitanja',
    title: 'Koji je najbolji povodac za psa koji vuče?',
    excerpt: 'Imam labradora koji stalno vuče na šetnji. Koji povodac preporučate?',
    author: 'Ivana M.',
    initial: 'I',
    timeAgo: 'prije tjedan',
    comments: 14,
    likes: 29,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-8',
    category: 'price',
    title: 'Moj pas i mačka su postali najbolji prijatelji',
    excerpt: 'Nakon 3 mjeseca zajedno, ne odvajaju se jedno od drugog.',
    author: 'Marko D.',
    initial: 'M',
    timeAgo: 'prije 8 dana',
    comments: 19,
    likes: 73,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-9',
    category: 'savjeti',
    title: 'Najbolje igre za kišne dane s psom',
    excerpt: 'Kad vani pada kiša, evo kako zabaviti svog psa unutra.',
    author: 'Sara B.',
    initial: 'S',
    timeAgo: 'prije 9 dana',
    comments: 6,
    likes: 31,
    pinned: false,
    hot: false,
  },
  {
    id: 'ft-10',
    category: 'izgubljeni',
    title: '🚨 Nestala mačka u Splitu — Spinut',
    excerpt: 'Bijela mačka zelenih očiju, nedostaje od petka. Molim pomoć!',
    author: 'Ana P.',
    initial: 'A',
    timeAgo: 'prije 10 dana',
    comments: 16,
    likes: 42,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-11',
    category: 'pitanja',
    title: 'Kada sterilizirati mačku?',
    excerpt: 'Naša mačka ima 5 mjeseci, veterinar kaže da čekamo. Vaša iskustva?',
    author: 'Dario K.',
    initial: 'D',
    timeAgo: 'prije 11 dana',
    comments: 9,
    likes: 15,
    pinned: false,
    hot: false,
  },
  {
    id: 'ft-12',
    category: 'savjeti',
    title: 'Kako odabrati pravog sittera — moje iskustvo',
    excerpt: 'Koristim Šapicu već godinu dana, evo na što obraćam pažnju.',
    author: 'Nina T.',
    initial: 'N',
    timeAgo: 'prije 12 dana',
    comments: 21,
    likes: 58,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-13',
    category: 'price',
    title: 'Spasili smo psa s ceste — evo naše priče',
    excerpt: 'Bio je uplašen i mršav, danas je najsretniji pas na svijetu.',
    author: 'Tomislav K.',
    initial: 'T',
    timeAgo: 'prije 2 tjedna',
    comments: 28,
    likes: 89,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-14',
    category: 'pitanja',
    title: 'Pas se boji petardi — što učiniti?',
    excerpt: 'Svake godine isti problem s novogodišnjim petardama. Savjeti?',
    author: 'Lana V.',
    initial: 'L',
    timeAgo: 'prije 2 tjedna',
    comments: 17,
    likes: 35,
    pinned: false,
    hot: false,
  },
  {
    id: 'ft-15',
    category: 'savjeti',
    title: 'DIY igračke za pse od starih čarapa',
    excerpt: 'Jednostavne i besplatne igračke koje će vaš pas obožavati!',
    author: 'Maja L.',
    initial: 'M',
    timeAgo: 'prije 2 tjedna',
    comments: 5,
    likes: 22,
    pinned: false,
    hot: false,
  },
];

export default function ForumScreen() {
  const [activeCategory, setActiveCategory] = useState('sve');

  const filtered = activeCategory === 'sve'
    ? TOPICS
    : TOPICS.filter(t => t.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.likes - a.likes;
  });

  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Category pills — same style as blog */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryPill,
              activeCategory === cat.key && styles.categoryPillActive,
            ]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.categoryLabel,
                activeCategory === cat.key && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured topic — blog style */}
      {featured && (
        <View style={styles.featuredContainer}>
          <View style={styles.featuredInner}>
            <View style={styles.featuredBadgeRow}>
              {featured.pinned && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>📌 Prikvačeno</Text>
                </View>
              )}
              {featured.hot && (
                <View style={[styles.featuredBadge, { backgroundColor: '#ef4444' }]}>
                  <Text style={styles.featuredBadgeText}>🔥 Popularno</Text>
                </View>
              )}
            </View>
            <Text style={styles.featuredTitle}>{featured.title}</Text>
            <Text style={styles.featuredExcerpt}>{featured.excerpt}</Text>
            <View style={styles.featuredMeta}>
              <Text style={styles.featuredAuthor}>{featured.author}</Text>
              <Text style={styles.featuredDot}>·</Text>
              <Text style={styles.featuredDate}>{featured.timeAgo}</Text>
              <Text style={styles.featuredDot}>·</Text>
              <Ionicons name="chatbubble-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.featuredDate}>{featured.comments}</Text>
              <Ionicons name="heart-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.featuredDate}>{featured.likes}</Text>
            </View>
          </View>
        </View>
      )}

      {/* New post button */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Rasprave</Text>
        <TouchableOpacity
          style={styles.newPostBtn}
          onPress={() => Alert.alert('Nova tema', 'Ova funkcionalnost dolazi uskoro!')}
        >
          <Ionicons name="create-outline" size={14} color={Colors.white} />
          <Text style={styles.newPostText}>Nova tema</Text>
        </TouchableOpacity>
      </View>

      {/* Topic list — blog card style */}
      <View style={styles.listSection}>
        {rest.map(topic => {
          const cat = CATEGORIES.find(c => c.key === topic.category);
          return (
            <Card key={topic.id} style={styles.topicCard}>
              <View style={styles.topicRow}>
                <Avatar name={topic.author} size={44} />
                <View style={styles.topicContent}>
                  <View style={styles.topicCatRow}>
                    <Text style={styles.topicCatLabel}>
                      {cat?.emoji} {cat?.label}
                    </Text>
                    {topic.hot && <Text style={styles.hotBadge}>🔥</Text>}
                  </View>
                  <Text style={styles.topicTitle} numberOfLines={2}>
                    {topic.title}
                  </Text>
                  <View style={styles.topicMeta}>
                    <Ionicons name="person-outline" size={12} color={Colors.textLight} />
                    <Text style={styles.topicMetaText}>{topic.author}</Text>
                    <Ionicons name="chatbubble-outline" size={12} color={Colors.textLight} />
                    <Text style={styles.topicMetaText}>{topic.comments}</Text>
                    <Ionicons name="heart-outline" size={12} color={Colors.textLight} />
                    <Text style={styles.topicMetaText}>{topic.likes}</Text>
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nema tema u ovoj kategoriji</Text>
            <Text style={styles.emptySubtitle}>Budi prvi koji će pokrenuti raspravu!</Text>
          </View>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryLabelActive: {
    color: Colors.white,
  },
  featuredContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.text,
    marginBottom: 20,
  },
  featuredInner: {
    padding: 20,
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
  },
  featuredExcerpt: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 10,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  featuredDot: {
    color: 'rgba(255,255,255,0.5)',
  },
  featuredDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  newPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  newPostText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  listSection: {
    paddingHorizontal: 16,
  },
  topicCard: {
    marginBottom: 12,
    padding: 12,
  },
  topicRow: {
    flexDirection: 'row',
    gap: 12,
  },
  topicContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topicCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicCatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  hotBadge: {
    fontSize: 11,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
    marginVertical: 4,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topicMetaText: {
    fontSize: 11,
    color: Colors.textLight,
    marginRight: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
});
