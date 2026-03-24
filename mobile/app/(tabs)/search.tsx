import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { SitterCard } from '../../components/shared/SitterCard';
import { Colors } from '../../constants/colors';
import { sitters, services } from '../../constants/mock-data';

const cities = ['Svi', 'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Svi');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredSitters = sitters.filter((sitter) => {
    const matchesSearch =
      searchQuery === '' ||
      sitter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sitter.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'Svi' || sitter.city === selectedCity;
    const matchesService =
      !selectedService || sitter.services.includes(selectedService);
    return matchesSearch && matchesCity && matchesService;
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pretraži sittere, gradove..."
          icon={<Ionicons name="search" size={20} color={Colors.textLight} />}
        />
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? Colors.white : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersSection}>
          <Text style={styles.filterLabel}>Grad</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => setSelectedCity(city)}
                style={[
                  styles.filterChip,
                  selectedCity === city && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCity === city && styles.filterChipTextActive,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Usluga</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() =>
                  setSelectedService(
                    selectedService === service.name ? null : service.name
                  )
                }
                style={[
                  styles.filterChip,
                  selectedService === service.name && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedService === service.name && styles.filterChipTextActive,
                  ]}
                >
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          {filteredSitters.length} {filteredSitters.length === 1 ? 'rezultat' : 'rezultata'}
        </Text>
        {filteredSitters.map((sitter) => (
          <SitterCard key={sitter.id} sitter={sitter} />
        ))}
        {filteredSitters.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nema rezultata</Text>
            <Text style={styles.emptyText}>
              Pokušaj s drugim pojmom ili promijeni filtere
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filtersSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  results: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
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
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
