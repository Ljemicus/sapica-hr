import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { myPets, myBookings } from '../../constants/mock-data';

function MenuRow({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color={Colors.primary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.menuRight}>
        {badge && <Badge text={badge} size="sm" />}
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const statusColors: Record<string, { color: string; bg: string }> = {
    confirmed: { color: Colors.success, bg: '#ecfdf5' },
    completed: { color: Colors.info, bg: '#eff6ff' },
    pending: { color: Colors.warning, bg: '#fffbeb' },
    cancelled: { color: Colors.error, bg: '#fef2f2' },
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'Potvrđeno',
    completed: 'Završeno',
    pending: 'Na čekanju',
    cancelled: 'Otkazano',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar name="Korisnik" size={80} />
        <Text style={styles.userName}>Ime Korisnika</Text>
        <Text style={styles.userEmail}>korisnik@email.com</Text>
        <Button
          title="Uredi profil"
          onPress={() => Alert.alert('Uredi profil', 'Uređivanje profila dolazi uskoro!')}
          variant="outline"
          size="sm"
          style={styles.editButton}
        />
      </View>

      {/* My Pets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moji ljubimci</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {myPets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/pet-passport/${pet.id}`)}
            >
              <Card style={styles.petCard}>
                <Avatar uri={pet.image} name={pet.name} size={56} />
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed}</Text>
                <Text style={styles.petAge}>{pet.age} god.</Text>
                <View style={styles.passportLink}>
                  <Ionicons name="document-text-outline" size={12} color={Colors.primary} />
                  <Text style={styles.passportLinkText}>Karton</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addPetCard}>
            <Ionicons name="add-circle-outline" size={36} color={Colors.primary} />
            <Text style={styles.addPetText}>Dodaj</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* My Bookings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moje rezervacije</Text>
        {myBookings.map((booking) => (
          <Card key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingSitter}>{booking.sitterName}</Text>
              <Badge
                text={statusLabels[booking.status]}
                color={statusColors[booking.status].color}
                bgColor={statusColors[booking.status].bg}
                size="sm"
              />
            </View>
            <Text style={styles.bookingService}>{booking.service}</Text>
            <View style={styles.bookingDateRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.bookingDate}>
                {booking.startDate} — {booking.endDate}
              </Text>
            </View>
            <Text style={styles.bookingPrice}>{booking.totalPrice}€</Text>
          </Card>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Postavke</Text>
        <Card variant="outlined" style={styles.menuCard}>
          <MenuRow icon="notifications-outline" label="Obavijesti" onPress={() => Alert.alert('Obavijesti', 'Postavke obavijesti dolaze uskoro!')} />
          <MenuRow icon="card-outline" label="Način plaćanja" onPress={() => Alert.alert('Plaćanje', 'Postavke plaćanja dolaze uskoro!')} />
          <MenuRow icon="shield-checkmark-outline" label="Privatnost" onPress={() => Alert.alert('Privatnost', 'Postavke privatnosti dolaze uskoro!')} />
          <MenuRow icon="help-circle-outline" label="Pomoć" onPress={() => Alert.alert('Pomoć', 'Kontaktirajte nas na info@sapica.hr')} />
          <MenuRow icon="star-outline" label="Ocijeni aplikaciju" onPress={() => Alert.alert('Hvala! ⭐', 'Ocjenjivanje dolazi kad app bude na App Storeu!')} />
          <MenuRow
            icon="paw-outline"
            label="Postani sitter"
            onPress={() => router.push('/become-sitter')}
          />
        </Card>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/auth/login')}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Odjavi se</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.backgroundWarm,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  petCard: {
    alignItems: 'center',
    width: 110,
    marginRight: 12,
    paddingVertical: 16,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  petBreed: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  petAge: {
    fontSize: 12,
    color: Colors.textLight,
  },
  passportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: Colors.backgroundWarm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  passportLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  addPetCard: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    borderStyle: 'dashed',
    paddingVertical: 16,
  },
  addPetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
  bookingCard: {
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingSitter: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  bookingService: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  bookingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  bookingDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 8,
  },
  menuCard: {
    padding: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
});
