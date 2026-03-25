import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Colors } from '../constants/colors';
import { getWalkSession } from '../lib/db';
import { WalkSession } from '../types';

export default function WalkTrackingScreen() {
  const [session, setSession] = useState<WalkSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWalkSession().then((data) => {
      setSession(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="navigate-outline" size={56} color={Colors.textLight} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 16 }}>Nema podataka</Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8 }}>Trenutno nema aktivnih šetnji</Text>
      </View>
    );
  }

  const isActive = session.status === 'u_tijeku';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sitter Info */}
      <View style={styles.sitterRow}>
        <Avatar uri={session.sitterAvatar} name={session.sitterName} size={44} />
        <View style={styles.sitterInfo}>
          <Text style={styles.sitterName}>{session.sitterName}</Text>
          <Text style={styles.petName}>Šeta: {session.petName}</Text>
        </View>
        <Badge
          text={isActive ? 'U tijeku' : 'Završeno'}
          color={isActive ? Colors.white : Colors.info}
          bgColor={isActive ? Colors.success : '#eff6ff'}
        />
      </View>

      {/* Mock Map */}
      <Card variant="elevated" style={styles.mapCard}>
        <View style={styles.mockMap}>
          <View style={styles.mapGrid}>
            {Array.from({ length: 6 }).map((_, row) => (
              <View key={row} style={styles.mapGridRow}>
                {Array.from({ length: 6 }).map((_, col) => (
                  <View key={col} style={styles.mapGridCell} />
                ))}
              </View>
            ))}
          </View>
          {/* SVG-like route using Views */}
          <View style={styles.routeOverlay}>
            <View style={[styles.routeDot, { top: '75%', left: '15%' }]}>
              <Ionicons name="flag" size={16} color={Colors.success} />
            </View>
            <View style={[styles.routeLine, { top: '70%', left: '18%', width: 40, transform: [{ rotate: '-30deg' }] }]} />
            <View style={[styles.routeLine, { top: '58%', left: '28%', width: 50, transform: [{ rotate: '-20deg' }] }]} />
            <View style={[styles.routeDotSmall, { top: '50%', left: '42%' }]} />
            <View style={[styles.routeLine, { top: '45%', left: '44%', width: 50, transform: [{ rotate: '-25deg' }] }]} />
            <View style={[styles.routeLine, { top: '30%', left: '56%', width: 45, transform: [{ rotate: '5deg' }] }]} />
            <View style={[styles.routeDotSmall, { top: '28%', left: '70%' }]} />
            <View style={[styles.routeLine, { top: '35%', left: '68%', width: 40, transform: [{ rotate: '40deg' }] }]} />
            <View style={[styles.routeLine, { top: '48%', left: '60%', width: 35, transform: [{ rotate: '20deg' }] }]} />
            {isActive && (
              <View style={[styles.routeDot, { top: '55%', left: '72%' }]}>
                <View style={styles.pulsingDot} />
                <Ionicons name="paw" size={16} color={Colors.primary} />
              </View>
            )}
            {!isActive && (
              <View style={[styles.routeDot, { top: '55%', left: '72%' }]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.info} />
              </View>
            )}
          </View>
          <View style={styles.mapLabelContainer}>
            <Text style={styles.mapLabel}>Korzo, Rijeka</Text>
          </View>
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{session.duration}</Text>
          <Text style={styles.statLabel}>Trajanje</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="navigate-outline" size={24} color={Colors.categoryBlue} />
          <Text style={styles.statValue}>{session.distance}</Text>
          <Text style={styles.statLabel}>Udaljenost</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="speedometer-outline" size={24} color={Colors.categoryPurple} />
          <Text style={styles.statValue}>{session.avgSpeed}</Text>
          <Text style={styles.statLabel}>Brzina</Text>
        </Card>
      </View>

      {/* Checkpoints */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checkpointi</Text>
        {session.checkpoints.map((cp, index) => (
          <View key={cp.id} style={styles.checkpointRow}>
            <View style={styles.checkpointTimeline}>
              <View style={[
                styles.checkpointDot,
                index === session.checkpoints.length - 1 && isActive && styles.checkpointDotActive,
              ]} />
              {index < session.checkpoints.length - 1 && <View style={styles.checkpointLine} />}
            </View>
            <View style={styles.checkpointContent}>
              <Text style={styles.checkpointTime}>{cp.time}</Text>
              <Text style={styles.checkpointLabel}>{cp.label}</Text>
            </View>
          </View>
        ))}
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
  sitterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundWarm,
  },
  sitterInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sitterName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  petName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mapCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 0,
    overflow: 'hidden',
  },
  mockMap: {
    height: 240,
    backgroundColor: '#e8f5e9',
    position: 'relative',
  },
  mapGrid: {
    flex: 1,
    padding: 8,
  },
  mapGridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  mapGridCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  routeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  routeLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  routeDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeDotSmall: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  pulsingDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  mapLabelContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  checkpointRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  checkpointTimeline: {
    width: 24,
    alignItems: 'center',
  },
  checkpointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  checkpointDotActive: {
    backgroundColor: Colors.success,
    borderColor: '#6ee7b7',
  },
  checkpointLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  checkpointContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  checkpointTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  checkpointLabel: {
    fontSize: 15,
    color: Colors.text,
    marginTop: 2,
  },
});
