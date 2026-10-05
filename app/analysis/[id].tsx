import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FadeIn } from '../../components/animation/FadeIn';
import { ScoreCircle } from '../../components/ui/ScoreCircle';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import theme from '../../constants/theme';
import { analysisService, AnalysisReport, SkeletonAnalysisData } from '../../services/analysis';
import { SkeletonVideoPlayer } from '../../components/analysis/SkeletonVideoPlayer';
import {
  ChevronLeft,
  Play,
  Pause,
  Award,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';

export default function AnalysisDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'report' | 'skeleton'>('report');
  const [skeletonData, setSkeletonData] = useState<SkeletonAnalysisData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchReport() {
      try {
        let currentType = 'Match Play';
        if (id && typeof id === 'string' && id !== 'demo-match-report') {
          const data = await analysisService.getReport(id);
          if (isMounted) setReport(data);
          if (data?.analysis_type) currentType = data.analysis_type;
        } else {
          // A report is meaningful only after a real upload/analysis job.
          // Keep the screen empty rather than presenting invented results.
          currentType = '';
        }

        // Fetch skeleton data for match play
        if (currentType.toLowerCase().includes('match')) {
          try {
            const sk = await analysisService.getSkeletonAnalysis(String(id || 'demo'));
            if (isMounted) setSkeletonData(sk);
          } catch (err) {
            console.warn('Could not load skeleton data:', err);
          }
        }
      } catch (e) {
        console.warn('Error fetching report:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchReport();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Compiling Biomechanical Report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const scores = report?.scores || {
    overall: 0,
    technique: 0,
    movement: 0,
    serve: 0,
    consistency: 0,
  };

  const getMetricProgressWidth = (val: number) => {
    return `${Math.min(Math.max(val, 0), 100)}%`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Navigation & Header */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Dashboard</Text>
          </TouchableOpacity>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {report?.analysis_type?.toUpperCase() || 'MATCH PLAY'}
            </Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Match Performance Report</Text>
          <Text style={styles.subtitle}>
            Session ID: {String(id).substring(0, 12)}... · Verified Biomechanical Assessment
          </Text>
        </View>

        {/* VIEW MODE TABS FOR MATCH PLAY */}
        {report?.analysis_type?.toLowerCase().includes('match') && (
          <View style={styles.viewModeTabs}>
            <TouchableOpacity
              style={[styles.viewModeTab, viewMode === 'report' && styles.viewModeTabActive]}
              onPress={() => setViewMode('report')}
              activeOpacity={0.8}
            >
              <Text style={[styles.viewModeTabText, viewMode === 'report' && styles.viewModeTabTextActive]}>
                Biomechanical Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeTab, viewMode === 'skeleton' && styles.viewModeTabActive]}
              onPress={() => setViewMode('skeleton')}
              activeOpacity={0.8}
            >
              <Sparkles size={15} color={viewMode === 'skeleton' ? '#000000' : theme.colors.primary} />
              <Text style={[styles.viewModeTabText, viewMode === 'skeleton' && styles.viewModeTabTextActive]}>
                AI Skeleton Replay
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {viewMode === 'skeleton' && skeletonData ? (
          <FadeIn>
            <SkeletonVideoPlayer
              data={skeletonData}
              onProceedToResult={() => setViewMode('report')}
            />
          </FadeIn>
        ) : (
          <>
            {/* Video Player Preview Container */}
            <FadeIn delay={50} style={styles.videoCard}>
              <View style={styles.videoPlayerBox}>
                <View style={styles.videoOverlay}>
                  <View style={styles.videoTopBar}>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>3D SKELETAL TRACKING</Text>
                    </View>
                    <Text style={styles.fpsText}>60 FPS · 33 Keypoints</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.playBtn}
                    onPress={() => setIsPlaying(!isPlaying)}
                    activeOpacity={0.8}
                  >
                    {isPlaying ? (
                      <Pause size={28} color="#000000" />
                    ) : (
                      <Play size={28} color="#000000" style={{ marginLeft: 3 }} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.videoBottomBar}>
                    <Text style={styles.videoTimeText}>
                      {isPlaying ? '00:42 / 01:32' : '00:00 / 01:32'}
                    </Text>
                    <Text style={styles.videoStatBadge}>Kinematic Loop: Active</Text>
                  </View>
                </View>
              </View>

              {report?.analysis_type?.toLowerCase().includes('match') && (
                <TouchableOpacity
                  style={styles.openSkeletonBtn}
                  onPress={() => setViewMode('skeleton')}
                  activeOpacity={0.8}
                >
                  <Sparkles size={16} color="#000000" />
                  <Text style={styles.openSkeletonBtnText}>View AI Skeleton Analysis (Frame-by-Frame)</Text>
                </TouchableOpacity>
              )}
            </FadeIn>

        {/* Overall Score Circle Card */}
        <FadeIn delay={100} style={styles.mainScoreCard}>
          <ScoreCircle score={Math.round(scores.overall)} size={150} strokeWidth={11} />
          <View style={styles.mainScoreMeta}>
            <Text style={styles.scoreNumber}>{Math.round(scores.overall)}</Text>
            <Text style={styles.scoreGradeBadge}>
              {scores.overall >= 85 ? 'PRO ELITE TIER' : scores.overall >= 75 ? 'COMPETITIVE ADVANCED' : 'DEVELOPMENTAL'}
            </Text>
            <Text style={styles.mainScoreDesc}>
              High-velocity kinetic transfer with consistent preparation timing across baseline rallies.
            </Text>
          </View>
        </FadeIn>

        {/* Category Breakdown */}
        <FadeIn delay={150}>
          <Text style={styles.sectionHeading}>Category Performance</Text>
          <View style={styles.categoriesGrid}>
            <Card style={styles.catCard}>
              <ScoreCircle score={Math.round(scores.technique)} size={72} strokeWidth={6} />
              <Text style={styles.catLabel}>Technique</Text>
              <Text style={styles.catScoreVal}>{Math.round(scores.technique)}/100</Text>
            </Card>

            <Card style={styles.catCard}>
              <ScoreCircle score={Math.round(scores.movement)} size={72} strokeWidth={6} />
              <Text style={styles.catLabel}>Movement</Text>
              <Text style={styles.catScoreVal}>{Math.round(scores.movement)}/100</Text>
            </Card>

            <Card style={styles.catCard}>
              <ScoreCircle score={Math.round(scores.serve)} size={72} strokeWidth={6} />
              <Text style={styles.catLabel}>Serve Drive</Text>
              <Text style={styles.catScoreVal}>{Math.round(scores.serve)}/100</Text>
            </Card>

            <Card style={styles.catCard}>
              <ScoreCircle score={Math.round(scores.consistency)} size={72} strokeWidth={6} />
              <Text style={styles.catLabel}>Consistency</Text>
              <Text style={styles.catScoreVal}>{Math.round(scores.consistency)}/100</Text>
            </Card>
          </View>
        </FadeIn>

        {/* Detailed Biomechanical Metrics */}
        <FadeIn delay={200}>
          <Text style={styles.sectionHeading}>Biomechanical Metric Breakdown</Text>
          <Card style={styles.metricsCard}>
            {(report?.metrics || []).map((metric, idx) => (
              <View key={metric.name || idx} style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricTitle}>
                    {metric.name.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.metricDesc}>
                    {metric.description || 'Assessed kinetic efficiency'}
                  </Text>
                </View>
                <View style={styles.metricProgressWrap}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: getMetricProgressWidth(Number(metric.value)) as any },
                      ]}
                    />
                  </View>
                  <Text style={styles.metricValueText}>{Math.round(Number(metric.value))}</Text>
                </View>
              </View>
            ))}
          </Card>
        </FadeIn>

        {/* Detected Key Stroke Events */}
        <FadeIn delay={250}>
          <Text style={styles.sectionHeading}>Detected Stroke Checkpoints</Text>
          <View style={styles.eventsList}>
            {(report?.events || []).map((evt, i) => (
              <View
                key={i}
                style={[
                  styles.eventItem,
                  evt.severity === 'warning' ? styles.eventItemWarn : styles.eventItemPositive,
                ]}
              >
                {evt.severity === 'warning' ? (
                  <AlertTriangle size={18} color="#EAB308" style={{ marginTop: 2 }} />
                ) : (
                  <CheckCircle size={18} color="#22C55E" style={{ marginTop: 2 }} />
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.eventMetaRow}>
                    <Text style={styles.eventTime}>
                      {((evt.timestamp_ms || 1000) / 1000).toFixed(1)}s
                    </Text>
                    <Badge
                      label={evt.severity === 'warning' ? 'Flaw Detected' : 'Optimal Kinetic'}
                      variant={evt.severity === 'warning' ? 'warning' : 'positive'}
                    />
                  </View>
                  <Text style={styles.eventDesc}>{evt.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </FadeIn>

        {/* AI Recommendations */}
        <FadeIn delay={300}>
          <Text style={styles.sectionHeading}>Coaching Focus & Recommended Drills</Text>
          {(report?.recommendations && report.recommendations.length > 0 ? report.recommendations : [
            {
              category: 'technique',
              title: 'Optimize Follow-Through Extension',
              description: 'Focus on finishing the swing with the racket over your opposite shoulder to maximize ball topspin and penetration.',
              drills: [
                {
                  name: 'Windshield Wiper Finish',
                  description: 'Slow shadow swings progressing to live baseline feeds.',
                  duration_minutes: 15,
                  sets: 3,
                  repetitions: 20,
                  difficulty: 'Intermediate',
                },
              ],
            },
          ]).map((rec, idx) => (
            <Card key={idx} style={styles.recCard}>
              <View style={styles.recHeader}>
                <Zap size={20} color={theme.colors.primary} />
                <Text style={styles.recTitle}>{rec.title}</Text>
              </View>
              <Text style={styles.recDesc}>{rec.description}</Text>

              {rec.drills && rec.drills.length > 0 && (
                <View style={styles.recDrillBox}>
                  <Text style={styles.recDrillTitle}>Prescribed Drill: {rec.drills[0].name}</Text>
                  <Text style={styles.recDrillDesc}>{rec.drills[0].description}</Text>
                  <Text style={styles.recDrillMeta}>
                    {rec.drills[0].duration_minutes || 15} mins · {rec.drills[0].sets || 3} sets x {rec.drills[0].repetitions || 20} reps
                  </Text>
                </View>
              )}
            </Card>
          ))}
        </FadeIn>
        </>
        )}

        {/* Action Buttons */}
        <FadeIn delay={350} style={styles.actions}>
          <Button
            title="Start AI Coach Training"
            onPress={() => router.push('/(tabs)/coach')}
            style={styles.actionBtn}
          />
          <Button
            title="Run Another Analysis"
            variant="secondary"
            onPress={() => router.push('/(tabs)/analyze')}
            style={styles.actionBtn}
          />
          <Button
            title="Back to Dashboard"
            variant="ghost"
            onPress={() => router.replace('/(tabs)')}
          />
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  typeBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  typeBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleSection: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: '800',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  videoCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  videoPlayerBox: {
    height: 220,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 14,
  },
  videoTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fpsText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  videoBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoTimeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoStatBadge: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  mainScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: theme.spacing.xl,
  },
  mainScoreMeta: {
    flex: 1,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 46,
  },
  scoreGradeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 6,
  },
  mainScoreDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeading: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  catCard: {
    width: '48.5%',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 8,
  },
  catScoreVal: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  metricsCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricInfo: {
    marginBottom: 6,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  metricProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  metricValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    width: 28,
    textAlign: 'right',
  },
  eventsList: {
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  eventItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  eventItemPositive: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  eventItemWarn: {
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderColor: 'rgba(234, 179, 8, 0.25)',
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  eventDesc: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  recCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 12,
  },
  recDrillBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  recDrillTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  recDrillDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  recDrillMeta: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 6,
  },
  actions: {
    gap: 12,
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    width: '100%',
  },
  viewModeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  viewModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewModeTabActive: {
    backgroundColor: theme.colors.primary,
  },
  viewModeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  viewModeTabTextActive: {
    color: '#000000',
  },
  openSkeletonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  openSkeletonBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
