import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, X, ChevronRight, Activity, Sparkles, Target } from 'lucide-react-native';
import theme from '../constants/theme';
import { VideoBackground } from '../components/ui/VideoBackground';
import { useAuth } from '../hooks/useAuth';

export default function LandingScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [blogModalVisible, setBlogModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background Video fully visible and looping */}
      <VideoBackground videoUri="/dashboard-bg.mp4" overlayOpacity={0} />

      {/* Top Navbar - Apple / Nike Minimalist Floating Style */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
          style={styles.brandContainer}
        >
          <Text style={styles.brandTitle}>
            BADMINTON<Text style={styles.brandAccent}>AI</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {user ? (
            <View style={styles.userNavRow}>
              <TouchableOpacity
                style={styles.pillPrimary}
                onPress={() => router.push('/(tabs)')}
                activeOpacity={0.85}
              >
                <Text style={styles.pillPrimaryText}>Dashboard →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navGhostBtn}
                onPress={async () => {
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
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.navGhostBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pillPrimary}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.pillPrimaryText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Scrollable Content on top of the fully visible video */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP SECTION: Glassmorphic "What is Badminton" on the left */}
        <View style={styles.heroRow}>
          <View style={styles.glassCardHero}>
            <View style={styles.badgeRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.badgeText}>THE ESSENCE OF THE SPORT</Text>
            </View>

            <Text style={styles.cardHeading}>WHAT IS{'\n'}BADMINTON?</Text>

            <Text style={styles.cardExcerpt}>
              Badminton is supersonic kinetic art and lightning reflexes. The fastest racket
              sport on earth, where feathered projectiles fly at over 400 km/h, demanding explosive
              jump smashes, surgical net tumbles, and millisecond reaction times.
            </Text>

            <Text style={styles.cardBodyMuted}>
              From explosive scissor-kick smashes to deceptive wrist-flick drop shots, every rally
              is a high-octane battle of aerobic stamina, split-step lunges, and geometric precision.
            </Text>

            <TouchableOpacity
              style={styles.readMoreBtn}
              onPress={() => setBlogModalVisible(true)}
              activeOpacity={0.8}
            >
              <BookOpen size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.readMoreText}>Read Story</Text>
              <ChevronRight size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* DOWN SECTION: "What is the Work of the Project" */}
        <View style={styles.projectSection}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionTag}>MISSION & ARCHITECTURE</Text>
            <Text style={styles.sectionTitle}>WHAT IS THE WORK OF THIS PROJECT?</Text>
            <Text style={styles.sectionSubtitle}>
              BadmintonAI Coach bridges the gap between subjective intuition and deterministic
              biomechanical truth through computer vision.
            </Text>
          </View>

          {/* 3 Glassmorphic Pillars */}
          <View style={styles.pillarsGrid}>
            {/* Pillar 1 */}
            <View style={styles.glassCardPillar}>
              <View style={styles.iconCircle}>
                <Activity size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.pillarNumber}>01</Text>
              <Text style={styles.pillarTitle}>Computer Vision Kinematics</Text>
              <Text style={styles.pillarDesc}>
                Processes raw match & training video to track 33 full-body anatomical
                joints frame-by-frame with sub-millimeter precision.
              </Text>
            </View>

            {/* Pillar 2 */}
            <View style={styles.glassCardPillar}>
              <View style={styles.iconCircle}>
                <Target size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.pillarNumber}>02</Text>
              <Text style={styles.pillarTitle}>Deterministic Scoring</Text>
              <Text style={styles.pillarDesc}>
                Measures smash jump height, scissor kick timing, lunge balance,
                and racket whip acceleration against world-class professional standards.
              </Text>
            </View>

            {/* Pillar 3 */}
            <View style={styles.glassCardPillar}>
              <View style={styles.iconCircle}>
                <Sparkles size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.pillarNumber}>03</Text>
              <Text style={styles.pillarTitle}>Actionable AI Coaching</Text>
              <Text style={styles.pillarDesc}>
                Translates diagnostic stroke flaws into curated, progressive training
                drills tailored to your exact mechanical bottlenecks.
              </Text>
            </View>
          </View>

          {/* Bottom Connect Callout */}
          <View style={styles.bottomCtaGlass}>
            <Text style={styles.bottomCtaTitle}>Ready to analyze your match?</Text>
            <Text style={styles.bottomCtaSub}>
              Connect your account to upload video and receive your instant biomechanical scorecard.
            </Text>
            <TouchableOpacity
              style={styles.bottomCtaBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.bottomCtaBtnText}>Connect to Analyze →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* BLOG MODAL: "What is Badminton" Deep Dive Story */}
      <Modal
        visible={blogModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setBlogModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCategory}>THE BIOMECHANICS ESSAY</Text>
                <Text style={styles.modalTitle}>What is Badminton?</Text>
              </View>
              <TouchableOpacity
                onPress={() => setBlogModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.blogParagraphLead}>
                Traced to the ancient game of Battledore and Shuttlecock and codified at Badminton
                House in Gloucestershire, modern badminton is the undisputed speed champion of
                racket sports, demanding supreme agility, explosive power, and surgical precision.
              </Text>

              <Text style={styles.blogSubheading}>The Supersonic Shuttlecock</Text>
              <Text style={styles.blogParagraph}>
                Unlike a tennis ball, a badminton shuttlecock features sixteen goose feathers embedded
                into cork. At impact during an overhead smash, it can accelerate past 400+ km/h before
                aerodynamic drag decelerates it—demanding lightning-fast reflexes and split-second
                spatial anticipation.
              </Text>

              <Text style={styles.blogSubheading}>The Kinetic Chain & Wrist Snap</Text>
              <Text style={styles.blogParagraph}>
                An elite badminton smash generates unmatched power through rapid kinetic sequencing:
                an explosive vertical launch off the rear foot, a dynamic scissor kick in mid-air,
                full torso coil, and a lightning-fast forearm pronation and wrist snap that whips
                the racquet head into the shuttle.
              </Text>

              <Text style={styles.blogSubheading}>Why Technology Matters</Text>
              <Text style={styles.blogParagraph}>
                At speeds exceeding four hundred kilometers per hour, the human eye cannot decipher
                micro-flaws in recovery lunges, racket face angles, or airborne balance. BadmintonAI
                Coach transforms coaching into empirically measurable biomechanical science.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalBottomBtn}
              onPress={() => setBlogModalVisible(false)}
            >
              <Text style={styles.modalBottomBtnText}>Close Story</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerBar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
      },
    }),
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navGhostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navGhostBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  pillPrimary: {
    paddingVertical: 9,
    paddingHorizontal: 24,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  pillPrimaryText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 80,
  },
  heroRow: {
    minHeight: 520,
    justifyContent: 'center',
    marginBottom: 48,
  },
  glassCardHero: {
    maxWidth: 520,
    backgroundColor: 'rgba(12, 12, 12, 0.62)',
    borderRadius: 28,
    padding: 34,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.55,
    shadowRadius: 36,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
      },
    }),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cardHeading: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    lineHeight: 48,
    marginBottom: 16,
  },
  cardExcerpt: {
    fontSize: 16,
    lineHeight: 25,
    color: '#E6E6E6',
    fontWeight: '500',
    marginBottom: 14,
  },
  cardBodyMuted: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 24,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
  },
  readMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  projectSection: {
    marginTop: 20,
    paddingTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeaderWrap: {
    marginBottom: 32,
    maxWidth: 680,
  },
  sectionTag: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 40,
  },
  glassCardPillar: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(12, 12, 12, 0.62)',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200, 230, 76, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pillarNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pillarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  pillarDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bottomCtaGlass: {
    backgroundColor: 'rgba(12, 12, 12, 0.68)',
    borderRadius: 24,
    padding: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    textAlign: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  bottomCtaTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  bottomCtaSub: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    maxWidth: 480,
    marginBottom: 24,
    lineHeight: 22,
  },
  bottomCtaBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 9999,
  },
  bottomCtaBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalGlassCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    backgroundColor: 'rgba(18, 18, 18, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(32px)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 16,
  },
  modalCategory: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  blogParagraphLead: {
    fontSize: 16,
    lineHeight: 26,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  blogSubheading: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 14,
    marginBottom: 8,
  },
  blogParagraph: {
    fontSize: 14,
    lineHeight: 23,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  modalBottomBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
  },
  modalBottomBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
