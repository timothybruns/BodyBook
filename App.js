import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';

const Stack = createStackNavigator();

// Simulated storage (In real app, use AsyncStorage)
let entriesStore = [];

// Entry Form Screen
function EntryFormScreen({ navigation, route }) {
  const editDate = route?.params?.date;
  const [date, setDate] = useState(editDate || new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [exercise, setExercise] = useState('');
  const [diet, setDiet] = useState('');
  const [recovery, setRecovery] = useState('');
  const [score, setScore] = useState('0');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (editDate) {
      const entry = entriesStore.find(e => e.date === editDate);
      if (entry) {
        setWeight(entry.weight);
        setExercise(entry.exercise);
        setDiet(entry.diet);
        setRecovery(entry.recovery);
        setScore(entry.score.toString());
        setComments(entry.comments);
      }
    }
  }, [editDate]);

  const handleSave = () => {
    if (!weight && !exercise && !diet) {
      Alert.alert('Error', 'Please fill in at least one field');
      return;
    }

    const entry = {
      date,
      weight,
      exercise,
      diet,
      recovery,
      score: parseInt(score) || 0,
      comments,
    };

    const existingIndex = entriesStore.findIndex(e => e.date === date);
    if (existingIndex >= 0) {
      entriesStore[existingIndex] = entry;
    } else {
      entriesStore.push(entry);
    }

    Alert.alert('Success', 'Entry saved!', [
      { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
    ]);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Diet</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={diet}
              onChangeText={setDiet}
              multiline
              numberOfLines={4}
              placeholder="Oatmeal, chicken salad..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Recovery</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={recovery}
              onChangeText={setRecovery}
              multiline
              numberOfLines={2}
              placeholder="Stretch, ice, WHM..."
              placeholderTextColor="#999"
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
              <Text style={styles.legendText}>Rough</Text>
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
              numberOfLines={2}
              placeholder="Any notes about today..."
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Dashboard Screen
function DashboardScreen({ navigation }) {
  const [timeRange, setTimeRange] = useState('7');
  const [stats, setStats] = useState({
    avgScore: 0,
    avgWeight: 0,
    totalEntries: 0,
    scoreBreakdown: { negative: 0, neutral: 0, positive: 0 }
  });

  useEffect(() => {
    calculateStats();
  }, [timeRange]);

  const calculateStats = () => {
    if (entriesStore.length === 0) {
      return;
    }

    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEntries = entriesStore.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= cutoffDate;
    });

    if (recentEntries.length === 0) {
      return;
    }

    const totalScore = recentEntries.reduce((sum, e) => sum + e.score, 0);
    const weightsWithValues = recentEntries.filter(e => e.weight);
    const totalWeight = weightsWithValues.reduce((sum, e) => sum + parseFloat(e.weight), 0);

    const scoreBreakdown = recentEntries.reduce((acc, e) => {
      if (e.score < 0) acc.negative++;
      else if (e.score === 0) acc.neutral++;
      else acc.positive++;
      return acc;
    }, { negative: 0, neutral: 0, positive: 0 });

    setStats({
      avgScore: (totalScore / recentEntries.length).toFixed(2),
      avgWeight: weightsWithValues.length > 0 
        ? (totalWeight / weightsWithValues.length).toFixed(1) 
        : 'N/A',
      totalEntries: recentEntries.length,
      scoreBreakdown
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
    if (numScore >= 0.5) return '#4CAF50';
    if (numScore >= 0) return '#FFC107';
    return '#F44336';
  };

  const getScoreEmoji = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 1) return '🔥';
    if (numScore >= 0.5) return '😊';
    if (numScore >= 0) return '😐';
    if (numScore >= -0.5) return '😕';
    return '😫';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.dashboardContainer}>
          <Text style={styles.dashboardHeader}>Your Body Book</Text>
          
          <View style={styles.rangeSelector}>
            <TimeRangeButton value="7" label="7 Days" />
            <TimeRangeButton value="14" label="2 Weeks" />
            <TimeRangeButton value="30" label="Month" />
          </View>

          {entriesStore.length === 0 ? (
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
                <Text style={styles.scoreSubtext}>
                  Based on {stats.totalEntries} {stats.totalEntries === 1 ? 'entry' : 'entries'}
                </Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.avgWeight}</Text>
                  <Text style={styles.statLabel}>Avg Weight</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalEntries}</Text>
                  <Text style={styles.statLabel}>Days Logged</Text>
                </View>
              </View>

              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownTitle}>Score Breakdown</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>💚 Positive</Text>
                  <Text style={styles.breakdownValue}>{stats.scoreBreakdown.positive}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>😐 Neutral</Text>
                  <Text style={styles.breakdownValue}>{stats.scoreBreakdown.neutral}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>❤️‍🩹 Negative</Text>
                  <Text style={styles.breakdownValue}>{stats.scoreBreakdown.negative}</Text>
                </View>
              </View>

              <Text style={styles.recentHeader}>Recent Entries</Text>
              {entriesStore.slice(-5).reverse().map((entry, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.entryCard}
                  onPress={() => navigation.navigate('Entry', { date: entry.date })}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                    <Text style={[
                      styles.entryScore,
                      { color: getScoreColor(entry.score) }
                    ]}>
                      {entry.score > 0 ? '+' : ''}{entry.score}
                    </Text>
                  </View>
                  {entry.weight && (
                    <Text style={styles.entryDetail}>Weight: {entry.weight} lbs</Text>
                  )}
                  {entry.comments && (
                    <Text style={styles.entryComment} numberOfLines={2}>
                      {entry.comments}
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
  scrollView: {
    flex: 1,
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
    minHeight: 80,
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
    marginBottom: 40,
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
  recentHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  entryScore: {
    fontSize: 20,
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