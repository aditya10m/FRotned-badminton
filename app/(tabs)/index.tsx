import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button } from '../../components/ui/Button';
import { ScoreCircle } from '../../components/ui/ScoreCircle';
import { ScoreCard } from '../../components/ui/ScoreCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import theme from '../../constants/theme';
import { FadeIn } from '../../components/animation/FadeIn';
import { FRAME_ASSETS } from '../../components/animation/ScrollFrameAnimation';
import { VideoBackground } from '../../components/ui/VideoBackground';
import { analysisService, AnalysisSummary } from '../../services/analysis';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisSummary[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchRecent() {
      try {
        const list = await analysisService.listAnalyses();
        if (isMounted && list && list.length > 0) {
          setRecentAnalyses(list.slice(0, 4));
        }
      } catch (err) {
        console.warn('Recent analyses fetch fallback:', err);
      }
    }
    fetchRecent();
    return () => { isMounted = false; };
  }, []);

  // Scroll through all frames as user scrolls down the dashboard
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const maxScroll = 350;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    const calculatedIndex = Math.min(
      Math.floor(progress * FRAME_ASSETS.length),
      FRAME_ASSETS.length - 1
    );
    setSelectedFrame(calculatedIndex);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = user?.fullName?.split(' ')[0] || 'Player';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background video of dashboard fully visible in continuous loop */}
      <VideoBackground videoUri="/dashboard-bg.mp4" overlayOpacity={0} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={100} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting}, {name}</Text>
              <Text style={styles.subtitle}>Here is your latest game summary and biomechanical analysis.</Text>
            </View>
            <TouchableOpacity
              style={styles.headerLogoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.headerLogoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* HERO CARD: TENNIS PLAYER FRAME ANIMATES ON SCROLL ACROSS ALL 36 FRAMES */}
        <FadeIn delay={200} style={styles.heroCard}>
          <View style={styles.framePreviewContainer}>
            <Image
              source={FRAME_ASSETS[selectedFrame]}
              style={styles.frameHeroImage}
              contentFit="cover"
              cachePolicy="memory"
            />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Overall Performance</Text>
            <View style={styles.scoreRow}>
              <ScoreCircle score={82} size={130} />
              <View style={styles.scoreDetails}>
                <Text style={styles.scoreHighlight}>+4.2%</Text>
                <Text style={styles.scoreHighlightLabel}>Since last training</Text>
                <Text style={styles.scoreSubtext}>Clean follow-through and optimal balance detected.</Text>
              </View>
            </View>

            <Button
              title="New Analysis"
              onPress={() => router.push('/(tabs)/analyze')}
              style={styles.actionBtn}
            />
          </View>
        </FadeIn>

        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <ScoreCard label="Technique" score={85} improvement={2.4} />
              <ScoreCard label="Movement" score={78} improvement={-1.2} />
            </View>
            <View style={styles.col}>
              <ScoreCard label="Smash/Drive" score={72} improvement={5.1} />
              <ScoreCard label="Consistency" score={88} improvement={0.5} />
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={400}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Analyses</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/analyze')} style={styles.newAnalysisLink}>
              <Text style={styles.newAnalysisLinkText}>+ Analyze Video</Text>
            </TouchableOpacity>
          </View>

          {recentAnalyses.length > 0 ? (
            recentAnalyses.map((item, index) => {
              const frameIdx = (index * 7 + 10) % FRAME_ASSETS.length;
              const typeCapitalized = item.analysis_type ? item.analysis_type.charAt(0).toUpperCase() + item.analysis_type.slice(1) : 'Match';
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/analysis/${item.id}`)}
                  activeOpacity={0.8}
                >
                  <Card style={styles.recentCard}>
                    <View style={styles.recentRow}>
                      <Image source={FRAME_ASSETS[frameIdx]} style={styles.recentThumbnail} contentFit="cover" />
                      <View style={styles.recentInfo}>
                        <Text style={styles.recentTitle}>{typeCapitalized} Analysis Session</Text>
                        <Text style={styles.recentDate}>
                          {item.created_at ? `${new Date(item.created_at).toLocaleDateString()} · ` : ''}Status: {item.status}
                        </Text>
                      </View>
                      <View style={styles.viewBadge}>
                        <Text style={styles.viewBadgeText}>View Report →</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          ) : (
            <>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/analyze')}
                activeOpacity={0.8}
              >
                <Card style={styles.recentCard}>
                  <View style={styles.recentRow}>
                    <Image source={FRAME_ASSETS[14]} style={styles.recentThumbnail} contentFit="cover" />
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentTitle}>Badminton Match Play</Text>
                      <Text style={styles.recentDate}>Upload a video to generate measured analysis</Text>
                    </View>
                    <Text style={styles.recentScore}>—</Text>
                  </View>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/analyze')}
                activeOpacity={0.8}
              >
                <Card style={styles.recentCard}>
                  <View style={styles.recentRow}>
                    <Image source={FRAME_ASSETS[28]} style={styles.recentThumbnail} contentFit="cover" />
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentTitle}>Overhead Smash & Clear Training</Text>
                      <Text style={styles.recentDate}>Upload a video to generate measured analysis</Text>
                    </View>
                    <Text style={styles.recentScore}>—</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </>
          )}
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLogoutBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerLogoutText: {
    color: theme.colors.error,
    fontSize: 13,
    fontWeight: '700',
  },
  greeting: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  heroCard: {
    backgroundColor: 'rgba(14, 14, 14, 0.78)',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  framePreviewContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
    position: 'relative',
  },
  frameHeroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    padding: theme.spacing.xl,
  },
  heroTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: theme.spacing.lg,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreHighlight: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  scoreHighlightLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  scoreSubtext: {
    fontSize: 13,
    color: '#8A8A8A',
    lineHeight: 18,
  },
  actionBtn: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  col: {
    flex: 1,
  },
  recentCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(14, 14, 14, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  recentThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  recentDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  recentScore: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  newAnalysisLink: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
  },
  newAnalysisLinkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  viewBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewBadgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
