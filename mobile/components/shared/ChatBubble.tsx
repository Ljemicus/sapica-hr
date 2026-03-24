import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface ChatBubbleProps {
  text: string;
  isMe: boolean;
  timestamp: string;
}

export function ChatBubble({ text, isMe, timestamp }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.text, isMe ? styles.myText : styles.otherText]}>{text}</Text>
      </View>
      <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>{timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    maxWidth: '80%',
  },
  myContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: Colors.white,
  },
  otherText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
  },
  myTimestamp: {
    textAlign: 'right',
  },
});
