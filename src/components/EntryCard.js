// src/components/EntryCard.js
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export default function EntryCard({ entry, onPress, onLongPress, getScoreColor, styles }) {
  return (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{entry.date}</Text>
        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(entry.score) }]}>
          <Text style={styles.scoreBadgeText}>
            {entry.score > 0 ? '+' : ''}{entry.score}
          </Text>
        </View>
      </View>

      {entry.weight ? (
        <Text style={styles.entryDetail}>⚖️ {entry.weight} lbs</Text>
      ) : null}

      {entry.exercise ? (
        <Text style={styles.entryDetail} numberOfLines={1}>💪 {entry.exercise}</Text>
      ) : null}

      {entry.comments ? (
        <Text style={styles.entryComment} numberOfLines={2}>💭 {entry.comments}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
