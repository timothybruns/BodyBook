// src/screens/EntryFormScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { loadEntries, saveEntries } from '../storage/entries';
import ScoreButton from '../components/ScoreButton';
import { colors, spacing, shadows } from '../styles/theme';

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

  useEffect(() => { loadExistingEntry(); }, [editDate]);

  async function loadExistingEntry() {
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
    setLoading(false);
  }

  async function handleSave() {
    if (!weight && !exercise && !diet && !recovery) {
      Alert.alert('Empty Entry', 'Please fill in at least one field');
      return;
    }
    setIsSaving(true);
    try {
      const entries = await loadEntries();
      const entry = {
        date,
        weight,
        exercise,
        diet,
        recovery,
        score: parseInt(score) || 0,
        comments,
        timestamp: new Date().toISOString(),
      };
      const existingIndex = entries.findIndex(e => e.date === date);
      if (existingIndex >= 0) entries[existingIndex] = entry;
      else entries.push(entry);

      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      await saveEntries(entries);

      Alert.alert('Success', 'Entry saved!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
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
            <Text style={styles.dateText}>{date}</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="165.5"
                placeholderTextColor="#999"
                returnKeyType="done"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Exercise</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={exercise}
                onChangeText={setExercise}
                multiline numberOfLines={3}
                placeholder="100 pushups, 20 min bike..." placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Diet</Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge]}
                value={diet}
                onChangeText={setDiet}
                multiline numberOfLines={5}
                placeholder="Oatmeal, chicken salad, protein shake..." placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Recovery</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recovery}
                onChangeText={setRecovery}
                multiline numberOfLines={3}
                placeholder="Stretch, ice, breathing..." placeholderTextColor="#999"
                textAlignVertical="top"
              />
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
                style={[styles.input, styles.textArea]}
                value={comments}
                onChangeText={setComments}
                multiline numberOfLines={3}
                placeholder="Any notes about today..." placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Entry</Text>}
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // keep your existing styles for form and shared bits
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
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0', color: '#333' },
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
