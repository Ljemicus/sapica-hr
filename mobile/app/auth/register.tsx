import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.title}>Kreiraj račun</Text>
        <Text style={styles.subtitle}>Pridruži se Šapica zajednici!</Text>
      </View>

      {/* Social Login */}
      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={22} color={Colors.text} />
          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={22} color="#DB4437" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-facebook" size={22} color="#1877F2" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ili email</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Registration Form */}
      <View style={styles.form}>
        <Input
          label="Ime i prezime"
          value={name}
          onChangeText={setName}
          placeholder="Vaše ime"
          icon={<Ionicons name="person-outline" size={20} color={Colors.textLight} />}
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="vas@email.com"
          keyboardType="email-address"
          icon={<Ionicons name="mail-outline" size={20} color={Colors.textLight} />}
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
          label="Lozinka"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 znakova"
          secureTextEntry
          icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />}
        />
        <Input
          label="Potvrdi lozinku"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Ponovite lozinku"
          secureTextEntry
          icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />}
        />
        <Button
          title="Registriraj se"
          onPress={() => router.back()}
          fullWidth
          size="lg"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Već imate račun? </Text>
        <TouchableOpacity onPress={() => router.replace('/auth/login')}>
          <Text style={styles.footerLink}>Prijavite se</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textLight,
  },
  form: {
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
