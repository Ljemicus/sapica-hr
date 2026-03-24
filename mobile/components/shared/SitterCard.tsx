import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Colors } from '../../constants/colors';
import { Sitter } from '../../types';

interface SitterCardProps {
  sitter: Sitter;
}

export function SitterCard({ sitter }: SitterCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/sitter/${sitter.id}`)}
    >
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <Avatar uri={sitter.avatar} name={sitter.name} size={56} showBadge={sitter.verified} />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{sitter.name}</Text>
              {sitter.verified && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={Colors.star} />
              <Text style={styles.rating}>{sitter.rating}</Text>
              <Text style={styles.reviewCount}>({sitter.reviewCount} recenzija)</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.city}>{sitter.city}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{sitter.pricePerHour}€</Text>
            <Text style={styles.priceUnit}>/sat</Text>
          </View>
        </View>
        <View style={styles.services}>
          {sitter.services.map((service) => (
            <Badge key={service} text={service} size="sm" />
          ))}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  city: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
});
