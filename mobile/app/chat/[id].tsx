import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { supabase } from '../../lib/supabase';
import { Message, User } from '../../types/database';

export default function ChatScreen() {
  const { id: otherUserId, bookingId } = useLocalSearchParams<{ id: string; bookingId?: string }>();
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(otherUserId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!otherUserId) return;
    (async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single();
      if (data) setOtherUser(data as User);
    })();
  }, [otherUserId]);

  const handleSend = async () => {
    if (!text.trim() || !otherUserId || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    await sendMessage(otherUserId, msgText, bookingId);
    setSending(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === user?.id;
    return (
      <View style={[styles.messageBubbleWrap, isMine ? styles.myWrap : styles.theirWrap]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.bubbleText, isMine ? styles.myBubbleText : styles.theirBubbleText]}>
            {item.text}
          </Text>
        </View>
        <Text style={[styles.time, isMine ? styles.myTime : styles.theirTime]}>
          {new Date(item.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const headerTitle = otherUser?.full_name ?? 'Chat';

  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.black,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>Započnite razgovor!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            inverted={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Napiši poruku..."
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            placeholderTextColor={Colors.grayLight}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.sendBtnText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.grayLight },

  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  messageBubbleWrap: {
    marginBottom: Spacing.sm,
    maxWidth: '80%',
  },
  myWrap: { alignSelf: 'flex-end' },
  theirWrap: { alignSelf: 'flex-start' },

  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Spacing.xs,
  },
  theirBubble: {
    backgroundColor: Colors.grayLighter,
    borderBottomLeftRadius: Spacing.xs,
  },
  bubbleText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  myBubbleText: { color: Colors.white },
  theirBubbleText: { color: Colors.black },

  time: {
    fontSize: 10,
    color: Colors.grayLight,
    marginTop: 2,
  },
  myTime: { textAlign: 'right' },
  theirTime: { textAlign: 'left' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLighter,
    ...Shadow.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grayLighter,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.black,
    maxHeight: 100,
    backgroundColor: Colors.grayLightest,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
