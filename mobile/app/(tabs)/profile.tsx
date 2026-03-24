import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { usePets } from '../../hooks/usePets';
import { useBookings } from '../../hooks/useBookings';
import { useSitters } from '../../hooks/useSitters';
import { Booking, Pet, PetSpecies, PetSize, SitterProfile } from '../../types/database';

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  reptile: '🦎',
  other: '🐾',
};

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
  boarding: 'Čuvanje',
  daycare: 'Dnevna skrb',
  house_sitting: 'House sitting',
};

export default function ProfileScreen() {
  const { user, loading: authLoading, signOut, refreshUser } = useAuth();
  const { pets, loading: petsLoading, fetchPets, createPet, deletePet } = usePets();
  const { bookings, loading: bookingsLoading, fetchBookings } = useBookings();
  const { getSitter } = useSitters();

  const [bookingTab, setBookingTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showAddPet, setShowAddPet] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<PetSpecies>('dog');
  const [petSize, setPetSize] = useState<PetSize>('medium');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [addingPet, setAddingPet] = useState(false);
  const [sitterProfile, setSitterProfile] = useState<SitterProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchPets();
        fetchBookings();
        if (user.role === 'sitter' || user.role === 'both') {
          getSitter(user.id).then(setSitterProfile);
        }
      }
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await fetchPets();
    await fetchBookings();
    if (user && (user.role === 'sitter' || user.role === 'both')) {
      const sp = await getSitter(user.id);
      setSitterProfile(sp);
    }
    setRefreshing(false);
  };

  const handleAddPet = async () => {
    if (!petName.trim()) {
      Alert.alert('Greška', 'Unesite ime ljubimca.');
      return;
    }
    setAddingPet(true);
    const { error } = await createPet({
      name: petName.trim(),
      species: petSpecies,
      size: petSize,
      breed: petBreed.trim() || undefined,
      age_years: petAge ? parseInt(petAge, 10) : undefined,
    });
    setAddingPet(false);
    if (error) {
      Alert.alert('Greška', error);
    } else {
      setPetName('');
      setPetBreed('');
      setPetAge('');
      setPetSpecies('dog');
      setPetSize('medium');
      setShowAddPet(false);
    }
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert('Obriši ljubimca', `Jeste li sigurni da želite obrisati ${pet.name}?`, [
      { text: 'Odustani', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: () => deletePet(pet.id),
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Odjava', 'Jeste li sigurni da se želite odjaviti?', [
      { text: 'Odustani', style: 'cancel' },
      { text: 'Odjavi se', style: 'destructive', onPress: signOut },
    ]);
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.end_date) >= now && b.status !== 'completed' && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.end_date) < now || b.status === 'completed' || b.status === 'cancelled'
  );
  const displayedBookings = bookingTab === 'upcoming' ? upcomingBookings : pastBookings;

  const isSitter = user?.role === 'sitter' || user?.role === 'both';

  // Earnings calculation for sitters
  const totalEarnings = isSitter
    ? bookings
        .filter((b) => b.sitter_id === user!.id && b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_price ?? 0), 0)
    : 0;

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.guestEmoji}>🐾</Text>
        <Text style={styles.guestTitle}>Dobrodošli u Šapicu!</Text>
        <Text style={styles.guestSubtitle}>
          Prijavite se za pristup profilu, ljubimcima i rezervacijama.
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginBtnText}>Prijavi se</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>Nemaš račun? Registriraj se</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user.full_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>{user.full_name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.city && (
          <Text style={styles.userCity}>📍 {user.city}</Text>
        )}
      </View>

      {/* Sitter Section */}
      {isSitter && sitterProfile ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏠 Moj sitter profil</Text>
          <View style={styles.earningsRow}>
            <View style={styles.earningBox}>
              <Text style={styles.earningValue}>⭐ {sitterProfile.rating_avg?.toFixed(1) ?? '0.0'}</Text>
              <Text style={styles.earningLabel}>Ocjena</Text>
            </View>
            <View style={styles.earningBox}>
              <Text style={styles.earningValue}>{sitterProfile.review_count ?? 0}</Text>
              <Text style={styles.earningLabel}>Recenzija</Text>
            </View>
            <View style={styles.earningBox}>
              <Text style={styles.earningValue}>{totalEarnings.toFixed(0)} €</Text>
              <Text style={styles.earningLabel}>Zarada</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.sitterProfileBtn}
            onPress={() => router.push(`/sitter/${user.id}` as any)}
          >
            <Text style={styles.sitterProfileBtnText}>Pogledaj profil</Text>
          </TouchableOpacity>
        </View>
      ) : !isSitter ? (
        <TouchableOpacity style={styles.becomeSitterCard} onPress={() => router.push('/become-sitter')}>
          <Text style={styles.becomeSitterEmoji}>🐕</Text>
          <View style={styles.becomeSitterTextWrap}>
            <Text style={styles.becomeSitterTitle}>Postani čuvar</Text>
            <Text style={styles.becomeSitterSub}>Zarađuj čuvajući ljubimce u svom susjedstvu</Text>
          </View>
          <Text style={styles.becomeSitterArrow}>→</Text>
        </TouchableOpacity>
      ) : null}

      {/* My Pets */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🐾 Moji ljubimci</Text>
          <TouchableOpacity onPress={() => setShowAddPet(!showAddPet)}>
            <Text style={styles.addBtn}>{showAddPet ? '✕ Zatvori' : '+ Dodaj'}</Text>
          </TouchableOpacity>
        </View>

        {showAddPet && (
          <View style={styles.addPetForm}>
            <TextInput
              style={styles.input}
              placeholder="Ime ljubimca *"
              value={petName}
              onChangeText={setPetName}
              placeholderTextColor={Colors.grayLight}
            />
            <Text style={styles.inputLabel}>Vrsta</Text>
            <View style={styles.chipRow}>
              {(['dog', 'cat', 'bird', 'reptile', 'other'] as PetSpecies[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, petSpecies === s && styles.chipActive]}
                  onPress={() => setPetSpecies(s)}
                >
                  <Text style={[styles.chipText, petSpecies === s && styles.chipTextActive]}>
                    {SPECIES_EMOJI[s]} {s === 'dog' ? 'Pas' : s === 'cat' ? 'Mačka' : s === 'bird' ? 'Ptica' : s === 'reptile' ? 'Reptil' : 'Ostalo'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Veličina</Text>
            <View style={styles.chipRow}>
              {(['small', 'medium', 'large'] as PetSize[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, petSize === s && styles.chipActive]}
                  onPress={() => setPetSize(s)}
                >
                  <Text style={[styles.chipText, petSize === s && styles.chipTextActive]}>
                    {s === 'small' ? 'Mali' : s === 'medium' ? 'Srednji' : 'Veliki'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pasmina (opcionalno)"
              value={petBreed}
              onChangeText={setPetBreed}
              placeholderTextColor={Colors.grayLight}
            />
            <TextInput
              style={styles.input}
              placeholder="Starost (godine)"
              value={petAge}
              onChangeText={setPetAge}
              keyboardType="numeric"
              placeholderTextColor={Colors.grayLight}
            />
            <TouchableOpacity
              style={[styles.submitBtn, addingPet && styles.submitBtnDisabled]}
              onPress={handleAddPet}
              disabled={addingPet}
            >
              {addingPet ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Dodaj ljubimca</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {petsLoading && pets.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.md }} />
        ) : pets.length === 0 && !showAddPet ? (
          <Text style={styles.emptyText}>Nemate dodanih ljubimaca.</Text>
        ) : (
          pets.map((pet) => (
            <View key={pet.id} style={styles.petCard}>
              <Text style={styles.petEmoji}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petMeta}>
                  {pet.breed ?? pet.species} · {pet.size === 'small' ? 'Mali' : pet.size === 'medium' ? 'Srednji' : 'Veliki'}
                  {pet.age_years != null ? ` · ${pet.age_years} god.` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDeletePet(pet)}>
                <Text style={styles.deletePetBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* My Bookings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📅 Moje rezervacije</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, bookingTab === 'upcoming' && styles.tabActive]}
            onPress={() => setBookingTab('upcoming')}
          >
            <Text style={[styles.tabText, bookingTab === 'upcoming' && styles.tabTextActive]}>
              Nadolazeće ({upcomingBookings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, bookingTab === 'past' && styles.tabActive]}
            onPress={() => setBookingTab('past')}
          >
            <Text style={[styles.tabText, bookingTab === 'past' && styles.tabTextActive]}>
              Prošle ({pastBookings.length})
            </Text>
          </TouchableOpacity>
        </View>

        {bookingsLoading && bookings.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.md }} />
        ) : displayedBookings.length === 0 ? (
          <Text style={styles.emptyText}>
            {bookingTab === 'upcoming' ? 'Nema nadolazećih rezervacija.' : 'Nema prošlih rezervacija.'}
          </Text>
        ) : (
          displayedBookings.map((booking) => {
            const otherUser = booking.owner_id === user.id ? booking.sitter : booking.owner;
            const roleSuffix = booking.owner_id === user.id ? 'Čuvar' : 'Vlasnik';
            return (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/booking/${booking.id}` as any)}
              >
                <View style={styles.bookingTop}>
                  <View>
                    <Text style={styles.bookingName}>
                      {otherUser?.full_name ?? 'Korisnik'}
                    </Text>
                    <Text style={styles.bookingRole}>{roleSuffix}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[booking.status] + '22' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[booking.status] }]}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingDetail}>
                    {SPECIES_EMOJI[booking.pet?.species ?? 'dog']} {booking.pet?.name ?? 'Ljubimac'}
                  </Text>
                  <Text style={styles.bookingDetail}>
                    📅 {new Date(booking.start_date).toLocaleDateString('hr-HR')}
                  </Text>
                  <Text style={styles.bookingDetail}>
                    {SERVICE_LABELS[booking.service_type] ?? booking.service_type}
                  </Text>
                </View>
                <Text style={styles.bookingPrice}>{booking.total_price?.toFixed(2)} €</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Odjavi se</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },

  // Guest
  guestEmoji: { fontSize: 64, marginBottom: Spacing.md },
  guestTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.black, marginBottom: Spacing.sm },
  guestSubtitle: { fontSize: FontSize.md, color: Colors.gray, textAlign: 'center', marginBottom: Spacing.lg },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  loginBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.lg },
  registerLink: { color: Colors.secondary, fontSize: FontSize.md, fontWeight: '600' },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.black,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: Spacing.xs,
  },
  userCity: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: Spacing.xs,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  addBtn: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  emptyText: {
    color: Colors.grayLight,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },

  // Become sitter CTA
  becomeSitterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  becomeSitterEmoji: { fontSize: 32, marginRight: Spacing.md },
  becomeSitterTextWrap: { flex: 1 },
  becomeSitterTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  becomeSitterSub: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  becomeSitterArrow: { fontSize: FontSize.xl, color: Colors.primary, fontWeight: '700' },

  // Sitter stats
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  earningBox: { alignItems: 'center' },
  earningValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.black },
  earningLabel: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  sitterProfileBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  sitterProfileBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },

  // Add pet form
  addPetForm: {
    borderTopWidth: 1,
    borderTopColor: Colors.grayLighter,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    color: Colors.gray,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.black,
    backgroundColor: Colors.grayLightest,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.gray,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },

  // Pet card
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
  },
  petEmoji: { fontSize: 28, marginRight: Spacing.md },
  petInfo: { flex: 1 },
  petName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.black },
  petMeta: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  deletePetBtn: { fontSize: FontSize.lg, color: Colors.grayLight, padding: Spacing.sm },

  // Booking tabs
  tabRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.grayLightest,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm - 2,
  },
  tabActive: {
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.grayLight,
  },
  tabTextActive: {
    color: Colors.black,
  },

  // Booking card
  bookingCard: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
    paddingVertical: Spacing.md,
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bookingName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.black },
  bookingRole: { fontSize: FontSize.xs, color: Colors.gray },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bookingDetail: { fontSize: FontSize.xs, color: Colors.gray },
  bookingPrice: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },

  // Logout
  logoutBtn: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  logoutBtnText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.md },
});
