import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/colors';
import { petPassports } from '../../constants/mock-data';

export default function PetPassportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const passport = petPassports.find((p) => p.petId === id) || petPassports[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pet Header */}
      <View style={styles.header}>
        <Avatar uri={passport.petImage} name={passport.petName} size={80} />
        <Text style={styles.petName}>{passport.petName}</Text>
        <Text style={styles.petBreed}>{passport.type} - {passport.breed}</Text>
        <View style={styles.chipBadge}>
          <Ionicons name="hardware-chip-outline" size={14} color={Colors.info} />
          <Text style={styles.chipText}>{passport.microchipId}</Text>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Osnovni podaci</Text>
        <Card variant="outlined">
          <InfoRow icon="calendar-outline" label="Datum rođenja" value={passport.birthDate} />
          <InfoRow icon="scale-outline" label="Težina" value={passport.weight} />
          <InfoRow icon="paw-outline" label="Pasmina" value={passport.breed} />
          <InfoRow icon="hardware-chip-outline" label="Mikročip" value={passport.microchipId} last />
        </Card>
      </View>

      {/* Vaccinations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cijepljenja</Text>
        {passport.vaccinations.map((vax) => (
          <Card key={vax.id} style={styles.vaxCard}>
            <View style={styles.vaxHeader}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
              <Text style={styles.vaxName}>{vax.name}</Text>
            </View>
            <View style={styles.vaxDetails}>
              <View style={styles.vaxDetail}>
                <Text style={styles.vaxLabel}>Datum</Text>
                <Text style={styles.vaxValue}>{vax.date}</Text>
              </View>
              <View style={styles.vaxDetail}>
                <Text style={styles.vaxLabel}>Sljedeće</Text>
                <Text style={[styles.vaxValue, { color: Colors.primary }]}>{vax.nextDate}</Text>
              </View>
              <View style={styles.vaxDetail}>
                <Text style={styles.vaxLabel}>Veterinar</Text>
                <Text style={styles.vaxValue}>{vax.vet}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alergije</Text>
        <Card variant="outlined">
          {passport.allergies.length > 0 ? (
            <View style={styles.tagsRow}>
              {passport.allergies.map((allergy, i) => (
                <Badge key={i} text={allergy} color={Colors.error} bgColor="#fef2f2" />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Nema zabilježenih alergija</Text>
          )}
        </Card>
      </View>

      {/* Medications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lijekovi</Text>
        <Card variant="outlined">
          {passport.medications.length > 0 ? (
            passport.medications.map((med, i) => (
              <View key={i} style={[styles.medRow, i < passport.medications.length - 1 && styles.medBorder]}>
                <Ionicons name="medical" size={18} color={Colors.primary} />
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDetail}>{med.dosage} - {med.frequency}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nema propisanih lijekova</Text>
          )}
        </Card>
      </View>

      {/* Vet Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Veterinar</Text>
        <Card variant="elevated" style={styles.vetCard}>
          <View style={styles.vetHeader}>
            <View style={styles.vetIcon}>
              <Ionicons name="medkit" size={24} color={Colors.white} />
            </View>
            <View style={styles.vetInfo}>
              <Text style={styles.vetName}>{passport.vetContact.name}</Text>
              <Text style={styles.vetClinic}>{passport.vetContact.clinic}</Text>
            </View>
          </View>
          <View style={styles.vetDetails}>
            <View style={styles.vetDetailRow}>
              <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.vetDetailText}>{passport.vetContact.address}</Text>
            </View>
            <TouchableOpacity
              style={styles.vetDetailRow}
              onPress={() => Linking.openURL(`tel:${passport.vetContact.phone}`)}
            >
              <Ionicons name="call-outline" size={16} color={Colors.primary} />
              <Text style={[styles.vetDetailText, { color: Colors.primary }]}>{passport.vetContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Ionicons name={icon as any} size={18} color={Colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.backgroundWarm,
  },
  petName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
  },
  petBreed: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.info,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  vaxCard: {
    marginBottom: 10,
  },
  vaxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  vaxName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  vaxDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  vaxDetail: {
    flex: 1,
  },
  vaxLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 2,
  },
  vaxValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  medBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  medDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vetCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  vetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  vetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vetInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  vetClinic: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vetDetails: {
    gap: 8,
  },
  vetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vetDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
