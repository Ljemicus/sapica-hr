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
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { usePets } from '../../hooks/usePets';
import { useSitters } from '../../hooks/useSitters';
import { useBookings } from '../../hooks/useBookings';
import { Pet, SitterProfile, ServiceType } from '../../types/database';

const SERVICE_LABELS: Record<string, string> = {
  walking: '🐕 Šetanje',
  boarding: '🏠 Čuvanje kod sitter-a',
  daycare: '☀️ Dnevna skrb',
  house_sitting: '🏡 Čuvanje kod vlasnika',
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  reptile: '🦎',
  other: '🐾',
};

export default function NewBookingScreen() {
  const { sitterId } = useLocalSearchParams<{ sitterId: string }>();
  const { user } = useAuth();
  const { pets, loading: petsLoading } = usePets();
  const { getSitter } = useSitters();
  const { createBooking } = useBookings();

  const [sitter, setSitter] = useState<SitterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  // Step 1: Pet
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Step 2: Service
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Step 3: Dates
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Step 4: Notes
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sitterId) return;
    (async () => {
      setLoading(true);
      const data = await getSitter(sitterId);
      setSitter(data);
      setLoading(false);
    })();
  }, [sitterId]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Calculate price
  const calculatePrice = () => {
    if (!sitter || !selectedService) return 0;
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.max(diffMs / (1000 * 60 * 60), 1);
    const diffDays = Math.max(diffMs / (1000 * 60 * 60 * 24), 1);

    if (selectedService === 'walking' || selectedService === 'daycare') {
      return Math.round(((sitter.hourly_rate ?? 0) * diffHours) * 100) / 100;
    }
    return Math.round(((sitter.daily_rate ?? sitter.hourly_rate ?? 0) * diffDays) * 100) / 100;
  };

  const totalPrice = calculatePrice();

  const handleSubmit = async () => {
    if (!user || !sitterId || !selectedPetId || !selectedService) return;
    setSubmitting(true);
    const { data, error } = await createBooking({
      sitter_id: sitterId,
      pet_id: selectedPetId,
      service_type: selectedService,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      total_price: totalPrice,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Greška', error);
    } else if (data) {
      Alert.alert('Uspjeh!', 'Rezervacija je kreirana.', [
        { text: 'Pogledaj', onPress: () => router.replace(`/booking/${data.id}` as any) },
      ]);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!selectedPetId;
    if (step === 2) return !!selectedService;
    if (step === 3) return endDate > startDate;
    return true;
  };

  if (loading || petsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!sitter) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Čuvar nije pronađen.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Povratak</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Prijavite se za kreiranje rezervacije.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.backBtnText}>Prijava</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nova rezervacija' }} />
      <View style={styles.container}>
        {/* Progress bar */}
        <View style={styles.progressRow}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[styles.progressDot, s <= step && styles.progressDotActive]}
            />
          ))}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Step 1: Select Pet */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>1. Odaberi ljubimca</Text>
              {pets.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Nemate dodanih ljubimaca.</Text>
                  <TouchableOpacity
                    style={styles.addPetLink}
                    onPress={() => router.push('/(tabs)/profile')}
                  >
                    <Text style={styles.addPetLinkText}>Dodaj ljubimca u profilu →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.optionCard, selectedPetId === pet.id && styles.optionCardActive]}
                    onPress={() => setSelectedPetId(pet.id)}
                  >
                    <Text style={styles.optionEmoji}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>{pet.name}</Text>
                      <Text style={styles.optionSub}>
                        {pet.breed ?? pet.species} · {pet.size === 'small' ? 'Mali' : pet.size === 'medium' ? 'Srednji' : 'Veliki'}
                      </Text>
                    </View>
                    <View style={[styles.radio, selectedPetId === pet.id && styles.radioActive]}>
                      {selectedPetId === pet.id && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Step 2: Select Service */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>2. Odaberi uslugu</Text>
              {(sitter.services ?? []).map((srv) => (
                <TouchableOpacity
                  key={srv}
                  style={[styles.optionCard, selectedService === srv && styles.optionCardActive]}
                  onPress={() => setSelectedService(srv)}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>{SERVICE_LABELS[srv] ?? srv}</Text>
                    <Text style={styles.optionSub}>
                      {srv === 'walking' || srv === 'daycare'
                        ? `${sitter.hourly_rate ?? '—'} €/sat`
                        : `${sitter.daily_rate ?? sitter.hourly_rate ?? '—'} €/dan`}
                    </Text>
                  </View>
                  <View style={[styles.radio, selectedService === srv && styles.radioActive]}>
                    {selectedService === srv && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 3: Dates */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>3. Odaberi datume</Text>

              <Text style={styles.dateLabel}>Početak</Text>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateBtnText}>
                  📅 {startDate.toLocaleDateString('hr-HR')} u{' '}
                  {startDate.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="datetime"
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    setShowStartPicker(Platform.OS === 'ios');
                    if (date) {
                      setStartDate(date);
                      if (date >= endDate) {
                        setEndDate(new Date(date.getTime() + 3600000));
                      }
                    }
                  }}
                />
              )}

              <Text style={styles.dateLabel}>Kraj</Text>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateBtnText}>
                  📅 {endDate.toLocaleDateString('hr-HR')} u{' '}
                  {endDate.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="datetime"
                  minimumDate={new Date(startDate.getTime() + 1800000)}
                  onChange={(_, date) => {
                    setShowEndPicker(Platform.OS === 'ios');
                    if (date) setEndDate(date);
                  }}
                />
              )}

              <TextInput
                style={styles.notesInput}
                placeholder="Napomene za čuvara (opcionalno)"
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholderTextColor={Colors.grayLight}
              />
            </View>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>4. Pregled i potvrda</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Čuvar</Text>
                  <Text style={styles.summaryValue}>{sitter.user?.full_name ?? '—'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ljubimac</Text>
                  <Text style={styles.summaryValue}>
                    {SPECIES_EMOJI[selectedPet?.species ?? 'dog']} {selectedPet?.name ?? '—'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Usluga</Text>
                  <Text style={styles.summaryValue}>
                    {SERVICE_LABELS[selectedService ?? ''] ?? selectedService}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Početak</Text>
                  <Text style={styles.summaryValue}>
                    {startDate.toLocaleDateString('hr-HR')} {startDate.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Kraj</Text>
                  <Text style={styles.summaryValue}>
                    {endDate.toLocaleDateString('hr-HR')} {endDate.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {notes.trim() ? (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Napomene</Text>
                    <Text style={styles.summaryValue}>{notes}</Text>
                  </View>
                ) : null}
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                  <Text style={styles.summaryTotalLabel}>Ukupno</Text>
                  <Text style={styles.summaryTotalValue}>{totalPrice.toFixed(2)} €</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom navigation */}
        <View style={styles.bottomBar}>
          {step > 1 && (
            <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.prevBtnText}>← Nazad</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < 4 ? (
            <TouchableOpacity
              style={[styles.nextBtn, !canGoNext() && styles.nextBtnDisabled]}
              onPress={() => canGoNext() && setStep(step + 1)}
              disabled={!canGoNext()}
            >
              <Text style={styles.nextBtnText}>Dalje →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.nextBtnText}>Potvrdi rezervaciju</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  errorText: { color: Colors.gray, fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.md },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  backBtnText: { color: Colors.white, fontWeight: '700' },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grayLighter,
  },
  progressDotActive: { backgroundColor: Colors.primary },

  // Steps
  stepContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: Spacing.lg,
  },

  // Option cards
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.grayLighter,
    ...Shadow.sm,
  },
  optionCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  optionEmoji: { fontSize: 32, marginRight: Spacing.md },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.black },
  optionSub: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.grayLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { color: Colors.grayLight, fontSize: FontSize.md, marginBottom: Spacing.md },
  addPetLink: {},
  addPetLinkText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },

  // Dates
  dateLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  dateBtn: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.grayLighter,
  },
  dateBtnText: { fontSize: FontSize.md, color: Colors.black },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.black,
    backgroundColor: Colors.white,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: Spacing.lg,
  },

  // Summary
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
  },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.gray },
  summaryValue: { fontSize: FontSize.sm, color: Colors.black, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  summaryRowTotal: { borderBottomWidth: 0, marginTop: Spacing.sm },
  summaryTotalLabel: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.black },
  summaryTotalValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLighter,
    ...Shadow.md,
  },
  prevBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.grayLighter,
  },
  prevBtnText: { color: Colors.gray, fontWeight: '700', fontSize: FontSize.md },
  nextBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    minWidth: 140,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
});
