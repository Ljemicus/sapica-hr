import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  text: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({
  text,
  color = Colors.primary,
  bgColor = Colors.backgroundWarm,
  style,
  size = 'md',
}: BadgeProps) {
  return (
    <View style={[styles.base, size === 'sm' && styles.sm, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color }]}>{text}</Text>
    </View>
  );
}

export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={styles.notification}>
      <Text style={styles.notificationText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
  notification: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notificationText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
