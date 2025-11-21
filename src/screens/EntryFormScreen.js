// src/screens/EntryFormScreen.js - With validation
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { loadEntries, saveEntries } from '../storage/entries';
import ScoreButton from '../components/ScoreButton';
import { colors, spacing, shadows } from '../styles/theme';
import { formatDisplayDate } from '../utils/date';

export default function EntryFormScreen({ navigation, route }) {
  const editDate = route?.params?.date;
  const [date, setDate] = useState(editDate || new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [exercise, setExercise] = useState('');
  const [diet, setDiet] = useState('');
  const [recovery, setRecovery] = useState('');
  const [score, setScore] = useState('0');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { loadExistingEntry(); }, [editDate]);

  async function loadExistingEntry() {
    try {
      if (editDate) {
        const entries = await loadEntries();
        const entry = entries.find(e => e.date === editDate);
        if (entry) {
          setWeight(entry.weight || '');
          setExercise(entry.exercise || '');
          setDiet(entry.diet || '');
          setRecovery(entry.recovery || '');
          setScore(entry.score.toString());
          setComments(entry.comments || '');
        }
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Failed to load entry data.');
    } finally {
      setLoading(false);
    }
  }

  // Validate weight input
  function validateWeight(value) {
    if (!value) return null; // Empty is okay
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Weight must be a number';
    }
    if (num <= 0) {
      return 'Weight must be greater than 0';
    }
    if (num > 1000) {
      return 'Weight seems unrealistic (max 1000 lbs)';
    }
    return null;
  }

  // Validate text length
  function validateTextLength(value, fieldName, maxLength = 1000) {
    if (!value) return null;
    
    if (value.length > maxLength) {
      return `${fieldName} is too long (max ${maxLength} characters)`;
    }
    return null;
  }

  // Handle weight change with validation
  function handleWeightChange(value) {
    setWeight(value);
    const error = validateWeight(value);
    setErrors(prev => ({ ...prev, weight: error }));
  }

  // Handle text field changes with validation
  function handleTextChange(field, value, maxLength = 1000) {
    const fieldSetters = {
      exercise: setExercise,
      diet: setDiet,
      recovery: setRecovery,
      comments: setComments,
    };
    
    fieldSetters[field](value);
    const error = validateTextLength(value, field, maxLength);
    setErrors(prev => ({ ...prev, [field]: error }));
  }

  // Validate all fields before saving
  function validateForm() {
    const newErrors = {};
    
    // Check if at least one field is filled
    if (!weight && !exercise && !diet && !recovery) {
      return { valid: false, message: 'Please fill in at least one field' };
    }
    
    // Validate weight
    if (weight) {
      const weightError = validateWeight(weight);
      if (weightError) {
        newErrors.weight = weightError;
      }
    }
    
    // Validate text fields
    ['exercise', 'diet', 'recovery', 'comments'].forEach(field => {
      const value = { exercise, diet, recovery, comments }[field];
      if (value) {
        const error = validateTextLength(value, field);
        if (error) newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return { valid: false, message: 'Please fix the errors before saving' };
    }
    
    return { valid: true };
  }

  async function handleSave() {
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }
    
    setIsSaving(true);
    try {
      const entries = await loadEntries();
      const entry = {
        date,
        weight: weight.trim(),
        exercise: exercise.trim(),
        diet: diet.trim(),
        recovery: recovery.trim(),
        score: parseInt(score) || 0,
        comments: comments.trim(),
        timestamp: new Date().toISOString(),
      };
      
      const existingIndex = entries.findIndex(e => e.date === date);
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      const result = await saveEntries(entries);
      
      if (result.success === false) {
        Alert.alert('Save Failed', result.error || 'Failed to save entry');
        return;
      }

      Alert.alert('Success', 'Entry saved!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.indigo} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.header}>Log Your Day</Text>
            <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={[styles.input, errors.weight && styles.inputError]}
                value={weight}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                placeholder="165.5"
                placeholderTextColor="#999"
                returnKeyType="done"
              />
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Exercise</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.exercise && styles.inputError]}
                value={exercise}
                onChangeText={(value) => handleTextChange('exercise', value, 500)}
                multiline numberOfLines={3}
                placeholder="100 pushups, 20 min bike..." 
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
              {errors.exercise && (
                <Text style={styles.errorText}>{errors.exercise}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Diet</Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge, errors.diet && styles.inputError]}
                value={diet}
                onChangeText={(value) => handleTextChange('diet', value, 1000)}
                multiline numberOfLines={5}
                placeholder="Oatmeal, chicken salad, protein shake..." 
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
              {errors.diet && (
                <Text style={styles.errorText}>{errors.diet}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Recovery</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.recovery && styles.inputError]}
                value={recovery}
                onChangeText={(value) => handleTextChange('recovery', value, 500)}
                multiline numberOfLines={3}
                placeholder="Stretch, ice, breathing..." 
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
              {errors.recovery && (
                <Text style={styles.errorText}>{errors.recovery}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.labelLarge}>Body Vibe Score</Text>
              <Text style={styles.scoreSubtext}>How do you feel today?</Text>
              <View style={styles.scoreContainer}>
                {[-2, -1, 0, 1, 2].map(v => (
                  <ScoreButton
                    key={v}
                    value={v}
                    currentScore={score}
                    onSelect={setScore}
                    styles={styles}
                  />
                ))}
              </View>
              <View style={styles.scoreLegend}>
                <Text style={styles.legendText}>Rough Day</Text>
                <Text style={styles.legendText}>Amazing</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Comments</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.comments && styles.inputError]}
                value={comments}
                onChangeText={(value) => handleTextChange('comments', value, 500)}
                multiline numberOfLines={3}
                placeholder="Any notes about today..." 
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
              {errors.comments && (
                <Text style={styles.errorText}>{errors.comments}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Entry</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  formContainer: { padding: spacing.lg },
  header: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  dateText: { fontSize: 16, color: '#666', marginBottom: 24 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  labelLarge: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  scoreSubtext: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    color: '#333' 
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  textAreaLarge: { minHeight: 140, textAlignVertical: 'top' },
  scoreContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scoreButton: { flex: 1, paddingVertical: 16, marginHorizontal: 4, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e0e0e0', alignItems: 'center' },
  scoreButtonActive: { borderColor: colors.indigo, backgroundColor: colors.indigo },
  scoreButtonNegative: { borderColor: '#ffcdd2' },
  scoreButtonPositive: { borderColor: '#c8e6c9' },
  scoreButtonText: { fontSize: 20, fontWeight: 'bold', color: '#666' },
  scoreButtonTextActive: { color: '#fff' },
  scoreLegend: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  legendText: { fontSize: 12, color: '#999' },
  saveButton: { backgroundColor: colors.indigo, borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 8, ...shadows.cardStrong },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});