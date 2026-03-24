import React, { useState } from 'react';
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
import { router, Stack } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const SERVICES = [
  { key: 'walking', label: '🐕 Šetanje', desc: 'Šetnja psa u kvartu' },
  { key: 'boarding', label: '🏠 Čuvanje', desc: 'Ljubimac ostaje kod vas' },
  { key: 'daycare', label: '☀️ Dnevna skrb', desc: 'Dnevno čuvanje' },
  { key: 'house_sitting', label: '🏡 House Sitting', desc: 'Čuvanje u domu vlasnika' },
];

const DAYS = [
  { key: 'mon', label: 'Pon' },
  { key: 'tue', label: 'Uto' },
  { key: 'wed', label: 'Sri' },
  { key: 'thu', label: 'Čet' },
  { key: 'fri', label: 'Pet' },
  { key: 'sat', label: 'Sub' },
  { key: 'sun', label: 'Ned' },
];

export default function BecomeSitterScreen() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('0');

  // Step 2
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');

  // Step 3
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [radius, setRadius] = useState('10');

  const toggleService = (key: string) => {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const toggleDay = (key: string) => {
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const canGoNext = () => {
    if (step === 1) return bio.trim().length >= 10;
    if (step === 2) return selectedServices.length > 0 && (hourlyRate || dailyRate);
    if (step === 3) return selectedDays.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    // Create sitter profile
    const { error: profileError } = await supabase.from('sitter_profiles').insert({
      user_id: user.id,
      description: bio.trim(),
      experience_years: parseInt(experience, 10) || 0,
      services: selectedServices,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      daily_rate: dailyRate ? parseFloat(dailyRate) : null,
      availability: { days: selectedDays },
      radius_km: parseInt(radius, 10) || 10,
    });

    if (profileError) {
      Alert.alert('Greška', profileError.message);
      setSubmitting(false);
      return;
    }

    // Update user role
    const newRole = user.role === 'owner' ? 'both' : user.role;
    await supabase.from('users').update({ role: newRole, bio: bio.trim() }).eq('id', user.id);
    await refreshUser();

    setSubmitting(false);
    Alert.alert('Uspjeh! 🎉', 'Sada ste registrirani kao čuvar ljubimaca.', [
      { text: 'Super!', onPress: () => router.replace('/(tabs)/profile') },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Prijavite se za nastavak.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginBtnText}>Prijava</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Postani čuvar' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Progress */}
          <View style={styles.progressRow}>
            {[1, 2, 3, 4].map((s) => (
              <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />
            ))}
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {/* Step 1: Bio & Experience */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>1. O tebi</Text>
                <Text style={styles.stepDesc}>Ispričaj vlasnicima ljubimaca nešto o sebi.</Text>

                <Text style={styles.inputLabel}>Bio *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Opišite svoje iskustvo s ljubimcima, zašto volite ovaj posao..."
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={5}
                  placeholderTextColor={Colors.grayLight}
                />
                <Text style={styles.charCount}>{bio.length} / min 10 znakova</Text>

                <Text style={styles.inputLabel}>Godine iskustva</Text>
                <View style={styles.experienceRow}>
                  {['0', '1', '2', '3', '5', '10'].map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.expChip, experience === y && styles.expChipActive]}
                      onPress={() => setExperience(y)}
                    >
                      <Text style={[styles.expChipText, experience === y && styles.expChipTextActive]}>
                        {y === '10' ? '10+' : y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2: Services & Pricing */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>2. Usluge i cijene</Text>
                <Text style={styles.stepDesc}>Odaberite usluge koje nudite.</Text>

                {SERVICES.map((srv) => (
                  <TouchableOpacity
                    key={srv.key}
                    style={[styles.serviceCard, selectedServices.includes(srv.key) && styles.serviceCardActive]}
                    onPress={() => toggleService(srv.key)}
                  >
                    <View style={[styles.checkbox, selectedServices.includes(srv.key) && styles.checkboxActive]}>
                      {selectedServices.includes(srv.key) && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceLabel}>{srv.label}</Text>
                      <Text style={styles.serviceDesc}>{srv.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={styles.pricingRow}>
                  <View style={styles.priceInputWrap}>
                    <Text style={styles.inputLabel}>Cijena/sat (€)</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="npr. 10"
                      value={hourlyRate}
                      onChangeText={setHourlyRate}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.grayLight}
                    />
                  </View>
                  <View style={styles.priceInputWrap}>
                    <Text style={styles.inputLabel}>Cijena/dan (€)</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="npr. 40"
                      value={dailyRate}
                      onChangeText={setDailyRate}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.grayLight}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Step 3: Availability */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>3. Dostupnost</Text>
                <Text style={styles.stepDesc}>Kada ste dostupni za čuvanje?</Text>

                <Text style={styles.inputLabel}>Dani u tjednu</Text>
                <View style={styles.daysRow}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day.key}
                      style={[styles.dayChip, selectedDays.includes(day.key) && styles.dayChipActive]}
                      onPress={() => toggleDay(day.key)}
                    >
                      <Text style={[styles.dayChipText, selectedDays.includes(day.key) && styles.dayChipTextActive]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Radijus (km)</Text>
                <View style={styles.radiusRow}>
                  {['5', '10', '15', '20', '30'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.expChip, radius === r && styles.expChipActive]}
                      onPress={() => setRadius(r)}
                    >
                      <Text style={[styles.expChipText, radius === r && styles.expChipTextActive]}>
                        {r} km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>4. Pregled</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Bio</Text>
                    <Text style={styles.summaryValue} numberOfLines={3}>{bio}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Iskustvo</Text>
                    <Text style={styles.summaryValue}>{experience} god.</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Usluge</Text>
                    <Text style={styles.summaryValue}>
                      {selectedServices.map((s) => SERVICES.find((sv) => sv.key === s)?.label ?? s).join(', ')}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Cijene</Text>
                    <Text style={styles.summaryValue}>
                      {hourlyRate ? `${hourlyRate} €/h` : ''}
                      {hourlyRate && dailyRate ? ' · ' : ''}
                      {dailyRate ? `${dailyRate} €/dan` : ''}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Dostupnost</Text>
                    <Text style={styles.summaryValue}>
                      {selectedDays.map((d) => DAYS.find((day) => day.key === d)?.label ?? d).join(', ')}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Radijus</Text>
                    <Text style={styles.summaryValue}>{radius} km</Text>
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
                  <Text style={styles.nextBtnText}>Postani čuvar 🐾</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
  errorText: { color: Colors.gray, fontSize: FontSize.md, marginBottom: Spacing.md },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  loginBtnText: { color: Colors.white, fontWeight: '700' },

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

  stepContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  stepDesc: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginBottom: Spacing.lg,
  },

  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.black,
    backgroundColor: Colors.white,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: FontSize.xs, color: Colors.grayLight, marginTop: Spacing.xs, textAlign: 'right' },

  experienceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  expChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    backgroundColor: Colors.white,
  },
  expChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  expChipText: { fontSize: FontSize.sm, color: Colors.gray, fontWeight: '600' },
  expChipTextActive: { color: Colors.white },

  // Services
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.grayLighter,
  },
  serviceCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.grayLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.white, fontWeight: '700', fontSize: FontSize.xs },
  serviceInfo: { flex: 1 },
  serviceLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.black },
  serviceDesc: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },

  pricingRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  priceInputWrap: { flex: 1 },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.black,
    backgroundColor: Colors.white,
  },

  // Days
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.grayLighter,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  dayChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayChipText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray },
  dayChipTextActive: { color: Colors.white },

  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
  summaryLabel: { fontSize: FontSize.sm, color: Colors.gray, flex: 1 },
  summaryValue: { fontSize: FontSize.sm, color: Colors.black, fontWeight: '600', flex: 2, textAlign: 'right' },

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
