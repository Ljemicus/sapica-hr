import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { NotificationBadge } from '../ui/Badge';
import { Colors } from '../../constants/colors';
import { Conversation } from '../../types';

interface MessagePreviewProps {
  conversation: Conversation;
}

export function MessagePreview({ conversation }: MessagePreviewProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/chat/${conversation.id}`)}
      activeOpacity={0.7}
    >
      <Avatar uri={conversation.participantAvatar} name={conversation.participantName} size={52} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, conversation.unreadCount > 0 && styles.unread]}>
            {conversation.participantName}
          </Text>
          <Text style={styles.time}>{conversation.lastMessageTime}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[styles.message, conversation.unreadCount > 0 && styles.unreadMessage]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </Text>
          <NotificationBadge count={conversation.unreadCount} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  unread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: Colors.textLight,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: '500',
  },
});
