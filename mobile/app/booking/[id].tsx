import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/colors';
import { sitters, services } from '../../constants/mock-data';

const availableDates = [
  { date: '25.03.', day: 'Uto' },
  { date: '26.03.', day: 'Sri' },
  { date: '27.03.', day: 'Čet' },
  { date: '28.03.', day: 'Pet' },
  { date: '29.03.', day: 'Sub' },
  { date: '30.03.', day: 'Ned' },
  { date: '31.03.', day: 'Pon' },
];

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sitter = sitters.find((s) => s.id === id) ?? sitters[0];

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const totalPrice = selectedDates.length * sitter.pricePerHour * 8;

  const steps = ['Datumi', 'Usluga', 'Potvrda'];

  return (
    <View style={styles.container}>
      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((s, i) => (
          <View key={s} style={styles.stepWrapper}>
            <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
              {i < step ? (
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              ) : (
                <Text style={[styles.stepNumber, i <= step && styles.stepNumberActive]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sitter Info */}
        <Card style={styles.sitterCard}>
          <View style={styles.sitterRow}>
            <Avatar uri={sitter.avatar} name={sitter.name} size={48} />
            <View style={styles.sitterInfo}>
              <Text style={styles.sitterName}>{sitter.name}</Text>
              <Text style={styles.sitterCity}>{sitter.city}</Text>
            </View>
            <Text style={styles.sitterPrice}>{sitter.pricePerHour}€/h</Text>
          </View>
        </Card>

        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Odaberite datume</Text>
            <View style={styles.datesGrid}>
              {availableDates.map((d) => (
                <TouchableOpacity
                  key={d.date}
                  style={[
                    styles.dateCard,
                    selectedDates.includes(d.date) && styles.dateCardActive,
                  ]}
                  onPress={() => toggleDate(d.date)}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      selectedDates.includes(d.date) && styles.dateDayActive,
                    ]}
                  >
                    {d.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      selectedDates.includes(d.date) && styles.dateTextActive,
                    ]}
                  >
                    {d.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Odaberite uslugu</Text>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  selectedService === service.name && styles.serviceCardActive,
                ]}
                onPress={() => setSelectedService(service.name)}
              >
                <View>
                  <Text
                    style={[
                      styles.serviceName,
                      selectedService === service.name && styles.serviceNameActive,
                    ]}
                  >
                    {service.name}
                  </Text>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                </View>
                {selectedService === service.name && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Potvrda rezervacije</Text>
            <Card variant="outlined" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sitter</Text>
                <Text style={styles.summaryValue}>{sitter.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Usluga</Text>
                <Text style={styles.summaryValue}>{selectedService}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Datumi</Text>
                <Text style={styles.summaryValue}>{selectedDates.join(' ')}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Ukupno</Text>
                <Text style={styles.totalValue}>{totalPrice}€</Text>
              </View>
            </Card>

            <Card variant="outlined" style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Način plaćanja</Text>
              <TouchableOpacity style={styles.paymentOption}>
                <Ionicons name="card-outline" size={22} color={Colors.primary} />
                <Text style={styles.paymentText}>Kreditna kartica</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {step > 0 && (
          <Button
            title="Natrag"
            onPress={() => setStep(step - 1)}
            variant="outline"
            style={styles.backButton}
          />
        )}
        <Button
          title={step === 2 ? 'Potvrdi i plati' : 'Dalje'}
          onPress={() => {
            if (step < 2) {
              setStep(step + 1);
            } else {
              router.back();
            }
          }}
          disabled={
            (step === 0 && selectedDates.length === 0) ||
            (step === 1 && !selectedService)
          }
          size="lg"
          style={styles.nextButton}
          icon={
            step === 2 ? (
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            ) : undefined
          }
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
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 32,
  },
  stepWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textLight,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sitterCard: {
    marginBottom: 16,
  },
  sitterRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  sitterCity: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sitterPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dateCard: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  dateCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundWarm,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dateDayActive: {
    color: Colors.primary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  dateTextActive: {
    color: Colors.primary,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  serviceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundWarm,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceNameActive: {
    color: Colors.primary,
  },
  servicePrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  paymentText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  backButton: {
    flex: 0.4,
  },
  nextButton: {
    flex: 1,
  },
});
