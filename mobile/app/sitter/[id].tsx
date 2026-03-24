import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { sitters, reviews } from '../../constants/mock-data';

export default function SitterProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sitter = sitters.find((s) => s.id === id) ?? sitters[0];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar uri={sitter.avatar} name={sitter.name} size={96} showBadge={sitter.verified} />
          <Text style={styles.name}>{sitter.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color={Colors.star} />
            <Text style={styles.rating}>{sitter.rating}</Text>
            <Text style={styles.reviewCount}>({sitter.reviewCount} recenzija)</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.city}>{sitter.city}</Text>
          </View>
          {sitter.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.verifiedText}>Verificirani profil</Text>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O meni</Text>
          <Text style={styles.description}>{sitter.description}</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usluge</Text>
          <View style={styles.servicesList}>
            {sitter.services.map((service) => (
              <View key={service} style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                <Text style={styles.serviceName}>{service}</Text>
              </View>
            ))}
          </View>
          <Card variant="outlined" style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Cijena po satu</Text>
              <Text style={styles.priceValue}>{sitter.pricePerHour}€</Text>
            </View>
          </Card>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recenzije</Text>
          {reviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Avatar uri={review.userAvatar} name={review.userName} size={40} />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>{review.userName}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color={Colors.star}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </Card>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Booking CTA */}
      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaPrice}>{sitter.pricePerHour}€<Text style={styles.ctaPriceUnit}>/sat</Text></Text>
        </View>
        <Button
          title="Rezerviraj"
          onPress={() => router.push(`/booking/${sitter.id}`)}
          size="lg"
          icon={<Ionicons name="calendar" size={20} color={Colors.white} />}
          style={styles.ctaButton}
        />
      </View>
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
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  city: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
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
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  servicesList: {
    gap: 10,
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceName: {
    fontSize: 15,
    color: Colors.text,
  },
  priceCard: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  ctaPriceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  ctaButton: {
    minWidth: 160,
  },
});
