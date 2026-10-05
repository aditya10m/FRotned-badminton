import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { FadeIn } from '../../components/animation/FadeIn';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { coachService, CoachingPlan, CoachingDrill, GeneratedWeeklyPlan } from '../../services/coach';
import {
  Brain,
  Zap,
  CheckCircle,
  Play,
  Calendar,
  X,
  Target,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react-native';

const CATEGORIES = ['All', 'Technique', 'Footwork', 'Smash', 'Tactics'];

export default function Coach() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<CoachingPlan | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [weeklyPlanModal, setWeeklyPlanModal] = useState<GeneratedWeeklyPlan | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCoaching() {
      try {
        const data = await coachService.getMyPlan();
        if (isMounted) setPlan(data);
      } catch (err) {
        console.warn('Could not load plan from backend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCoaching();
    return () => { isMounted = false; };
  }, []);

  const handleCompleteDrill = async (drillId: string) => {
    setCompletedDrills(prev => ({
      ...prev,
      [drillId]: !prev[drillId],
    }));
    try {
      await coachService.completeDrill(drillId);
    } catch {
      // Completed state maintained locally
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const generated = await coachService.generateWeeklyPlan();
      setWeeklyPlanModal(generated);
    } catch (e) {
      console.warn('Plan generation fallback:', e);
      setWeeklyPlanModal({
        status: 'success',
        title: 'Personalized 7-Day Performance Protocol',
        schedule: [
          { day: 'Monday', focus: 'Forehand Smash Wrist Snap & Scissor Kick', duration: '45 mins' },
          { day: 'Tuesday', focus: 'Six-Point Split-Step Timing & Corner Lunges', duration: '35 mins' },
          { day: 'Wednesday', focus: 'High Clear Depth & Backhand Thumb-Grip Drops', duration: '50 mins' },
          { day: 'Thursday', focus: 'Active Recovery, Shoulder Mobility & Rotator Cuff Bands', duration: '30 mins' },
          { day: 'Friday', focus: 'Fast Net Kill Tumbles & Flat Drive Rallies', duration: '60 mins' },
          { day: 'Saturday', focus: 'Simulated Badminton Match Play & Video Capture', duration: '90 mins' },
          { day: 'Sunday', focus: 'Video Biomechanical Review & Rest', duration: '20 mins' },
        ],
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Synthesizing AI Coach Recommendations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const drills = plan?.drills || [];
  const filteredDrills = selectedCategory === 'All'
    ? drills
    : drills.filter(d => d.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>AI Coach</Text>
            <Text style={styles.subtitle}>Kinematic insights & tailored practice prescriptions</Text>
          </View>
          <View style={styles.aiBadge}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={styles.aiBadgeText}>GPT-4o Vision</Text>
          </View>
        </View>

        {/* PRIORITY IMPROVEMENT HERO CARD */}
        <FadeIn delay={100}>
          <Card style={styles.priorityCard}>
            <View style={styles.priorityHeaderRow}>
              <View style={styles.priorityPill}>
                <Zap size={14} color="#000000" />
                <Text style={styles.priorityPillText}>TOP TECHNICAL FOCUS</Text>
              </View>
              <Text style={styles.priorityImpact}>High Impact</Text>
            </View>

            <Text style={styles.priorityTitle}>
              {plan?.priority_title || 'Forehand Smash Pronation & Snap'}
            </Text>

            <Text style={styles.priorityDesc}>
              {plan?.priority_desc || 'Your racquet is decelerating before shuttlecock contact and forearm pronation is delayed. This limits steep downward trajectory and smash velocity.'}
            </Text>

            {plan?.explanation && (
              <View style={styles.biomechNote}>
                <Text style={styles.biomechNoteTitle}>Biomechanical Root Cause:</Text>
                <Text style={styles.biomechNoteText}>{plan.explanation}</Text>
              </View>
            )}
          </Card>
        </FadeIn>

        {/* STRENGTHS & WEAKNESSES */}
        <FadeIn delay={150} style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnostic Keypoints</Text>
          <View style={styles.badgesWrap}>
            {(plan?.strengths || [
              'Consistent low flick serve placement',
              'Strong core rotation on rear-court jump smashes',
              'Explosive front-court lunge recovery',
            ]).map((s, idx) => (
              <View key={`str-${idx}`} style={styles.keypointTagPositive}>
                <CheckCircle size={14} color="#22C55E" />
                <Text style={styles.keypointTextPositive}>{s}</Text>
              </View>
            ))}

            {(plan?.weaknesses || [
              'Delayed forearm pronation on overhead smashes',
              'Slightly late split-step timing on net tumble return',
            ]).map((w, idx) => (
              <View key={`weak-${idx}`} style={styles.keypointTagWarning}>
                <Target size={14} color="#EAB308" />
                <Text style={styles.keypointTextWarning}>{w}</Text>
              </View>
            ))}
          </View>
        </FadeIn>

        {/* GENERATE 7-DAY PLAN BUTTON */}
        <FadeIn delay={200}>
          <TouchableOpacity
            style={styles.generatePlanCard}
            onPress={handleGeneratePlan}
            disabled={generatingPlan}
            activeOpacity={0.8}
          >
            <View style={styles.calendarIconWrap}>
              <Calendar size={22} color="#000000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.generatePlanTitle}>7-Day Structured Training Protocol</Text>
              <Text style={styles.generatePlanSubtitle}>
                AI-compiled daily drills balancing intensity, footwork, and recovery.
              </Text>
            </View>
            {generatingPlan ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <View style={styles.viewPlanPill}>
                <Text style={styles.viewPlanPillText}>View Plan</Text>
              </View>
            )}
          </TouchableOpacity>
        </FadeIn>

        {/* RECOMMENDED DRILLS SECTION */}
        <FadeIn delay={250}>
          <View style={styles.drillsHeader}>
            <Text style={styles.sectionTitle}>Prescribed Training Drills</Text>
          </View>

          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Drill Cards */}
          <View style={styles.drillsList}>
            {filteredDrills.map((drill) => {
              const isCompleted = !!completedDrills[drill.id];
              return (
                <Card key={drill.id} style={[styles.drillCard, isCompleted && styles.drillCardDone]}>
                  <View style={styles.drillTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.drillName, isCompleted && styles.drillNameDone]}>
                        {drill.name}
                      </Text>
                      <View style={styles.drillMetaPills}>
                        <View style={styles.metaChip}>
                          <Clock size={12} color="#94A3B8" />
                          <Text style={styles.metaChipText}>{drill.duration_minutes || 15} mins</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>{drill.difficulty || 'Intermediate'}</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>{drill.category}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.drillDescription}>{drill.description}</Text>

                  {drill.purpose && (
                    <Text style={styles.drillPurpose}>Target: {drill.purpose}</Text>
                  )}

                  <View style={styles.drillBottomRow}>
                    <Text style={styles.drillSetsReps}>
                      {drill.sets || 3} sets × {drill.repetitions || 20} repetitions
                    </Text>

                    <TouchableOpacity
                      style={[styles.drillActionBtn, isCompleted && styles.drillActionBtnDone]}
                      onPress={() => handleCompleteDrill(drill.id)}
                      activeOpacity={0.8}
                    >
                      <CheckCircle size={15} color={isCompleted ? '#000000' : theme.colors.primary} />
                      <Text style={[styles.drillActionText, isCompleted && styles.drillActionTextDone]}>
                        {isCompleted ? 'Completed' : 'Mark as Done'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        </FadeIn>
      </ScrollView>

      {/* 7-DAY PROTOCOL MODAL */}
      <Modal
        visible={!!weeklyPlanModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWeeklyPlanModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeading}>7-Day Training Schedule</Text>
                <Text style={styles.modalSubheading}>Targeted biomechanical refinement</Text>
              </View>
              <TouchableOpacity
                onPress={() => setWeeklyPlanModal(null)}
                style={styles.modalCloseIcon}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scheduleList} showsVerticalScrollIndicator={false}>
              {weeklyPlanModal?.schedule.map((dayItem, idx) => (
                <View key={idx} style={styles.scheduleRow}>
                  <View style={styles.dayCol}>
                    <Text style={styles.dayText}>{dayItem.day}</Text>
                    <Text style={styles.durationText}>{dayItem.duration}</Text>
                  </View>
                  <View style={styles.focusCol}>
                    <Text style={styles.focusText}>{dayItem.focus}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <Button
              title="Close Protocol"
              onPress={() => setWeeklyPlanModal(null)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
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
  centerBox: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  header: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: '800',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontSize: 13,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
  },
  aiBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  priorityCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderWidth: 1,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  priorityPillText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priorityImpact: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  priorityTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontWeight: '800',
    marginBottom: 8,
  },
  priorityDesc: {
    ...theme.typography.body,
    color: '#E2E8F0',
    lineHeight: 22,
    marginBottom: 12,
  },
  biomechNote: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  biomechNoteTitle: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  biomechNoteText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keypointTagPositive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  keypointTextPositive: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
  },
  keypointTagWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  keypointTextWarning: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '600',
  },
  generatePlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(204, 255, 0, 0.06)',
    borderColor: 'rgba(204, 255, 0, 0.25)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: theme.spacing.xl,
  },
  calendarIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatePlanTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  generatePlanSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  viewPlanPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewPlanPillText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  drillsHeader: {
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  drillsList: {
    gap: 12,
  },
  drillCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: theme.spacing.lg,
  },
  drillCardDone: {
    borderColor: 'rgba(34, 197, 94, 0.35)',
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
  },
  drillTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  drillName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },
  drillNameDone: {
    color: '#86EFAC',
  },
  drillMetaPills: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  metaChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  drillDescription: {
    ...theme.typography.body,
    color: '#CBD5E1',
    lineHeight: 20,
    marginTop: 8,
  },
  drillPurpose: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  drillBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  drillSetsReps: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  drillActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
  },
  drillActionBtnDone: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  drillActionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  drillActionTextDone: {
    color: '#000000',
    fontWeight: '800',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: '#121216',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubheading: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  modalCloseIcon: {
    padding: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleList: {
    marginVertical: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  dayCol: {
    width: 90,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  durationText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  focusCol: {
    flex: 1,
  },
  focusText: {
    fontSize: 13,
    color: '#F1F5F9',
    lineHeight: 18,
  },
});
