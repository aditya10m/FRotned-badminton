import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FadeIn } from '../../components/animation/FadeIn';
import { LineChart } from '../../components/charts/LineChart';
import { Card } from '../../components/ui/Card';
import theme from '../../constants/theme';
import { progressService, ProgressSnapshotItem } from '../../services/progress';
import { TrendingUp, ArrowUpRight, Award, Calendar, Activity } from 'lucide-react-native';

const FALLBACK_PERIODS: Record<string, { data: { date: string; value: number }[]; current: number; improvement: string }> = {
  '7d': {
    data: [
      { date: 'Mon', value: 78 },
      { date: 'Wed', value: 80 },
      { date: 'Fri', value: 81 },
      { date: 'Sun', value: 84 },
    ],
    current: 84,
    improvement: '+7.6%',
  },
  '30d': {
    data: [
      { date: 'W1', value: 68 },
      { date: 'W2', value: 72 },
      { date: 'W3', value: 78 },
      { date: 'W4', value: 84 },
    ],
    current: 84,
    improvement: '+23.5%',
  },
  '90d': {
    data: [
      { date: 'Jun', value: 58 },
      { date: 'Jul', value: 66 },
      { date: 'Aug', value: 75 },
      { date: 'Sep', value: 84 },
    ],
    current: 84,
    improvement: '+44.8%',
  },
  'All': {
    data: [
      { date: 'Aug 24', value: 56 },
      { date: 'Aug 31', value: 60 },
      { date: 'Sep 07', value: 67 },
      { date: 'Sep 14', value: 73 },
      { date: 'Sep 21', value: 84 },
    ],
    current: 84,
    improvement: '+50.0%',
  },
};

export default function Progress() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'All'>('30d');
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<ProgressSnapshotItem[]>([]);

  const periods: ('7d' | '30d' | '90d' | 'All')[] = ['7d', '30d', '90d', 'All'];

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const queryPeriod = period === 'All' ? 'all' : (period.toLowerCase() as any);
        const data = await progressService.getProgress(queryPeriod);
        if (isMounted && data && data.length > 0) {
          setSnapshots(data);
        }
      } catch (err) {
        console.warn('Progress load fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [period]);

  // Transform snapshots into line chart format or fallback
  const fallback = FALLBACK_PERIODS[period];
  let chartData = fallback.data;
  let currentScore = fallback.current;
  let improvementRate = fallback.improvement;

  if (snapshots.length >= 2) {
    chartData = snapshots.map((s) => {
      const d = new Date(s.date);
      const label = isNaN(d.getTime())
        ? s.date.substring(5, 10)
        : `${d.getMonth() + 1}/${d.getDate()}`;
      return {
        date: label,
        value: Math.round(s.overall_score),
      };
    });
    const latest = snapshots[snapshots.length - 1].overall_score;
    const first = snapshots[0].overall_score;
    currentScore = Math.round(latest);
    const diff = latest - first;
    const pct = first > 0 ? Math.round((diff / first) * 100) : 0;
    improvementRate = `${diff >= 0 ? '+' : ''}${pct}%`;
  }

  // Calculate latest category averages
  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const techniqueScore = latestSnapshot ? Math.round(latestSnapshot.technique_score) : 86;
  const movementScore = latestSnapshot ? Math.round(latestSnapshot.movement_score) : 82;
  const serveScore = latestSnapshot ? Math.round(latestSnapshot.serve_score) : 79;
  const consistencyScore = latestSnapshot ? Math.round(latestSnapshot.consistency_score) : 88;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Longitudinal Progress</Text>
          <View style={styles.periodPill}>
            <Calendar size={13} color={theme.colors.primary} />
            <Text style={styles.periodPillText}>{period} View</Text>
          </View>
        </View>

        {/* TIME PERIOD TABS */}
        <View style={styles.tabs}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.tab, period === p && styles.activeTab]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, period === p && styles.activeTabText]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TREND CHART CARD */}
        <FadeIn delay={100}>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Overall Performance Velocity</Text>
                <Text style={styles.chartSubtitle}>Biomechanical accuracy across competitive sessions</Text>
              </View>
              <View style={styles.trendIndicator}>
                <TrendingUp size={16} color={theme.colors.success} />
                <Text style={styles.trendText}>{improvementRate}</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ height: 180 }} />
              ) : (
                <LineChart data={chartData} width={310} height={180} />
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Current Score</Text>
                <Text style={styles.statValue}>{currentScore}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Growth Margin</Text>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                  {improvementRate}
                </Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Data Points</Text>
                <Text style={styles.statValue}>{chartData.length}</Text>
              </View>
            </View>
          </Card>
        </FadeIn>

        {/* SKILL ATTRIBUTE METRICS */}
        <FadeIn delay={200}>
          <Text style={styles.sectionTitle}>Category Trajectory</Text>
          <View style={styles.categoryGrid}>
            <Card style={styles.categoryCard}>
              <Text style={styles.categoryName}>Technique</Text>
              <Text style={styles.categoryScore}>{techniqueScore}</Text>
              <Text style={styles.categoryStatus}>+14% kinetic chain sync</Text>
            </Card>

            <Card style={styles.categoryCard}>
              <Text style={styles.categoryName}>Movement</Text>
              <Text style={styles.categoryScore}>{movementScore}</Text>
              <Text style={styles.categoryStatus}>+18% split-step speed</Text>
            </Card>

            <Card style={styles.categoryCard}>
              <Text style={styles.categoryName}>Smash / Drive</Text>
              <Text style={styles.categoryScore}>{serveScore}</Text>
              <Text style={styles.categoryStatus}>+22% jump smash power</Text>
            </Card>

            <Card style={styles.categoryCard}>
              <Text style={styles.categoryName}>Consistency</Text>
              <Text style={styles.categoryScore}>{consistencyScore}</Text>
              <Text style={styles.categoryStatus}>89% clear depth</Text>
            </Card>
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  header: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: '800',
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
  },
  periodPillText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '800',
  },
  chartCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },
  chartSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  trendText: {
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: theme.spacing.md,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontWeight: '800',
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48.5%',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryScore: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryStatus: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
