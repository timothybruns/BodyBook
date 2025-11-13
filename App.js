// App.js - Complete Body Book App with AsyncStorage and improvements

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

const Stack = createStackNavigator();
const STORAGE_KEY = '@body_book_entries';

// Data persistence functions
const saveEntries = async (entries) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries:', error);
    Alert.alert('Error', 'Failed to save entry');
  }
};

const loadEntries = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading entries:', error);
    return [];
  }
};

// Entry Form Screen with improved UX
function EntryFormScreen({ navigation, route }) {
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

  useEffect(() => {
    loadExistingEntry();
  }, [editDate]);

  const loadExistingEntry = async () => {
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
  };

  const handleSave = async () => {
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
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      // Sort entries by date (newest first)
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));

      await saveEntries(entries);

      Alert.alert('Success', 'Entry saved!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const ScoreButton = ({ value }) => (
    <TouchableOpacity
      style={[
        styles.scoreButton,
        score === value.toString() && styles.scoreButtonActive,
        value < 0 && styles.scoreButtonNegative,
        value > 0 && styles.scoreButtonPositive,
      ]}
      onPress={() => setScore(value.toString())}
    >
      <Text style={[
        styles.scoreButtonText,
        score === value.toString() && styles.scoreButtonTextActive
      ]}>
        {value > 0 ? '+' : ''}{value}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
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
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                multiline
                numberOfLines={3}
                placeholder="100 pushups, 20 min bike..."
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Diet</Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge]}
                value={diet}
                onChangeText={setDiet}
                multiline
                numberOfLines={5}
                placeholder="Oatmeal, chicken salad, protein shake..."
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Recovery</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recovery}
                onChangeText={setRecovery}
                multiline
                numberOfLines={3}
                placeholder="Stretch, ice, WHM..."
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.labelLarge}>Body Vibe Score</Text>
              <Text style={styles.scoreSubtext}>How do you feel today?</Text>
              <View style={styles.scoreContainer}>
                <ScoreButton value={-2} />
                <ScoreButton value={-1} />
                <ScoreButton value={0} />
                <ScoreButton value={1} />
                <ScoreButton value={2} />
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
                multiline
                numberOfLines={3}
                placeholder="Any notes about today..."
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
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

            {/* Extra padding at bottom for keyboard */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Dashboard Screen with charts and analytics
function DashboardScreen({ navigation }) {
  const [timeRange, setTimeRange] = useState('7');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgScore: 0,
    avgWeight: 0,
    totalEntries: 0,
    scoreBreakdown: { negative: 0, neutral: 0, positive: 0 },
    recentTrend: 'stable',
    weightChange: 0,
  });

  useEffect(() => {
    loadData();
    
    // Refresh data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    calculateStats();
  }, [timeRange, entries]);

  const loadData = async () => {
    setLoading(true);
    const loadedEntries = await loadEntries();
    setEntries(loadedEntries);
    setLoading(false);
  };

  const calculateStats = () => {
    if (entries.length === 0) {
      return;
    }

    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEntries = entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= cutoffDate;
    });

    if (recentEntries.length === 0) {
      return;
    }

    // Calculate average score
    const totalScore = recentEntries.reduce((sum, e) => sum + e.score, 0);
    const avgScore = totalScore / recentEntries.length;

    // Calculate average weight
    const weightsWithValues = recentEntries.filter(e => e.weight);
    const totalWeight = weightsWithValues.reduce((sum, e) => sum + parseFloat(e.weight), 0);
    const avgWeight = weightsWithValues.length > 0 
      ? totalWeight / weightsWithValues.length
      : 0;

    // Calculate weight change
    let weightChange = 0;
    if (weightsWithValues.length >= 2) {
      const firstWeight = parseFloat(weightsWithValues[weightsWithValues.length - 1].weight);
      const lastWeight = parseFloat(weightsWithValues[0].weight);
      weightChange = lastWeight - firstWeight;
    }

    // Score breakdown
    const scoreBreakdown = recentEntries.reduce((acc, e) => {
      if (e.score < 0) acc.negative++;
      else if (e.score === 0) acc.neutral++;
      else acc.positive++;
      return acc;
    }, { negative: 0, neutral: 0, positive: 0 });

    // Calculate recent trend (last 3 days vs previous 3 days)
    let recentTrend = 'stable';
    if (recentEntries.length >= 6) {
      const last3 = recentEntries.slice(0, 3);
      const prev3 = recentEntries.slice(3, 6);
      const last3Avg = last3.reduce((sum, e) => sum + e.score, 0) / 3;
      const prev3Avg = prev3.reduce((sum, e) => sum + e.score, 0) / 3;
      
      if (last3Avg > prev3Avg + 0.3) recentTrend = 'improving';
      else if (last3Avg < prev3Avg - 0.3) recentTrend = 'declining';
    }

    setStats({
      avgScore: avgScore.toFixed(2),
      avgWeight: avgWeight > 0 ? avgWeight.toFixed(1) : 'N/A',
      totalEntries: recentEntries.length,
      scoreBreakdown,
      recentTrend,
      weightChange: weightChange.toFixed(1),
    });
  };

  const TimeRangeButton = ({ value, label }) => (
    <TouchableOpacity
      style={[styles.rangeButton, timeRange === value && styles.rangeButtonActive]}
      onPress={() => setTimeRange(value)}
    >
      <Text style={[styles.rangeButtonText, timeRange === value && styles.rangeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 0.75) return '#10b981';
    if (numScore >= 0.25) return '#84cc16';
    if (numScore >= -0.25) return '#FFC107';
    if (numScore >= -0.75) return '#f97316';
    return '#ef4444';
  };

  const getScoreEmoji = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 1) return '🔥';
    if (numScore >= 0.5) return '😊';
    if (numScore >= 0) return '😐';
    if (numScore >= -0.5) return '😕';
    return '😫';
  };

  const getTrendEmoji = (trend) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  const deleteEntry = async (date) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = entries.filter(e => e.date !== date);
            await saveEntries(updatedEntries);
            setEntries(updatedEntries);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dashboardContainer}>
          <Text style={styles.dashboardHeader}>Your Body Book</Text>
          
          <View style={styles.rangeSelector}>
            <TimeRangeButton value="7" label="7 Days" />
            <TimeRangeButton value="14" label="2 Weeks" />
            <TimeRangeButton value="30" label="Month" />
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📝</Text>
              <Text style={styles.emptyStateText}>No entries yet</Text>
              <Text style={styles.emptyStateSubtext}>Start logging your days!</Text>
            </View>
          ) : (
            <>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreCardLabel}>Body Vibe Score</Text>
                <View style={styles.scoreDisplay}>
                  <Text style={[styles.scoreValue, { color: getScoreColor(stats.avgScore) }]}>
                    {stats.avgScore > 0 ? '+' : ''}{stats.avgScore}
                  </Text>
                  <Text style={styles.scoreEmoji}>{getScoreEmoji(stats.avgScore)}</Text>
                </View>
                <View style={styles.trendContainer}>
                  <Text style={styles.trendEmoji}>{getTrendEmoji(stats.recentTrend)}</Text>
                  <Text style={styles.trendText}>
                    {stats.recentTrend.charAt(0).toUpperCase() + stats.recentTrend.slice(1)}
                  </Text>
                </View>
                <Text style={styles.scoreSubtext}>
                  Based on {stats.totalEntries} {stats.totalEntries === 1 ? 'entry' : 'entries'}
                </Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.avgWeight}</Text>
                  <Text style={styles.statLabel}>Avg Weight</Text>
                  {stats.weightChange != 0 && (
                    <Text style={[
                      styles.changeText,
                      { color: parseFloat(stats.weightChange) < 0 ? '#10b981' : '#ef4444' }
                    ]}>
                      {parseFloat(stats.weightChange) > 0 ? '+' : ''}{stats.weightChange} lbs
                    </Text>
                  )}
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalEntries}</Text>
                  <Text style={styles.statLabel}>Days Logged</Text>
                  <Text style={styles.changeText}>
                    {((stats.totalEntries / parseInt(timeRange)) * 100).toFixed(0)}% complete
                  </Text>
                </View>
              </View>

              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownTitle}>Score Breakdown</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>💚 Positive Days</Text>
                  <Text style={styles.breakdownValue}>{stats.scoreBreakdown.positive}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>😐 Neutral Days</Text>
                  <Text style={styles.breakdownValue}>{stats.scoreBreakdown.neutral}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>❤️‍🩹 Negative Days</Text>
                  <Text style={styles.breakdownValue}>{stats.scoreBreakdown.negative}</Text>
                </View>
              </View>

              <View style={styles.recentHeaderContainer}>
                <Text style={styles.recentHeader}>Recent Entries</Text>
                <Text style={styles.recentSubheader}>Tap to edit</Text>
              </View>
              
              {entries.slice(0, 10).map((entry, index) => (
                <TouchableOpacity
                  key={entry.date}
                  style={styles.entryCard}
                  onPress={() => navigation.navigate('Entry', { date: entry.date })}
                  onLongPress={() => deleteEntry(entry.date)}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                    <View style={[
                      styles.scoreBadge,
                      { backgroundColor: getScoreColor(entry.score) }
                    ]}>
                      <Text style={styles.scoreBadgeText}>
                        {entry.score > 0 ? '+' : ''}{entry.score}
                      </Text>
                    </View>
                  </View>
                  {entry.weight && (
                    <Text style={styles.entryDetail}>⚖️ {entry.weight} lbs</Text>
                  )}
                  {entry.exercise && (
                    <Text style={styles.entryDetail} numberOfLines={1}>
                      💪 {entry.exercise}
                    </Text>
                  )}
                  {entry.comments && (
                    <Text style={styles.entryComment} numberOfLines={2}>
                      💭 {entry.comments}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}

          <TouchableOpacity
            style={styles.newEntryButton}
            onPress={() => navigation.navigate('Entry')}
          >
            <Text style={styles.newEntryButtonText}>+ New Entry</Text>
          </TouchableOpacity>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Body Book' }}
        />
        <Stack.Screen 
          name="Entry" 
          component={EntryFormScreen}
          options={{ title: 'Log Entry' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  dashboardContainer: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dashboardHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreButton: {
    flex: 1,
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  scoreButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  scoreButtonNegative: {
    borderColor: '#ffcdd2',
  },
  scoreButtonPositive: {
    borderColor: '#c8e6c9',
  },
  scoreButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  scoreButtonTextActive: {
    color: '#fff',
  },
  scoreLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rangeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: '#6366f1',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreCardLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    marginRight: 12,
  },
  scoreEmoji: {
    fontSize: 48,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  trendText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  breakdownLabel: {
    fontSize: 15,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  recentHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  recentSubheader: {
    fontSize: 12,
    color: '#999',
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  entryDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  entryComment: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  }, 
    // Missing from New (copied from Old)
  entryScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newEntryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  newEntryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
  },
});   



