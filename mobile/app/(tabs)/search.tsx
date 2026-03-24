import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useSitters } from '../../hooks/useSitters';
import { SitterProfile } from '../../types/database';

const SERVICE_OPTIONS: { key: string; label: string }[] = [
  { key: '', label: 'Sve' },
  { key: 'walking', label: 'Setnja' },
  { key: 'boarding', label: 'Smjestaj' },
  { key: 'daycare', label: 'Dnevna njega' },
  { key: 'house_sitting', label: 'Cuvanje' },
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

const SERVICE_LABELS: Record<string, string> = {
  walking: 'Setnja',
  boarding: 'Smjestaj',
  daycare: 'Dnevna njega',
  house_sitting: 'Cuvanje',
};

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const { sitters, loading, searchSitters } = useSitters();

  const [selectedService, setSelectedService] = useState<string>(params.service ?? '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const doSearch = useCallback(
    async (service?: string, min?: string, max?: string) => {
      const svc = service ?? selectedService;
      const mn = min ?? minPrice;
      const mx = max ?? maxPrice;
      await searchSitters({
        service: svc || undefined,
        minPrice: mn ? Number(mn) : undefined,
        maxPrice: mx ? Number(mx) : undefined,
      });
    },
    [selectedService, minPrice, maxPrice, searchSitters],
  );

  useEffect(() => {
    doSearch();
  }, []);

  // Re-search when service param changes from outside
  useEffect(() => {
    if (params.service && params.service !== selectedService) {
      setSelectedService(params.service);
      doSearch(params.service);
    }
  }, [params.service]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await doSearch();
    setRefreshing(false);
  }, [doSearch]);

  const handleServiceSelect = (key: string) => {
    setSelectedService(key);
    doSearch(key);
  };

  const handlePriceSearch = () => {
    doSearch();
  };

  const renderSitterCard = ({ item }: { item: SitterProfile }) => {
    const name = item.user?.full_name ?? 'Nepoznato';
    const fullStars = Math.floor(item.rating_avg);
    const hasHalf = item.rating_avg - fullStars >= 0.5;

    return (
      <TouchableOpacity
        style={styles.sitterCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/sitter/${item.user_id}`)}
      >
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(name) }]}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        <View style={styles.sitterInfo}>
          <Text style={styles.sitterName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <Ionicons
                key={i}
                name={
                  i < fullStars
                    ? 'star'
                    : i === fullStars && hasHalf
                      ? 'star-half'
                      : 'star-outline'
                }
                size={14}
                color={Colors.star}
              />
            ))}
            <Text style={styles.ratingCount}>
              {item.rating_avg.toFixed(1)} ({item.review_count})
            </Text>
          </View>
          <View style={styles.servicesRow}>
            {item.services.map((svc) => (
              <View key={svc} style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>
                  {SERVICE_LABELS[svc] ?? svc}
                </Text>
              </View>
            ))}
          </View>
          {item.user?.city && (
            <View style={styles.cityRow}>
              <Ionicons name="location-outline" size={13} color={Colors.grayLight} />
              <Text style={styles.cityText}>{item.user.city}</Text>
            </View>
          )}
        </View>
        <View style={styles.priceColumn}>
          {item.hourly_rate != null && (
            <Text style={styles.priceText}>{item.hourly_rate.toFixed(0)} EUR</Text>
          )}
          <Text style={styles.priceUnit}>/sat</Text>
          {item.verified && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={Colors.secondary}
              style={styles.verifiedIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        {/* Service Type Pills */}
        <FlatList
          data={SERVICE_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.pillsRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.pill,
                selectedService === item.key && styles.pillActive,
              ]}
              activeOpacity={0.7}
              onPress={() => handleServiceSelect(item.key)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedService === item.key && styles.pillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Price Range */}
        <View style={styles.priceFilterRow}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min EUR"
            placeholderTextColor={Colors.grayLight}
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
            onEndEditing={handlePriceSearch}
          />
          <Text style={styles.priceDash}>-</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max EUR"
            placeholderTextColor={Colors.grayLight}
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
            onEndEditing={handlePriceSearch}
          />
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7} onPress={handlePriceSearch}>
            <Ionicons name="search" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Ucitavanje...</Text>
        </View>
      ) : (
        <FlatList
          data={sitters}
          renderItem={renderSitterCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="search-outline" size={56} color={Colors.grayLighter} />
              <Text style={styles.emptyTitle}>Nema rezultata</Text>
              <Text style={styles.emptySubtitle}>Pokusajte promijeniti filtere</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLighter,
  },
  pillsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.grayLightest,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.gray,
  },
  pillTextActive: {
    color: Colors.white,
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.black,
    backgroundColor: Colors.grayLightest,
  },
  priceDash: {
    fontSize: FontSize.md,
    color: Colors.grayLight,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    flexGrow: 1,
  },
  sitterCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  sitterInfo: {
    flex: 1,
  },
  sitterName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: Spacing.xs,
  },
  ratingCount: {
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginLeft: Spacing.xs,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  serviceBadge: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  serviceBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
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
  priceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  priceText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: FontSize.xs,
    color: Colors.grayLight,
  },
  verifiedIcon: {
    marginTop: Spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.grayLight,
    marginTop: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.black,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.grayLight,
  },
});
