import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Greška', 'Sva polja su obavezna.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne podudaraju.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Greška', 'Lozinka mora imati najmanje 6 znakova.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, fullName.trim());
      if (result?.error) {
        Alert.alert('Greška pri registraciji', result.error);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert(
        'Greška pri registraciji',
        err?.message ?? 'Došlo je do pogreške. Pokušaj ponovo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </View>
          <Text style={styles.appName}>Šapica</Text>
          <Text style={styles.tagline}>
            Pridruži se zajednici ljubitelja kućnih ljubimaca
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registracija</Text>
          <Text style={styles.cardSubtitle}>Kreiraj svoj Šapica račun</Text>

          {/* Full name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ime i prezime</Text>
            <TextInput
              style={styles.input}
              placeholder="npr. Ana Horvat"
              placeholderTextColor={Colors.grayLight}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail adresa</Text>
            <TextInput
              style={styles.input}
              placeholder="npr. ana@email.com"
              placeholderTextColor={Colors.grayLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Lozinka</Text>
            <TextInput
              style={styles.input}
              placeholder="Najmanje 6 znakova"
              placeholderTextColor={Colors.grayLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Confirm password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Potvrdi lozinku</Text>
            <TextInput
              style={styles.input}
              placeholder="Ponovi lozinku"
              placeholderTextColor={Colors.grayLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              editable={!loading}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Registriraj se</Text>
            )}
          </TouchableOpacity>

          {/* Terms note */}
          <Text style={styles.termsText}>
            Registracijom prihvaćaš naše Uvjete korištenja i Politiku privatnosti.
          </Text>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Već imaš račun? </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.footerLink}>Prijavi se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },

  // Logo area
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: '#004E89',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#004E89',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginBottom: Spacing.lg,
  },

  // Fields
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.black,
    backgroundColor: Colors.background,
  },

  // Submit
  submitButton: {
    height: 52,
    backgroundColor: '#FF6B35',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Terms
  termsText: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 16,
    paddingHorizontal: Spacing.sm,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  footerLink: {
    fontSize: FontSize.sm,
    color: '#FF6B35',
    fontWeight: '700',
  },
});
