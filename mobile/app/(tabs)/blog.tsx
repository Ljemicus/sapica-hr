import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';

const CATEGORIES = [
  { key: 'sve', label: 'Sve', emoji: '📚' },
  { key: 'zdravlje', label: 'Zdravlje', emoji: '💚' },
  { key: 'prehrana', label: 'Prehrana', emoji: '🥗' },
  { key: 'dresura', label: 'Dresura', emoji: '🎓' },
  { key: 'putovanje', label: 'Putovanje', emoji: '✈️' },
  { key: 'zabava', label: 'Zabava', emoji: '🎉' },
];

const ARTICLES = [
  {
    id: '1',
    slug: 'kako-pripremiti-psa-za-cuvanje',
    title: 'Kako pripremiti psa za čuvanje',
    excerpt: 'Praktični savjeti za vlasnike koji prvi put ostavljaju ljubimca kod sittera.',
    author: 'Dr. Maja Kovač',
    date: '10. ožujka 2026.',
    category: 'dresura',
    readTime: '5 min',
    image: 'https://placedog.net/400/250?id=20',
  },
  {
    id: '2',
    slug: 'najbolja-hrana-za-stene',
    title: 'Najbolja hrana za štene: Vodič za nove vlasnike',
    excerpt: 'Što štene treba jesti u prvih 12 mjeseci? Sve o prehrani mladih pasa.',
    author: 'Dr. Ivan Perić',
    date: '8. ožujka 2026.',
    category: 'prehrana',
    readTime: '7 min',
    image: 'https://placedog.net/400/250?id=21',
  },
  {
    id: '3',
    slug: 'znakovi-stresa-kod-macaka',
    title: 'Znakovi stresa kod mačaka koje vlasnici često previđaju',
    excerpt: 'Mačke su majstorice skrivanja nelagode. Naučite prepoznati znakove stresa.',
    author: 'Dr. Ana Babić',
    date: '5. ožujka 2026.',
    category: 'zdravlje',
    readTime: '6 min',
    image: 'https://placekitten.com/400/250',
  },
  {
    id: '4',
    slug: 'putovanje-s-psom-u-hrvatsku',
    title: 'Putovanje s ljubimcem: Gdje u Hrvatskoj su psi dobrodošli?',
    excerpt: 'Pet-friendly plaže, restorani i smještaj — kompletni vodič za Hrvatsku.',
    author: 'Luka Šimić',
    date: '1. ožujka 2026.',
    category: 'putovanje',
    readTime: '8 min',
    image: 'https://placedog.net/400/250?id=22',
  },
  {
    id: '5',
    slug: '10-zabavnih-trikova',
    title: '10 zabavnih trikova koje možete naučiti svog psa ovaj vikend',
    excerpt: 'Od "daj šapu" do "prevrni se" — korak po korak s nagradama.',
    author: 'Petra Novak',
    date: '25. veljače 2026.',
    category: 'zabava',
    readTime: '4 min',
    image: 'https://placedog.net/400/250?id=23',
  },
  {
    id: '6',
    slug: 'zasto-macke-predu',
    title: 'Zašto mačke predu? Znanost iza zvuka koji volimo',
    excerpt: 'Predenje nije samo znak zadovoljstva — evo što znanost kaže o ovom fenomenu.',
    author: 'Dr. Ana Babić',
    date: '20. veljače 2026.',
    category: 'zdravlje',
    readTime: '5 min',
    image: 'https://placekitten.com/401/250',
  },
];

export default function BlogScreen() {
  const [activeCategory, setActiveCategory] = useState('sve');

  const filtered = activeCategory === 'sve'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* Featured article */}
      {featured && (
        <View style={styles.featuredContainer}>
          <Image source={{ uri: featured.image }} style={styles.featuredImage} />
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>⭐ Istaknuto</Text>
            </View>
            <Text style={styles.featuredTitle}>{featured.title}</Text>
            <Text style={styles.featuredExcerpt}>{featured.excerpt}</Text>
            <View style={styles.featuredMeta}>
              <Text style={styles.featuredAuthor}>{featured.author}</Text>
              <Text style={styles.featuredDot}>·</Text>
              <Text style={styles.featuredDate}>{featured.readTime} čitanja</Text>
            </View>
          </View>
        </View>
      )}

      {/* Article list */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Svi članci</Text>
        {rest.map(article => (
          <Card key={article.id} style={styles.articleCard}>
            <View style={styles.articleRow}>
              <Image source={{ uri: article.image }} style={styles.articleThumb} />
              <View style={styles.articleContent}>
                <View style={styles.articleCatRow}>
                  <Text style={styles.articleCatLabel}>
                    {CATEGORIES.find(c => c.key === article.category)?.emoji}{' '}
                    {CATEGORIES.find(c => c.key === article.category)?.label}
                  </Text>
                </View>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <View style={styles.articleMeta}>
                  <Ionicons name="person-outline" size={12} color={Colors.textLight} />
                  <Text style={styles.articleMetaText}>{article.author}</Text>
                  <Ionicons name="time-outline" size={12} color={Colors.textLight} />
                  <Text style={styles.articleMetaText}>{article.readTime}</Text>
                </View>
              </View>
            </View>
          </Card>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nema članaka u ovoj kategoriji</Text>
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
  featuredImage: {
    width: '100%',
    height: 200,
    opacity: 0.6,
  },
  featuredOverlay: {
    padding: 16,
    marginTop: -60,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
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
  listSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  articleCard: {
    marginBottom: 12,
    padding: 12,
  },
  articleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  articleThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  articleContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  articleCatRow: {
    flexDirection: 'row',
  },
  articleCatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
    marginVertical: 4,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleMetaText: {
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
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 12,
  },
});
