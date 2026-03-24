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
  { key: 'sve', label: 'Sve', emoji: '💬', color: Colors.primary },
  { key: 'pitanja', label: 'Pitanja', emoji: '❓', color: '#3b82f6' },
  { key: 'savjeti', label: 'Savjeti', emoji: '💡', color: '#10b981' },
  { key: 'price', label: 'Priče', emoji: '❤️', color: '#ec4899' },
  { key: 'izgubljeni', label: 'Izgubljeni', emoji: '🚨', color: '#ef4444' },
  { key: 'slobodna', label: 'Slobodna', emoji: '🗣️', color: '#8b5cf6' },
];

const TOPICS = [
  {
    id: 'ft-1',
    category: 'pitanja',
    title: 'Koliko često trebam voditi psa veterinaru?',
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
    title: '🚨 Izgubljen zlatni retriver u Maksimiru — pomoć!',
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
    category: 'slobodna',
    title: 'Koji je vaš najdraži park za šetnju psa u Zagrebu?',
    author: 'Nina Š.',
    initial: 'N',
    timeAgo: 'prije 5 dana',
    comments: 19,
    likes: 31,
    pinned: false,
    hot: false,
  },
  {
    id: 'ft-6',
    category: 'pitanja',
    title: 'Preporuka za hranu za mačke s osjetljivim želucem?',
    author: 'Petra K.',
    initial: 'P',
    timeAgo: 'prije 6 dana',
    comments: 7,
    likes: 18,
    pinned: false,
    hot: false,
  },
  {
    id: 'ft-7',
    category: 'savjeti',
    title: 'Kako pripremiti ljubimca za putovanje avionom',
    author: 'Filip M.',
    initial: 'F',
    timeAgo: 'prije tjedan',
    comments: 11,
    likes: 52,
    pinned: false,
    hot: true,
  },
  {
    id: 'ft-8',
    category: 'price',
    title: 'Moj mačak i pas su postali najbolji prijatelji',
    author: 'Ivana B.',
    initial: 'I',
    timeAgo: 'prije tjedan',
    comments: 9,
    likes: 41,
    pinned: false,
    hot: false,
  },
];

export default function ForumScreen() {
  const [activeCategory, setActiveCategory] = useState('sve');

  const filtered = activeCategory === 'sve'
    ? TOPICS
    : TOPICS.filter(t => t.category === activeCategory);

  // Pinned first, then by likes
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.likes - a.likes;
  });

  return (
    <View style={styles.container}>
      {/* New post button */}
      <View style={styles.newPostRow}>
        <TouchableOpacity
          style={styles.newPostBtn}
          onPress={() => Alert.alert('Nova tema', 'Ova funkcionalnost dolazi uskoro!')}
        >
          <Ionicons name="create-outline" size={18} color={Colors.white} />
          <Text style={styles.newPostText}>Nova tema</Text>
        </TouchableOpacity>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{TOPICS.length} tema</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.statText}>{TOPICS.reduce((s, t) => s + t.comments, 0)} komentara</Text>
        </View>
      </View>

      {/* Category pills */}
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
              activeCategory === cat.key && { backgroundColor: cat.color },
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

      {/* Topics list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sorted.map(topic => {
          const cat = CATEGORIES.find(c => c.key === topic.category);
          return (
            <Card key={topic.id} style={styles.topicCard}>
              <View style={styles.topicHeader}>
                <Avatar name={topic.author} size={36} />
                <View style={styles.topicAuthorInfo}>
                  <Text style={styles.topicAuthor}>{topic.author}</Text>
                  <Text style={styles.topicTime}>{topic.timeAgo}</Text>
                </View>
                <View style={styles.topicBadges}>
                  {topic.pinned && (
                    <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
                      <Text style={styles.badgeText}>📌</Text>
                    </View>
                  )}
                  {topic.hot && (
                    <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                      <Text style={styles.badgeText}>🔥</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.topicTitle}>{topic.title}</Text>

              <View style={styles.topicFooter}>
                <View style={[styles.topicCatBadge, { backgroundColor: (cat?.color || Colors.primary) + '18' }]}>
                  <Text style={[styles.topicCatText, { color: cat?.color || Colors.primary }]}>
                    {cat?.emoji} {cat?.label}
                  </Text>
                </View>
                <View style={styles.topicStats}>
                  <View style={styles.topicStat}>
                    <Ionicons name="chatbubble-outline" size={14} color={Colors.textLight} />
                    <Text style={styles.topicStatText}>{topic.comments}</Text>
                  </View>
                  <View style={styles.topicStat}>
                    <Ionicons name="heart-outline" size={14} color={Colors.textLight} />
                    <Text style={styles.topicStatText}>{topic.likes}</Text>
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

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  newPostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundWarm,
  },
  newPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newPostText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statDot: {
    color: Colors.textLight,
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryLabelActive: {
    color: Colors.white,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topicCard: {
    marginBottom: 10,
    padding: 14,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicAuthorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  topicAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  topicTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  topicBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  topicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicCatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicCatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  topicStats: {
    flexDirection: 'row',
    gap: 14,
  },
  topicStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topicStatText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
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
