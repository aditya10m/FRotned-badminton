import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { FadeIn } from '../../components/animation/FadeIn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import theme from '../../constants/theme';
import { Play, Video, Sparkles } from 'lucide-react-native';
import { analysisService, SkeletonAnalysisData, AnalysisReport } from '../../services/analysis';
import { SkeletonVideoPlayer } from '../../components/analysis/SkeletonVideoPlayer';

export default function Analyze() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [videoUri, setVideoUri] = useState<string>('');
  const [skeletonData, setSkeletonData] = useState<SkeletonAnalysisData | null>(null);
  const [reportData, setReportData] = useState<AnalysisReport | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Start analysis: immediately play video and scan skeleton
  const handleStartAnalysis = async (customUri?: string, fileObj?: any) => {
    if (!customUri) {
      setErrorMsg('Choose a video first. Analysis only displays measurements extracted from an uploaded video.');
      return;
    }
    setErrorMsg('');
    const targetUri = customUri;
    setSkeletonData(null);
    setReportData(null);
    setVideoUri(targetUri);
    setStep(2); // Immediately transition to video play and skeleton scan view!

    try {
      const uploaded = await analysisService.uploadVideo(customUri, 'match_play.mp4', fileObj);
      const videoId = uploaded?.id || (uploaded as any)?.video?.id;
      if (!videoId) throw new Error('Upload did not return a video ID. Please try again.');

      const job = await analysisService.startAnalysis(videoId, 'match');

      // Wait up to 90s, but don't crash on timeout — just try to fetch what we have
      try {
        await analysisService.waitForCompletion(job.id, 90_000);
      } catch (waitErr) {
        console.warn('Analysis wait timeout or error — fetching available data:', waitErr);
      }

      const [skData, repData] = await Promise.allSettled([
        analysisService.getSkeletonAnalysis(job.id),
        analysisService.getReport(job.id),
      ]);

      if (skData.status === 'fulfilled') {
        setSkeletonData({
          ...skData.value,
          video_url: skData.value.video_url || targetUri,
        });
      }
      if (repData.status === 'fulfilled') {
        setReportData(repData.value);
      }

      // If we got nothing, show a helpful message but stay on step 2
      if (skData.status === 'rejected' && repData.status === 'rejected') {
        setErrorMsg('Analysis is still processing. The report will appear shortly — please wait a moment and refresh.');
      }
    } catch (err) {
      console.warn('Analysis load error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not analyze this video.');
      setStep(1);
    }
  };

  // Browse local files
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let uri = asset.uri;
        let fileObj: any = null;

        if (Platform.OS === 'web') {
          const rawFile = (asset as any).file;
          if (rawFile && (rawFile instanceof Blob || (typeof File !== 'undefined' && rawFile instanceof File))) {
            fileObj = rawFile;
            uri = URL.createObjectURL(rawFile);
          }
        }
        await handleStartAnalysis(uri, fileObj);
      }
    } catch (err) {
      console.log('Document picker error:', err);
      setErrorMsg('Could not read the selected video. Please choose another MP4 or MOV file.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Badminton Match Play Video Analysis</Text>
            <Text style={styles.headerSubtitle}>
              2D Pose Estimation, Frame-by-Frame Kinetic Tracking & Biomechanical Summary
            </Text>
          </View>
        </View>

        {/* STEP 1: ONLY MATCH PLAY FORM (OTHER COLUMNS REMOVED) */}
        {step === 1 && (
          <FadeIn>
            {/* ONLY ONE CARD: MATCH PLAY */}
            <Card style={styles.matchPlayCard}>
              <View style={styles.badgeRow}>
                <View style={styles.typeBadge}>
                  <Play size={14} color="#000000" />
                  <Text style={styles.typeBadgeText}>MATCH PLAY ONLY</Text>
                </View>
                <View style={styles.aiBadge}>
                  <Sparkles size={13} color={theme.colors.primary} />
                  <Text style={styles.aiBadgeText}>AI Vision Scanner</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>Upload Badminton Video to Scan Skeleton</Text>
              <Text style={styles.cardDesc}>
                Once you select or upload a badminton match or training video, the AI will immediately play the footage, actively track 13 keypoint joints with a live skeleton overlay, and generate your complete badminton biomechanical summary report.
              </Text>

              {/* BROWSE LOCAL DEVICE FILE */}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickVideo}
                activeOpacity={0.85}
              >
                <Video color={theme.colors.primary} size={32} style={{ marginBottom: 8 }} />
                <Text style={styles.uploadBtnTitle}>Browse Device Files to Upload</Text>
                <Text style={styles.uploadBtnSub}>Supports MP4, MOV up to 500MB</Text>
              </TouchableOpacity>

              {errorMsg ? <Text style={styles.errorNotice}>{errorMsg}</Text> : null}
            </Card>
          </FadeIn>
        )}

        {/* STEP 2: VIDEO PLAYS, SCANS SKELETON & REPORTS ALL SUMMARY (SINGLE COLUMN) */}
        {step === 2 && (
          <FadeIn>
            <SkeletonVideoPlayer
              key={videoUri}
              videoUrl={videoUri}
              data={
                skeletonData || {
                  is_demo: false,
                  video_url: videoUri,
                  duration_seconds: 17.2,
                  events: [],
                  frames: [],
                }
              }
              report={reportData}
              onScanAnother={() => {
                setSkeletonData(null);
                setReportData(null);
                setVideoUri('');
                setStep(1);
              }}
              onBack={() => {
                setSkeletonData(null);
                setReportData(null);
                setVideoUri('');
                setStep(1);
              }}
            />
          </FadeIn>
        )}
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
    marginBottom: theme.spacing.lg,
  },
  header: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 24,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  matchPlayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    padding: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  typeBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
  },
  aiBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 20,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sampleBtnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  sampleBtnSub: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
  },
  uploadBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  uploadBtnSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  errorNotice: {
    color: theme.colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
