import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useSitters } from '../../hooks/useSitters';
import { SitterProfile } from '../../types/database';

const SERVICE_CATEGORIES = [
  { key: 'walking', label: 'Šetnja', icon: 'walk' as const },
  { key: 'boarding', label: 'Smještaj', icon: 'home' as const },
  { key: 'daycare', label: 'Dnevna njega', icon: 'sunny' as const },
  { key: 'house_sitting', label: 'Čuvanje', icon: 'shield-checkmark' as const },
];

function getInitials(name: string | undefined | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string | undefined | null): string {
  if (!name) return Colors.grayLight;
  const colors = ['#FF6B35', '#004E89', '#4CAF50', '#9C27B0', '#00BCD4', '#FF5722'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function RatingStars({ rating, count }: { rating: number; count: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <View style={styles.ratingRow}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < fullStars ? 'star' : i === fullStars && hasHalf ? 'star-half' : 'star-outline'}
          size={14}
          color={Colors.star}
        />
      ))}
      <Text style={styles.ratingText}>
        {rating.toFixed(1)} ({count})
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { getFeaturedSitters } = useSitters();
  const [featuredSitters, setFeaturedSitters] = useState<SitterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeatured = useCallback(async () => {
    try {
      const data = await getFeaturedSitters();
      setFeaturedSitters(data);
    } catch {
      // Silently handle — empty state will show
    } finally {
      setLoading(false);
    }
  }, [getFeaturedSitters]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeatured();
    setRefreshing(false);
  }, [loadFeatured]);

  const renderSitterCard = ({ item }: { item: SitterProfile }) => {
    const name = item.user?.full_name ?? 'Nepoznato';
    return (
      <TouchableOpacity
        style={styles.sitterCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/sitter/${item.user_id}`)}
      >
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(name) }]}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        <Text style={styles.sitterName} numberOfLines={1}>
          {name}
        </Text>
        <RatingStars rating={item.rating_avg} count={item.review_count} />
        {item.hourly_rate != null && (
          <Text style={styles.sitterPrice}>{item.hourly_rate.toFixed(0)} EUR/h</Text>
        )}
        {item.user?.city && (
          <View style={styles.cityRow}>
            <Ionicons name="location-outline" size={12} color={Colors.grayLight} />
            <Text style={styles.cityText}>{item.user.city}</Text>
          </View>
        )}
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
            <Text style={styles.verifiedText}>Verificiran</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Sapica 🐾</Text>
        <Text style={styles.heroSubtitle}>Pronadi savrsenog cuvara za svog ljubimca</Text>
        {session && user ? (
          <Text style={styles.heroGreeting}>Bok, {user.full_name?.split(' ')[0] ?? 'korisnice'}!</Text>
        ) : (
          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.8}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.heroButtonText}>Prijavi se</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/search')}
      >
        <Ionicons name="search" size={20} color={Colors.grayLight} />
        <Text style={styles.searchPlaceholder}>Pretrazi cuvare...</Text>
      </TouchableOpacity>

      {/* Service Categories */}
      <Text style={styles.sectionTitle}>Usluge</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        {SERVICE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={styles.categoryCard}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/(tabs)/search', params: { service: cat.key } })}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={cat.icon} size={28} color={Colors.primary} />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Sitters */}
      <Text style={styles.sectionTitle}>Istaknuti cuvari</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : featuredSitters.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={Colors.grayLighter} />
          <Text style={styles.emptyText}>Nema istaknutih cuvara</Text>
        </View>
      ) : (
        <FlatList
          data={featuredSitters}
          renderItem={renderSitterCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sittersList}
          scrollEnabled
        />
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  hero: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxl + Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.md,
  },
  heroGreeting: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  heroButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  heroButtonText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: -Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  searchPlaceholder: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.grayLight,
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.black,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  categoriesRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  categoryCard: {
    alignItems: 'center',
    width: 88,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.gray,
    textAlign: 'center',
  },
  sittersList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  sitterCard: {
    width: 170,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  sitterName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: Spacing.xs,
  },
  ratingText: {
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginLeft: Spacing.xs,
  },
  sitterPrice: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cityText: {
    fontSize: FontSize.xs,
    color: Colors.grayLight,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: Spacing.xs,
  },
  verifiedText: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.grayLight,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
