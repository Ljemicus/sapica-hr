import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: '700', color: Colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="sitter/[id]"
          options={{ title: 'Profil sittera', headerBackTitle: 'Natrag' }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ title: 'Chat', headerBackTitle: 'Poruke' }}
        />
        <Stack.Screen
          name="booking/[id]"
          options={{ title: 'Rezervacija', headerBackTitle: 'Natrag', presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ title: 'Prijava', headerBackTitle: 'Natrag', presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth/register"
          options={{ title: 'Registracija', headerBackTitle: 'Natrag', presentation: 'modal' }}
        />
        <Stack.Screen
          name="lost-pets"
          options={{ title: 'Izgubljeni ljubimci', headerBackTitle: 'Natrag' }}
        />
        <Stack.Screen
          name="become-sitter"
          options={{ title: 'Postani sitter', headerBackTitle: 'Natrag', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
