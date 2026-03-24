import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useSitters } from '../../hooks/useSitters';
import { useReviews } from '../../hooks/useReviews';
import { SitterProfile } from '../../types/database';

const { width } = Dimensions.get('window');

const SERVICE_LABELS: Record<string, string> = {
  walking: 'Šetanje',
  boarding: 'Čuvanje kod sitter-a',
  daycare: 'Dnevna skrb',
  house_sitting: 'Čuvanje kod vlasnika',
};

const SERVICE_ICONS: Record<string, string> = {
  walking: 'walk',
  boarding: 'home',
  daycare: 'sunny',
  house_sitting: 'business',
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={Colors.star}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}

export default function SitterProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSitter } = useSitters();
  const { reviews, fetchReviews } = useReviews();

  const [sitter, setSitter] = useState<SitterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getSitter(id);
        setSitter(data);
        await fetchReviews(id);
      } catch (e: any) {
        setError(e?.message ?? 'Greška pri učitavanju profila.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Učitavanje profila...</Text>
      </View>
    );
  }

  if (error || !sitter) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error ?? 'Profil nije pronađen.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Povratak</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos: string[] = (sitter as any).photos ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0;

  const services: string[] = (sitter as any).services ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: (sitter as any).user?.full_name ?? 'Profil sitera',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.black,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Gallery */}
          <View style={styles.galleryContainer}>
            {photos.length > 0 ? (
              <Image
                source={{ uri: photos[photoIndex] }}
                style={styles.mainPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.mainPhoto, styles.photoPlaceholder]}>
                <Ionicons name="camera-outline" size={48} color={Colors.grayLight} />
                <Text style={styles.photoPlaceholderText}>Nema fotografija</Text>
              </View>
            )}
            {photos.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbRow}
                contentContainerStyle={{ gap: Spacing.sm }}
              >
                {photos.map((p, i) => (
                  <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                    <Image
                      source={{ uri: p }}
                      style={[
                        styles.thumb,
                        i === photoIndex && styles.thumbActive,
                      ]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* User Info */}
          <View style={styles.section}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {(sitter as any).user?.full_name ?? 'Siter'}
              </Text>
              {(sitter as any).is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
                  <Text style={styles.verifiedText}>Verificiran</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={Colors.gray} />
              <Text style={styles.metaText}>
                {(sitter as any).city ?? 'Hrvatska'}
              </Text>
              <Ionicons
                name="briefcase-outline"
                size={16}
                color={Colors.gray}
                style={{ marginLeft: Spacing.md }}
              />
              <Text style={styles.metaText}>
                {(sitter as any).experience_years ?? 0} god. iskustva
              </Text>
            </View>
            <View style={styles.ratingRowSmall}>
              <StarRating rating={avgRating} />
              <Text style={styles.ratingCountText}>
                {' '}
                ({reviews.length}{' '}
                {reviews.length === 1 ? 'recenzija' : 'recenzija'})
              </Text>
            </View>
          </View>

          {/* Bio */}
          {(sitter as any).bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>O meni</Text>
              <Text style={styles.bioText}>{(sitter as any).bio}</Text>
            </View>
          ) : null}

          {/* Services & Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usluge i cijene</Text>
            {services.length === 0 ? (
              <Text style={styles.emptyText}>Nema navedenih usluga.</Text>
            ) : (
              services.map((srv) => (
                <View key={srv} style={styles.serviceRow}>
                  <View style={styles.serviceLeft}>
                    <View style={styles.serviceIconWrap}>
                      <Ionicons
                        name={(SERVICE_ICONS[srv] ?? 'paw') as any}
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={styles.serviceLabel}>
                      {SERVICE_LABELS[srv] ?? srv}
                    </Text>
                  </View>
                  <View style={styles.servicePrices}>
                    {(sitter as any).hourly_rate != null && (
                      <Text style={styles.priceTag}>
                        {(sitter as any).hourly_rate} €/h
                      </Text>
                    )}
                    {(sitter as any).daily_rate != null && (
                      <Text style={[styles.priceTag, { marginLeft: Spacing.sm }]}>
                        {(sitter as any).daily_rate} €/dan
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Reviews */}
          <View style={[styles.section, { marginBottom: 120 }]}>
            <Text style={styles.sectionTitle}>Recenzije</Text>
            {reviews.length === 0 ? (
              <View style={styles.noReviews}>
                <Ionicons name="chatbubble-outline" size={32} color={Colors.grayLighter} />
                <Text style={styles.emptyText}>Još nema recenzija.</Text>
              </View>
            ) : (
              <>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingNumber}>{avgRating.toFixed(1)}</Text>
                  <View>
                    <StarRating rating={avgRating} size={22} />
                    <Text style={styles.ratingCountBig}>
                      {reviews.length} recenzija
                    </Text>
                  </View>
                </View>
                {reviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerInitial}>
                          {((review as any).reviewer?.full_name ?? 'K')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.reviewerInfo}>
                        <Text style={styles.reviewerName}>
                          {(review as any).reviewer?.full_name ?? 'Korisnik'}
                        </Text>
                        <StarRating rating={review.rating ?? 0} />
                      </View>
                      <Text style={styles.reviewDate}>
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString('hr-HR')
                          : ''}
                      </Text>
                    </View>
                    {review.text ? (
                      <Text style={styles.reviewText}>{review.text}</Text>
                    ) : null}
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* Floating Actions */}
        <View style={styles.floatingBar}>
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() => router.push(`/chat/${id}` as any)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            <Text style={styles.messageBtnText}>Poruka</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push(`/booking/new?sitterId=${id}` as any)}
          >
            <Text style={styles.bookBtnText}>Rezerviraj</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.gray,
    fontSize: FontSize.md,
  },
  errorText: {
    marginTop: Spacing.md,
    color: Colors.error,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.md,
  },

  // Gallery
  galleryContainer: { backgroundColor: Colors.grayLightest },
  mainPhoto: {
    width,
    height: 280,
  },
  photoPlaceholder: {
    backgroundColor: Colors.grayLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    marginTop: Spacing.sm,
    color: Colors.grayLight,
    fontSize: FontSize.sm,
  },
  thumbRow: {
    backgroundColor: Colors.black,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    opacity: 0.7,
  },
  thumbActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  // Sections
  section: {
    backgroundColor: Colors.white,
    marginTop: Spacing.sm,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.md,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.black,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  verifiedText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metaText: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    marginLeft: 4,
  },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  ratingRowSmall: { flexDirection: 'row', alignItems: 'center' },
  ratingCountText: { color: Colors.gray, fontSize: FontSize.sm },

  bioText: {
    fontSize: FontSize.md,
    color: Colors.black,
    lineHeight: 24,
  },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
  },
  serviceLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: { fontSize: FontSize.md, color: Colors.black, fontWeight: '500' },
  servicePrices: { flexDirection: 'row', alignItems: 'center' },
  priceTag: {
    backgroundColor: Colors.primary + '15',
    color: Colors.primary,
    fontWeight: '700',
    fontSize: FontSize.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },

  noReviews: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { color: Colors.grayLight, fontSize: FontSize.sm, textAlign: 'center' },

  ratingBig: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
    marginBottom: Spacing.md,
  },
  ratingNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.black,
    lineHeight: 64,
  },
  ratingCountBig: { color: Colors.gray, fontSize: FontSize.sm, marginTop: 4 },

  reviewCard: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontWeight: '700', color: Colors.black, fontSize: FontSize.sm },
  reviewDate: { color: Colors.grayLight, fontSize: FontSize.xs },
  reviewText: { color: Colors.black, fontSize: FontSize.sm, lineHeight: 20 },

  // Floating
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLighter,
    ...Shadow.md,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  messageBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
  bookBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  bookBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});
