// src/screens/EntryFormScreen.js - UPDATED with TagInput
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { loadEntries, saveEntries } from '../storage/entries';
import { loadTags, learnFromEntry } from '../storage/tags';
import ScoreButton from '../components/ScoreButton';
import TagInput from '../components/TagInput';
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
  const [tags, setTags] = useState({ diet: [], exercise: [], recovery: [] });

  useEffect(() => { 
    loadExistingEntry();
    loadTagSuggestions();
  }, [editDate]);

  async function loadTagSuggestions() {
    const loadedTags = await loadTags();
    setTags(loadedTags);
  }

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

  function validateWeight(value) {
    if (!value) return null;
    
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

  function validateTextLength(value, fieldName, maxLength = 1000) {
    if (!value) return null;
    
    if (value.length > maxLength) {
      return `${fieldName} is too long (max ${maxLength} characters)`;
    }
    return null;
  }

  function handleWeightChange(value) {
    setWeight(value);
    const error = validateWeight(value);
    setErrors(prev => ({ ...prev, weight: error }));
  }

  function handleTagFieldChange(field, value) {
    const fieldSetters = {
      exercise: setExercise,
      diet: setDiet,
      recovery: setRecovery,
    };
    
    fieldSetters[field](value);
    const error = validateTextLength(value, field, 1000);
    setErrors(prev => ({ ...prev, [field]: error }));
  }

  function handleTextChange(field, value, maxLength = 1000) {
    setComments(value);
    const error = validateTextLength(value, field, maxLength);
    setErrors(prev => ({ ...prev, [field]: error }));
  }

  function validateForm() {
    const newErrors = {};
    
    if (!weight && !exercise && !diet && !recovery) {
      return { valid: false, message: 'Please fill in at least one field' };
    }
    
    if (weight) {
      const weightError = validateWeight(weight);
      if (weightError) {
        newErrors.weight = weightError;
      }
    }
    
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
      
      // Learn new tags from this entry
      await learnFromEntry(entry);
      
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
        <ActivityIndicator size="large" color={colors.primary} />
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
                placeholderTextColor="#636366"
                returnKeyType="done"
              />
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight}</Text>
              )}
            </View>

            <TagInput
              label="Exercise"
              value={exercise}
              onChange={(value) => handleTagFieldChange('exercise', value)}
              placeholder="Add exercises..."
              suggestions={tags.exercise || []}
              error={errors.exercise}
            />

            <TagInput
              label="Diet"
              value={diet}
              onChange={(value) => handleTagFieldChange('diet', value)}
              placeholder="Add foods and drinks..."
              suggestions={tags.diet || []}
              error={errors.diet}
            />

            <TagInput
              label="Recovery"
              value={recovery}
              onChange={(value) => handleTagFieldChange('recovery', value)}
              placeholder="Add recovery activities..."
              suggestions={tags.recovery || []}
              error={errors.recovery}
            />

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
                placeholderTextColor="#636366"
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
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  formContainer: { padding: spacing.lg },
  header: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  dateText: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  labelLarge: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  scoreSubtext: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  input: { 
    backgroundColor: colors.backgroundCard, 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: colors.backgroundLight, 
    color: colors.textPrimary 
  },
  inputError: {
    borderColor: colors.negative,
    borderWidth: 2,
  },
  errorText: {
    color: colors.negative,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  scoreContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scoreButton: { 
    flex: 1, 
    paddingVertical: 16, 
    marginHorizontal: 4, 
    borderRadius: 12, 
    backgroundColor: colors.backgroundCard, 
    borderWidth: 2, 
    borderColor: colors.backgroundLight, 
    alignItems: 'center' 
  },
  scoreButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  scoreButtonNegative: { borderColor: '#ffcdd2' },
  scoreButtonPositive: { borderColor: '#c8e6c9' },
  scoreButtonText: { fontSize: 20, fontWeight: 'bold', color: colors.textSecondary },
  scoreButtonTextActive: { color: colors.textPrimary },
  scoreLegend: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  legendText: { fontSize: 12, color: colors.textTertiary },
  saveButton: { 
    backgroundColor: colors.primary, 
    borderRadius: 12, 
    paddingVertical: 18, 
    alignItems: 'center', 
    marginTop: 8, 
    ...shadows.cardStrong 
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
});