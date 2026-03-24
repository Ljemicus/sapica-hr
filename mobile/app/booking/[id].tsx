import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { useReviews } from '../../hooks/useReviews';
import { Booking, BookingStatus } from '../../types/database';

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  confirmed: Colors.success,
  in_progress: Colors.secondary,
  completed: Colors.grayLight,
  cancelled: Colors.error,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Na čekanju',
  confirmed: 'Potvrđeno',
  in_progress: 'U tijeku',
  completed: 'Završeno',
  cancelled: 'Otkazano',
};

const SERVICE_LABELS: Record<string, string> = {
  walking: 'Šetanje',
  boarding: 'Čuvanje kod sitter-a',
  daycare: 'Dnevna skrb',
  house_sitting: 'Čuvanje kod vlasnika',
};

const TIMELINE_STEPS: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed'];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { getBooking, updateBookingStatus } = useBookings();
  const { createReview, fetchReviews, reviews } = useReviews();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const data = await getBooking(id);
      setBooking(data);
      if (data) {
        await fetchReviews(data.sitter_id);
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (booking && reviews.length > 0) {
      setHasReview(reviews.some((r) => r.booking_id === booking.id));
    }
  }, [reviews, booking]);

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    if (!booking) return;
    setUpdating(true);
    const { error } = await updateBookingStatus(booking.id, newStatus);
    if (error) {
      Alert.alert('Greška', error);
    } else {
      setBooking({ ...booking, status: newStatus });
    }
    setUpdating(false);
  };

  const handleSubmitReview = async () => {
    if (!booking || !user || reviewRating === 0) {
      Alert.alert('Greška', 'Odaberite ocjenu.');
      return;
    }
    setSubmittingReview(true);
    const { error } = await createReview({
      booking_id: booking.id,
      reviewer_id: user.id,
      reviewee_id: booking.sitter_id,
      rating: reviewRating,
      text: reviewText.trim() || undefined,
    });
    if (error) {
      Alert.alert('Greška', error);
    } else {
      setHasReview(true);
      Alert.alert('Hvala!', 'Vaša recenzija je poslana.');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Učitavanje rezervacije...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>😿</Text>
        <Text style={styles.errorText}>Rezervacija nije pronađena.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Povratak</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = user?.id === booking.owner_id;
  const isSitter = user?.id === booking.sitter_id;
  const currentStepIdx = TIMELINE_STEPS.indexOf(booking.status);
  const isCancelled = booking.status === 'cancelled';

  return (
    <>
      <Stack.Screen options={{ title: 'Rezervacija' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Status Timeline */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Status</Text>
            {isCancelled ? (
              <View style={styles.cancelledBanner}>
                <Text style={styles.cancelledText}>❌ Rezervacija je otkazana</Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {TIMELINE_STEPS.map((step, i) => {
                  const isActive = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <View key={step} style={styles.timelineStep}>
                      <View style={styles.timelineIndicator}>
                        <View
                          style={[
                            styles.timelineDot,
                            isActive && styles.timelineDotActive,
                            isCurrent && styles.timelineDotCurrent,
                          ]}
                        >
                          {isActive && <Text style={styles.timelineCheck}>✓</Text>}
                        </View>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              isActive && i < currentStepIdx && styles.timelineLineActive,
                            ]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.timelineLabel,
                          isActive && styles.timelineLabelActive,
                          isCurrent && styles.timelineLabelCurrent,
                        ]}
                      >
                        {STATUS_LABELS[step]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Booking Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📋 Detalji</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Usluga</Text>
              <Text style={styles.infoValue}>{SERVICE_LABELS[booking.service_type] ?? booking.service_type}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ljubimac</Text>
              <Text style={styles.infoValue}>{booking.pet?.name ?? '—'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Početak</Text>
              <Text style={styles.infoValue}>
                {new Date(booking.start_date).toLocaleDateString('hr-HR')} u{' '}
                {new Date(booking.start_date).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kraj</Text>
              <Text style={styles.infoValue}>
                {new Date(booking.end_date).toLocaleDateString('hr-HR')} u{' '}
                {new Date(booking.end_date).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cijena</Text>
              <Text style={styles.priceValue}>{booking.total_price?.toFixed(2)} €</Text>
            </View>

            {booking.notes && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Napomena</Text>
                <Text style={styles.infoValue}>{booking.notes}</Text>
              </View>
            )}
          </View>

          {/* People */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.personRow}
              onPress={() => router.push(`/sitter/${booking.sitter_id}` as any)}
            >
              <View style={styles.personAvatar}>
                <Text style={styles.personInitial}>
                  {booking.sitter?.full_name?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{booking.sitter?.full_name ?? 'Čuvar'}</Text>
                <Text style={styles.personRole}>Čuvar</Text>
              </View>
              <Text style={styles.personArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.personRow}>
              <View style={[styles.personAvatar, { backgroundColor: Colors.secondary }]}>
                <Text style={styles.personInitial}>
                  {booking.owner?.full_name?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{booking.owner?.full_name ?? 'Vlasnik'}</Text>
                <Text style={styles.personRole}>Vlasnik</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.card}>
            {/* Owner actions */}
            {isOwner && booking.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() =>
                  Alert.alert('Otkaži', 'Jeste li sigurni?', [
                    { text: 'Ne', style: 'cancel' },
                    { text: 'Da, otkaži', style: 'destructive', onPress: () => handleStatusUpdate('cancelled') },
                  ])
                }
                disabled={updating}
              >
                <Text style={styles.cancelBtnText}>{updating ? 'Ažuriranje...' : '❌ Otkaži rezervaciju'}</Text>
              </TouchableOpacity>
            )}

            {/* Sitter actions */}
            {isSitter && booking.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.declineBtn]}
                  onPress={() => handleStatusUpdate('cancelled')}
                  disabled={updating}
                >
                  <Text style={styles.declineBtnText}>Odbij</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.confirmBtn]}
                  onPress={() => handleStatusUpdate('confirmed')}
                  disabled={updating}
                >
                  <Text style={styles.confirmBtnText}>✓ Potvrdi</Text>
                </TouchableOpacity>
              </View>
            )}

            {isSitter && booking.status === 'confirmed' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.startBtn]}
                onPress={() => handleStatusUpdate('in_progress')}
                disabled={updating}
              >
                <Text style={styles.startBtnText}>{updating ? 'Ažuriranje...' : '▶ Započni'}</Text>
              </TouchableOpacity>
            )}

            {isSitter && booking.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={() => handleStatusUpdate('completed')}
                disabled={updating}
              >
                <Text style={styles.completeBtnText}>{updating ? 'Ažuriranje...' : '✓ Završi'}</Text>
              </TouchableOpacity>
            )}

            {/* Chat link */}
            <TouchableOpacity
              style={styles.chatLink}
              onPress={() => {
                const otherId = isOwner ? booking.sitter_id : booking.owner_id;
                router.push(`/chat/${otherId}?bookingId=${booking.id}` as any);
              }}
            >
              <Text style={styles.chatLinkText}>💬 Pošalji poruku</Text>
            </TouchableOpacity>
          </View>

          {/* Review form */}
          {isOwner && booking.status === 'completed' && !hasReview && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>⭐ Ostavi recenziju</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                    <Text style={styles.starBtn}>{star <= reviewRating ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Napišite recenziju (opcionalno)"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.grayLight}
              />
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn, submittingReview && { opacity: 0.6 }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                <Text style={styles.confirmBtnText}>
                  {submittingReview ? 'Šalje se...' : 'Pošalji recenziju'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isOwner && booking.status === 'completed' && hasReview && (
            <View style={styles.card}>
              <Text style={styles.reviewSentText}>✅ Recenzija je poslana. Hvala!</Text>
            </View>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  loadingText: { marginTop: Spacing.md, color: Colors.gray, fontSize: FontSize.md },
  errorEmoji: { fontSize: 48, marginBottom: Spacing.md },
  errorText: { color: Colors.gray, fontSize: FontSize.md, textAlign: 'center' },
  backBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  backBtnText: { color: Colors.white, fontWeight: '700' },

  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.md,
  },

  // Timeline
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  timelineStep: { alignItems: 'center', flex: 1 },
  timelineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.grayLighter,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotActive: { backgroundColor: Colors.success },
  timelineDotCurrent: {
    borderWidth: 3,
    borderColor: Colors.success + '44',
  },
  timelineCheck: { color: Colors.white, fontWeight: '700', fontSize: FontSize.xs },
  timelineLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: Colors.grayLighter,
    left: '50%',
    right: '-50%',
    top: 12,
    zIndex: 0,
  },
  timelineLineActive: { backgroundColor: Colors.success },
  timelineLabel: { fontSize: 10, color: Colors.grayLight, textAlign: 'center' },
  timelineLabelActive: { color: Colors.black },
  timelineLabelCurrent: { fontWeight: '700' },

  cancelledBanner: {
    backgroundColor: Colors.error + '15',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  cancelledText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.md },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.gray, flex: 1 },
  infoValue: { fontSize: FontSize.sm, color: Colors.black, fontWeight: '600', flex: 2, textAlign: 'right' },
  priceValue: { fontSize: FontSize.lg, color: Colors.primary, fontWeight: '800', flex: 2, textAlign: 'right' },

  // People
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  personInitial: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  personInfo: { flex: 1 },
  personName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.black },
  personRole: { fontSize: FontSize.xs, color: Colors.gray },
  personArrow: { fontSize: FontSize.lg, color: Colors.grayLight },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cancelBtn: { backgroundColor: Colors.error + '15' },
  cancelBtnText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.sm },
  declineBtn: { backgroundColor: Colors.grayLightest },
  declineBtnText: { color: Colors.gray, fontWeight: '700', fontSize: FontSize.sm },
  confirmBtn: { backgroundColor: Colors.success },
  confirmBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  startBtn: { backgroundColor: Colors.secondary },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  completeBtn: { backgroundColor: Colors.primary },
  completeBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },

  chatLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  chatLinkText: { color: Colors.secondary, fontWeight: '700', fontSize: FontSize.md },

  // Review
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  starBtn: { fontSize: 32 },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.black,
    backgroundColor: Colors.grayLightest,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  reviewSentText: {
    textAlign: 'center',
    color: Colors.success,
    fontWeight: '700',
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm,
  },
});
