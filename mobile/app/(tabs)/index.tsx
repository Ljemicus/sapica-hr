import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { CategoryCard } from '../../components/shared/CategoryCard';
import { SitterCard } from '../../components/shared/SitterCard';
import { Colors } from '../../constants/colors';
import { sitters, categories } from '../../constants/mock-data';

export default function HomeScreen() {
  const popularSitters = sitters.slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroGradient}>
          <Text style={styles.heroTitle}>Pronađi savršenog{'\n'}čuvara za ljubimca</Text>
          <Text style={styles.heroSubtitle}>
            Pouzdani pet sitteri u tvojoj blizini. Tvoj ljubimac zaslužuje najbolje! 🐾
          </Text>
          <Button
            title="Pronađi sittera"
            onPress={() => router.push('/(tabs)/search')}
            size="lg"
            icon={<Ionicons name="search" size={20} color={Colors.white} />}
            style={styles.heroCta}
          />
        </View>
      </View>

      {/* Quick Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brze kategorije</Text>
        <View style={styles.categoriesRow}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              icon={cat.icon as any}
              color={cat.color}
              bgColor={cat.bgColor}
              onPress={() => {
                if (cat.name === 'Izgubljeni') {
                  router.push('/lost-pets');
                } else if (cat.name === 'Grooming') {
                  router.push('/grooming');
                } else if (cat.name === 'Dresura') {
                  router.push('/training');
                } else {
                  router.push('/(tabs)/search');
                }
              }}
            />
          ))}
        </View>
      </View>

      {/* Quick Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Za tvog ljubimca</Text>
        <View style={styles.featureRow}>
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: '#ecfdf5' }]}
            onPress={() => router.push('/walk-tracking')}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={28} color={Colors.success} />
            <Text style={styles.featureLabel}>GPS{'\n'}šetnja</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: '#fdf2f8' }]}
            onPress={() => router.push('/photo-updates')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={28} color={Colors.categoryPink} />
            <Text style={styles.featureLabel}>Foto{'\n'}ažuriranja</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: '#eff6ff' }]}
            onPress={() => router.push('/pet-passport/1')}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text" size={28} color={Colors.info} />
            <Text style={styles.featureLabel}>Zdravstveni{'\n'}karton</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Sittera</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10k+</Text>
          <Text style={styles.statLabel}>Rezervacija</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Ocjena</Text>
        </View>
      </View>

      {/* Popular Sitters */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popularni sitteri</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>Vidi sve</Text>
          </TouchableOpacity>
        </View>
        {popularSitters.map((sitter) => (
          <SitterCard key={sitter.id} sitter={sitter} />
        ))}
      </View>

      {/* CTA - Become Sitter */}
      <View style={styles.section}>
        <Card variant="elevated" style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaEmoji}>🐕</Text>
            <Text style={styles.ctaTitle}>Voliš životinje?</Text>
            <Text style={styles.ctaText}>
              Postani sitter i zarađuj čuvajući ljubimce u svom kvartu!
            </Text>
            <Button
              title="Postani sitter"
              onPress={() => router.push('/become-sitter')}
              variant="outline"
              style={styles.ctaButton}
            />
          </View>
        </Card>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    backgroundColor: Colors.backgroundWarm,
    paddingBottom: 24,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 36,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  heroCta: {
    alignSelf: 'flex-start',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: 16,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  ctaCard: {
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  ctaContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ctaEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  ctaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    minWidth: 160,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 10,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});
