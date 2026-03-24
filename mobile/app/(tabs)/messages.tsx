import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { Conversation } from '../../types/database';

function getInitials(name: string | undefined | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string | undefined | null): string {
  if (!name) return Colors.grayLight;
  const colors = ['#FF6B35', '#004E89', '#4CAF50', '#9C27B0', '#00BCD4', '#FF5722'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'sada';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHrs < 24) return `${diffHrs}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const { conversations, loading, fetchConversations } = useMessages();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [fetchConversations]);

  // Not logged in
  if (!session || !user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color={Colors.grayLighter} />
        <Text style={styles.loginTitle}>Prijava potrebna</Text>
        <Text style={styles.loginSubtitle}>Prijavite se kako biste vidjeli poruke</Text>
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Prijavi se</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderConversation = ({ item }: { item: Conversation }) => {
    const name = item.user.full_name ?? 'Nepoznato';
    const lastText = item.lastMessage?.text ?? '';
    const truncated = lastText.length > 50 ? lastText.slice(0, 50) + '...' : lastText;
    const timeAgo = item.lastMessage?.created_at
      ? formatTimeAgo(item.lastMessage.created_at)
      : '';

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.user.id}`)}
      >
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(name) }]}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, item.unreadCount > 0 && styles.unreadName]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text
              style={[styles.messagePreview, item.unreadCount > 0 && styles.unreadPreview]}
              numberOfLines={1}
            >
              {truncated}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Ucitavanje poruka...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.user.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="chatbubbles-outline" size={56} color={Colors.grayLighter} />
            <Text style={styles.emptyTitle}>Nema poruka</Text>
            <Text style={styles.emptySubtitle}>
              Kada kontaktirate cuvara, poruke ce se pojaviti ovdje
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLightest,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  conversationName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadName: {
    fontWeight: '800',
  },
  timeText: {
    fontSize: FontSize.xs,
    color: Colors.grayLight,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    fontSize: FontSize.sm,
    color: Colors.grayLight,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadPreview: {
    color: Colors.gray,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs + 2,
  },
  unreadBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.grayLight,
    marginTop: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.black,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.grayLight,
    textAlign: 'center',
  },
  loginTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.black,
    marginTop: Spacing.md,
  },
  loginSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.grayLight,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
