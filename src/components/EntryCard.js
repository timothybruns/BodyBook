// src/components/EntryCard.js
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { formatShortDate } from '../utils/date';

export default function EntryCard({ entry, onPress, onLongPress, getScoreColor, styles }) {
  return (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatShortDate(entry.date)}</Text>
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
        <Text style={styles.entryDetail} numberOfLines={2}>💪 {entry.exercise}</Text>
      ) : null}

      {entry.diet ? (
        <Text style={styles.entryDetail} numberOfLines={2}>🍽️ {entry.diet}</Text>
      ) : null}

      {entry.recovery ? (
        <Text style={styles.entryDetail} numberOfLines={2}>🧘 {entry.recovery}</Text>
      ) : null}

      {entry.comments ? (
        <Text style={styles.entryComment} numberOfLines={2}>💭 {entry.comments}</Text>
      ) : null}
    </TouchableOpacity>
  );
}