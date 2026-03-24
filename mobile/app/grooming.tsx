import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SitterCard } from '../components/shared/SitterCard';
import { Colors } from '../constants/colors';
import { sitters, groomingServices } from '../constants/mock-data';

export default function GroomingScreen() {
  const groomers = sitters.filter((s) => s.services.includes('Grooming'));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>✂️</Text>
        <Text style={styles.headerTitle}>Grooming usluge</Text>
        <Text style={styles.headerSubtitle}>
          Profesionalna njega za vašeg ljubimca
        </Text>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Naše usluge</Text>
        {groomingServices.map((service) => (
          <Card key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <Ionicons name={service.icon as any} size={22} color={Colors.primary} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </View>
            </View>
          </Card>
        ))}
        <Text style={styles.priceNote}>💡 Cijene određuju individualni groomeri na svojim profilima</Text>
      </View>

      {/* Groomers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dostupni groomeri</Text>
        {groomers.length > 0 ? (
          groomers.map((sitter) => (
            <SitterCard key={sitter.id} sitter={sitter} />
          ))
        ) : (
          <Text style={styles.emptyText}>Trenutno nema dostupnih groomera</Text>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
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
  headerEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
  serviceCard: {
    marginBottom: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  serviceDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  serviceDuration: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  priceNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
