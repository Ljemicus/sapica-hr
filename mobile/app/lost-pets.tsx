import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LostPetCard } from '../components/shared/LostPetCard';
import { Button } from '../components/ui/Button';
import { Colors } from '../constants/colors';
import { getLostPets } from '../lib/db';
import { LostPet } from '../types';

export default function LostPetsScreen() {
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'dogs' | 'cats'>('all');

  useEffect(() => {
    getLostPets().then((data) => {
      setLostPets(data);
      setLoading(false);
    });
  }, []);

  const filteredPets = lostPets.filter((pet) => {
    if (filter === 'dogs') return pet.type === 'Pas';
    if (filter === 'cats') return pet.type === 'Mačka';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Pomozi pronaći izgubljene ljubimce u tvojoj okolici
        </Text>
        <Button
          title="Prijavi nestanak"
          onPress={() => Alert.alert('Prijavi nestanak', 'Ova funkcionalnost dolazi uskoro!')}
          icon={<Ionicons name="add-circle-outline" size={20} color={Colors.white} />}
          fullWidth
        />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {[
          { key: 'all' as const, label: 'Svi' },
          { key: 'dogs' as const, label: 'Psi' },
          { key: 'cats' as const, label: 'Mačke' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pet List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredPets.map((pet) => (
          <LostPetCard
            key={pet.id}
            pet={pet}
            onShare={() =>
              Alert.alert('Podijeli', `Dijeli informacije o ${pet.name}`)
            }
          />
        ))}
        {filteredPets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nema rezultata</Text>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.backgroundWarm,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  headerText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
  },
});
