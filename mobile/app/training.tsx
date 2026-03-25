import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SitterCard } from '../components/shared/SitterCard';
import { Colors } from '../constants/colors';
import { getTrainingPrograms, getTrainers } from '../lib/db';
import { TrainingProgram, Sitter } from '../types';

export default function TrainingScreen() {
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [trainers, setTrainers] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrainingPrograms(), getTrainers()]).then(([programs, trainersData]) => {
      setTrainingPrograms(programs);
      setTrainers(trainersData);
      setLoading(false);
    });
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎓</Text>
        <Text style={styles.headerTitle}>Dresura i trening</Text>
        <Text style={styles.headerSubtitle}>
          Profesionalni programi obuke za vašeg psa
        </Text>
      </View>

      {/* Programs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programi</Text>
        {trainingPrograms.map((program) => (
          <Card key={program.id} variant="elevated" style={styles.programCard}>
            <View style={styles.programHeader}>
              <View style={styles.programIcon}>
                <Ionicons name={program.icon as any} size={22} color={Colors.white} />
              </View>
              <View style={styles.programHeaderInfo}>
                <Text style={styles.programName}>{program.name}</Text>
              </View>
            </View>
            <Text style={styles.programDesc}>{program.description}</Text>
            <View style={styles.programMeta}>
              <Badge text={program.duration} color={Colors.info} bgColor="#eff6ff" size="sm" />
              <Badge text={`${program.sessions} sesija`} color={Colors.categoryPurple} bgColor="#f5f3ff" size="sm" />
            </View>
          </Card>
        ))}
      </View>

      <Text style={styles.priceNote}>Cijene određuju pružatelji usluga na svojim profilima</Text>

      {/* Trainers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dostupni treneri</Text>
        {trainers.length > 0 ? (
          trainers.map((sitter) => (
            <SitterCard key={sitter.id} sitter={sitter} />
          ))
        ) : (
          <Text style={styles.emptyText}>Trenutno nema dostupnih trenera</Text>
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
  programCard: {
    marginBottom: 12,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  programIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  programHeaderInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  programDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  programMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  priceNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
