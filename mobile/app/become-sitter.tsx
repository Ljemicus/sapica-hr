import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Colors } from '../constants/colors';

const serviceOptions = [
  { id: '1', name: 'Čuvanje kod kuće', icon: 'home-outline' as const },
  { id: '2', name: 'Šetnja', icon: 'walk-outline' as const },
  { id: '3', name: 'Dnevna briga', icon: 'sunny-outline' as const },
  { id: '4', name: 'Grooming', icon: 'cut-outline' as const },
  { id: '5', name: 'Dresura', icon: 'school-outline' as const },
  { id: '6', name: 'Agility', icon: 'fitness-outline' as const },
];

export default function BecomeSitterScreen() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pricePerHour, setPricePerHour] = useState('');

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🐕</Text>
        <Text style={styles.title}>Postani Šapica sitter</Text>
        <Text style={styles.subtitle}>
          Zarađuj dok se brineš o ljubimcima. Pridruži se stotinama sittera diljem Hrvatske!
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefits}>
        {[
          { icon: 'cash-outline' as const, text: 'Fleksibilna zarada' },
          { icon: 'time-outline' as const, text: 'Radi kad ti odgovara' },
          { icon: 'people-outline' as const, text: 'Upoznaj ljubitelje životinja' },
        ].map((benefit) => (
          <View key={benefit.text} style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name={benefit.icon} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Registracijska forma</Text>

        <Input
          label="Ime i prezime"
          value={name}
          onChangeText={setName}
          placeholder="Vaše puno ime"
          icon={<Ionicons name="person-outline" size={20} color={Colors.textLight} />}
        />
        <Input
          label="Grad"
          value={city}
          onChangeText={setCity}
          placeholder="npr. Zagreb"
          icon={<Ionicons name="location-outline" size={20} color={Colors.textLight} />}
        />
        <Input
          label="Telefon"
          value={phone}
          onChangeText={setPhone}
          placeholder="+385 91 234 5678"
          keyboardType="phone-pad"
          icon={<Ionicons name="call-outline" size={20} color={Colors.textLight} />}
        />
        <Input
          label="Iskustvo s životinjama"
          value={experience}
          onChangeText={setExperience}
          placeholder="npr. 3 godine iskustva s psima"
          icon={<Ionicons name="paw-outline" size={20} color={Colors.textLight} />}
        />
        <Input
          label="O meni"
          value={description}
          onChangeText={setDescription}
          placeholder="Opišite sebe i zašto volite životinje..."
          multiline
          numberOfLines={4}
        />

        {/* Services */}
        <Text style={styles.fieldLabel}>Usluge koje nudim</Text>
        <View style={styles.servicesGrid}>
          {serviceOptions.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceOption,
                selectedServices.includes(service.id) && styles.serviceOptionActive,
              ]}
              onPress={() => toggleService(service.id)}
            >
              <Ionicons
                name={service.icon}
                size={22}
                color={selectedServices.includes(service.id) ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.serviceOptionText,
                  selectedServices.includes(service.id) && styles.serviceOptionTextActive,
                ]}
              >
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Cijena po satu (€)"
          value={pricePerHour}
          onChangeText={setPricePerHour}
          placeholder="npr. 15"
          keyboardType="numeric"
          icon={<Ionicons name="cash-outline" size={20} color={Colors.textLight} />}
        />

        <Button
          title="Pošalji prijavu"
          onPress={() => {
            Alert.alert(
              'Prijava poslana!',
              'Hvala na prijavi! Javit ćemo vam se u roku 24 sata.',
              [{ text: 'Super!', onPress: () => router.back() }]
            );
          }}
          fullWidth
          size="lg"
          icon={<Ionicons name="checkmark-circle" size={20} color={Colors.white} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.backgroundWarm,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  benefits: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  benefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: -4,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  serviceOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundWarm,
  },
  serviceOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    flex: 1,
  },
  serviceOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
