// src/components/TimeRangeButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function TimeRangeButton({ value, label, current, onPress, styles }) {
  const isActive = current === value;
  return (
    <TouchableOpacity
      style={[styles.rangeButton, isActive && styles.rangeButtonActive]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.rangeButtonText, isActive && styles.rangeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}