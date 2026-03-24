import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Colors } from '../../constants/colors';
import { LostPet } from '../../types';

interface LostPetCardProps {
  pet: LostPet;
  onShare?: () => void;
}

export function LostPetCard({ pet, onShare }: LostPetCardProps) {
  return (
    <Card variant="elevated" style={styles.card}>
      <Image source={{ uri: pet.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{pet.name}</Text>
          <Badge
            text={pet.found ? 'Pronađen' : 'Traži se'}
            color={pet.found ? Colors.success : Colors.error}
            bgColor={pet.found ? '#ecfdf5' : '#fef2f2'}
          />
        </View>
        <Text style={styles.breed}>{pet.type} — {pet.breed}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.location}>{pet.lastSeen}</Text>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.date}>Zadnji put viđen: {pet.lastSeenDate}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{pet.description}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
            <Ionicons name="call-outline" size={16} color={Colors.white} />
            <Text style={styles.contactText}>Kontakt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={onShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={16} color={Colors.primary} />
            <Text style={styles.shareText}>Podijeli</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  breed: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  contactText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundWarm,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  shareText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
