import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/ui/Avatar';
import { Colors } from '../constants/colors';
import { photoUpdates } from '../constants/mock-data';

export default function PhotoUpdatesScreen() {
  const [photos, setPhotos] = useState(photoUpdates);

  const toggleLike = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p))
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="camera" size={20} color={Colors.primary} />
        <Text style={styles.headerText}>Ažuriranja od sittera</Text>
      </View>

      {photos.map((photo) => (
        <View key={photo.id} style={styles.photoCard}>
          {/* Sitter header */}
          <View style={styles.photoHeader}>
            <Avatar uri={photo.sitterAvatar} name={photo.sitterName} size={36} />
            <View style={styles.photoHeaderInfo}>
              <Text style={styles.photoSitterName}>{photo.sitterName}</Text>
              <Text style={styles.photoTimestamp}>Danas u {photo.timestamp}</Text>
            </View>
            <Text style={styles.petTag}>{photo.petName}</Text>
          </View>

          {/* Image */}
          <Image source={{ uri: photo.image }} style={styles.photoImage} />

          {/* Actions */}
          <View style={styles.photoActions}>
            <TouchableOpacity
              onPress={() => toggleLike(photo.id)}
              style={styles.likeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={photo.liked ? 'heart' : 'heart-outline'}
                size={26}
                color={photo.liked ? Colors.error : Colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Caption */}
          <View style={styles.captionRow}>
            <Text style={styles.caption}>
              <Text style={styles.captionBold}>{photo.sitterName} </Text>
              {photo.caption}
            </Text>
          </View>
        </View>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundWarm,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  photoCard: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  photoHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  photoSitterName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  photoTimestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  petTag: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.backgroundWarm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoImage: {
    width: '100%',
    height: 320,
    backgroundColor: Colors.borderLight,
  },
  photoActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 12,
  },
  likeButton: {
    padding: 4,
  },
  actionButton: {
    padding: 4,
  },
  captionRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  caption: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  captionBold: {
    fontWeight: '700',
  },
});
