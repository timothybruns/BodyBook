// src/components/ScoreButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function ScoreButton({ value, currentScore, onSelect, styles }) {
  const isActive = currentScore === value.toString();
  return (
    <TouchableOpacity
      style={[
        styles.scoreButton,
        isActive && styles.scoreButtonActive,
        value < 0 && styles.scoreButtonNegative,
        value > 0 && styles.scoreButtonPositive,
      ]}
      onPress={() => onSelect(value.toString())}
    >
      <Text style={[styles.scoreButtonText, isActive && styles.scoreButtonTextActive]}>
        {value > 0 ? '+' : ''}{value}
      </Text>
    </TouchableOpacity>
  );
}