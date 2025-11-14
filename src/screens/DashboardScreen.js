// src/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { loadEntries, saveEntries } from '../storage/entries';
import TimeRangeButton from '../components/TimeRangeButton';
import EntryCard from '../components/EntryCard';
import { colors, spacing, shadows } from '../styles/theme';

export default function DashboardScreen({ navigation }) {
  const [timeRange, setTimeRange] = useState('7');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgScore: 0, avgWeight: 0, totalEntries: 0,
    scoreBreakdown: { negative: 0, neutral: 0, positive: 0 },
    recentTrend: 'stable', weightChange: 0,
  });

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  useEffect(() => { calculateStats(); }, [timeRange, entries]);

  async function loadData() {
    setLoading(true);
    const loaded = await loadEntries();
    setEntries(loaded);
    setLoading(false);
  }

  function calculateStats() {
    if (entries.length === 0) return;

    const days = parseInt(timeRange);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);

    const recent = entries.filter(e => new Date(e.date) >= cutoff);
    if (recent.length === 0) return;

    const totalScore = recent.reduce((s, e) => s + e.score, 0);
    const avgScore = totalScore / recent.length;

    const withWeight = recent.filter(e => e.weight);
    const totalWeight = withWeight.reduce((s, e) => s + parseFloat(e.weight), 0);
    const avgWeight = withWeight.length ? totalWeight / withWeight.length : 0;

    let weightChange = 0;
    if (withWeight.length >= 2) {
      const first = parseFloat(withWeight[withWeight.length - 1].weight);
      const last = parseFloat(withWeight[0].weight);
      weightChange = last - first;
    }

    const scoreBreakdown = recent.reduce((acc, e) => {
      if (e.score < 0) acc.negative++;
      else if (e.score === 0) acc.neutral++;
      else acc.positive++;
      return acc;
    }, { negative: 0, neutral: 0, positive: 0 });

    let recentTrend = 'stable';
    if (recent.length >= 6) {
      const last3 = recent.slice(0, 3);
      const prev3 = recent.slice(3, 6);
      const last3Avg = last3.reduce((s, e) => s + e.score, 0) / 3;
      const prev3Avg = prev3.reduce((s, e) => s + e.score, 0) / 3;
      if (last3Avg > prev3Avg + 0.3) recentTrend = 'improving';
      else if (last3Avg < prev3Avg - 0.3) recentTrend = 'declining';
    }

    setStats({
      avgScore: avgScore.toFixed(2),
      avgWeight: avgWeight > 0 ? avgWeight.toFixed(1) : 'N/A',
      totalEntries: recent.length,
      scoreBreakdown,
      recentTrend,
      weightChange: weightChange.toFixed(1),
    });
  }

  const getScoreColor = (score) => {
    const n = parseFloat(score);
    if (n >= 0.75) return '#10b981';
    if (n >= 0.25) return '#84cc16';
    if (n >= -0.25) return '#FFC107';
    if (n >= -0.75) return '#f97316';
    return '#ef4444';
  };

  const getScoreEmoji = (s) => {
    const n = parseFloat(s);
    if (n >= 1) return '🔥';
    if (n >= 0.5) return '😊';
    if (n >= 0) return '😐';
    if (n >= -0.5) return '😕';
    return '😫';
  };

  const getTrendEmoji = (t) => (t === 'improving' ? '📈' : t === 'declining' ? '📉' : '➡️');

  const deleteEntry = async (date) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = entries.filter(e => e.date !== date);
          await saveEntries(updated);
          setEntries(updated);
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.indigo} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.dashboardContainer}>
          <Text style={styles.dashboardHeader}>Your Body Book</Text>

          <View style={styles.rangeSelector}>
            <TimeRangeButton value="7"  label="7 Days" current={timeRange} onPress={setTimeRange} styles={styles} />
            <TimeRangeButton value="14" label="2 Weeks" current={timeRange} onPress={setTimeRange} styles={styles} />
            <TimeRangeButton value="30" label="Month"   current={timeRange} onPress={setTimeRange} styles={styles} />
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

              <View style={styles.recentHeaderContainer}>
                <Text style={styles.recentHeader}>Recent Entries</Text>
                <Text style={styles.recentSubheader}>Tap to edit</Text>
              </View>

              {entries.slice(0, 10).map((entry) => (
                <EntryCard
                  key={entry.date}
                  entry={entry}
                  getScoreColor={getScoreColor}
                  styles={styles}
                  onPress={() => navigation.navigate('Entry', { date: entry.date })}
                  onLongPress={() => deleteEntry(entry.date)}
                />
              ))}
            </>
          )}

          <TouchableOpacity
            style={styles.newEntryButton}
            onPress={() => navigation.navigate('Entry')}
          >
            <Text style={styles.newEntryButtonText}>+ New Entry</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  dashboardContainer: { padding: spacing.lg },
  dashboardHeader: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  rangeSelector: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#fff', borderRadius: 12, padding: 4, ...shadows.card },
  rangeButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  rangeButtonActive: { backgroundColor: colors.indigo },
  rangeButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  rangeButtonTextActive: { color: '#fff' },
  scoreCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center', ...shadows.cardLg },
  scoreCardLabel: { fontSize: 16, color: '#666', marginBottom: 12 },
  scoreDisplay: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scoreValue: { fontSize: 56, fontWeight: 'bold', marginRight: 12 },
  scoreEmoji: { fontSize: 48 },
  trendContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  trendEmoji: { fontSize: 20, marginRight: 8 },
  trendText: { fontSize: 14, color: '#666', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', ...shadows.card },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  changeText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  recentHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recentHeader: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  recentSubheader: { fontSize: 12, color: '#999' },
  entryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, ...shadows.card },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entryDate: { fontSize: 16, fontWeight: '600', color: '#333' },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  scoreBadgeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  entryDetail: { fontSize: 14, color: '#666', marginBottom: 4 },
  entryComment: { fontSize: 14, color: '#888', fontStyle: 'italic', marginTop: 4 },
  newEntryButton: { backgroundColor: colors.indigo, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  newEntryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // keep other shared styles you already had if needed
});
