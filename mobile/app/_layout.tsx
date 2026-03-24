import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.secondary,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Prijava', presentation: 'modal' }} />
        <Stack.Screen name="auth/register" options={{ title: 'Registracija', presentation: 'modal' }} />
        <Stack.Screen name="sitter/[id]" options={{ title: 'Profil čuvara' }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Rezervacija' }} />
        <Stack.Screen name="booking/new" options={{ title: 'Nova rezervacija' }} />
        <Stack.Screen name="become-sitter" options={{ title: 'Postani čuvar' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Poruke' }} />
      </Stack>
    </AuthProvider>
  );
}
