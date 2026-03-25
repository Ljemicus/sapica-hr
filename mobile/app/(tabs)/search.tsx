import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { SitterCard } from '../../components/shared/SitterCard';
import { Colors } from '../../constants/colors';
import { sitters, services } from '../../constants/mock-data';

const cities = ['Svi', 'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'];

const CITY_COORDS: Record<string, [number, number]> = {
  'Zagreb': [45.815, 15.982],
  'Split': [43.508, 16.440],
  'Rijeka': [45.327, 14.442],
  'Osijek': [45.554, 18.695],
  'Zadar': [44.119, 15.232],
};



function MapSection({ sitters, selectedCity }: { sitters: typeof import('../../constants/mock-data').sitters; selectedCity: string }) {
  const mapHtml = useMemo(() => {
    const center = selectedCity !== 'Svi' && CITY_COORDS[selectedCity]
      ? CITY_COORDS[selectedCity]
      : [44.5, 16.0];
    const zoom = selectedCity !== 'Svi' ? 12 : 7;

    const markers = sitters.map((s) => {
      const cityCoord = CITY_COORDS[s.city] || [45.815, 15.982];
      const lat = cityCoord[0] + (Math.random() - 0.5) * 0.02;
      const lng = cityCoord[1] + (Math.random() - 0.5) * 0.02;
      return `L.marker([${lat},${lng}]).addTo(map).bindPopup('<b>${s.name}</b><br>⭐ ${s.rating} · ${s.city}');`;
    }).join('\n');

    return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%}</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map').setView([${center[0]},${center[1]}],${zoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
${markers}
</script></body></html>`;
  }, [sitters, selectedCity]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={32} color={Colors.primary} />
          <Text style={styles.mapPlaceholderText}>🐾 {sitters.length} pružatelja</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.mapWebView}
        scrollEnabled={false}
        javaScriptEnabled={true}
      />
    </View>
  );
}

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

      {/* Map via WebView + Leaflet */}
      <MapSection sitters={filteredSitters} selectedCity={selectedCity} />

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
  mapContainer: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapWebView: {
    flex: 1,
    borderRadius: 16,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  results: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
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
