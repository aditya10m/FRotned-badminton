import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import theme from '../../constants/theme';
import { FadeIn } from '../../components/animation/FadeIn';
import { playerService, PlayerProfileData } from '../../services/player';
import { X, Check, Edit3, User as UserIcon, Shield, Award, Activity } from 'lucide-react-native';

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Profile fields state
  const [profile, setProfile] = useState<PlayerProfileData>({
    fullName: user?.fullName || 'Player Name',
    playingHand: 'Right',
    backhand: 'Thumb Grip',
    skillLevel: 'Club Player',
    surface: 'Synthetic Mat',
    height: 180,
    age: 25,
    matchesAnalyzed: 24,
    bestScore: 88,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    playingHand: 'Right',
    backhand: 'Thumb Grip',
    skillLevel: 'Club Player',
    surface: 'Synthetic Mat',
    height: '180',
    age: '25',
  });

  // Fetch real profile from backend
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const data = await playerService.getProfile();
        if (isMounted) {
          setProfile(prev => ({
            ...prev,
            ...data,
            fullName: data.fullName || user?.fullName || 'Player Name',
          }));
        }
      } catch (err) {
        console.warn('Could not fetch backend profile, using local state:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [user]);

  const openEditModal = () => {
    setEditForm({
      fullName: profile.fullName || user?.fullName || '',
      playingHand: profile.playingHand || 'Right',
      backhand: profile.backhand || 'Two-Handed',
      skillLevel: profile.skillLevel || 'NTRP 4.0',
      surface: profile.surface || 'Hard',
      height: String(profile.height || 180),
      age: String(profile.age || 25),
    });
    setSuccessMsg('');
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const updated = await playerService.updateProfile({
        fullName: editForm.fullName.trim() || profile.fullName,
        playingHand: editForm.playingHand,
        backhand: editForm.backhand,
        skillLevel: editForm.skillLevel,
        surface: editForm.surface,
        height: parseInt(editForm.height) || 180,
        age: parseInt(editForm.age) || 25,
      });

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        ...updated,
        fullName: editForm.fullName.trim() || prev.fullName,
        playingHand: editForm.playingHand,
        backhand: editForm.backhand,
        skillLevel: editForm.skillLevel,
        surface: editForm.surface,
        height: parseInt(editForm.height) || 180,
        age: parseInt(editForm.age) || 25,
      }));

      // Update auth user state if name changed
      if (editForm.fullName.trim() && user) {
        await setUser({
          ...user,
          fullName: editForm.fullName.trim(),
        });
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setModalVisible(false);
        setSuccessMsg('');
      }, 900);
    } catch (e) {
      console.error('Save profile error:', e);
      // Fallback: update local state even if backend has hiccup
      setProfile(prev => ({
        ...prev,
        fullName: editForm.fullName.trim() || prev.fullName,
        playingHand: editForm.playingHand,
        backhand: editForm.backhand,
        skillLevel: editForm.skillLevel,
        surface: editForm.surface,
        height: parseInt(editForm.height) || 180,
        age: parseInt(editForm.age) || 25,
      }));
      setSuccessMsg('Saved locally!');
      setTimeout(() => {
        setModalVisible(false);
        setSuccessMsg('');
      }, 900);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

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

  const handOptions = ['Right', 'Left'];
  const backhandOptions = ['Thumb Grip', 'Bevel Grip'];
  const skillOptions = ['Beginner', 'Club Player', 'Intermediate', 'Advanced', 'Elite Pro'];
  const surfaceOptions = ['Synthetic Mat', 'Wood Court', 'Indoor PVC'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <FadeIn style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profile.fullName)}</Text>
          </View>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.email}>{user?.email || profile.email || 'player@badmintonai.com'}</Text>
        </FadeIn>

        <FadeIn delay={100} style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{profile.matchesAnalyzed || 24}</Text>
            <Text style={styles.statLabel}>Matches Analyzed</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{profile.bestScore || 88}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </Card>
        </FadeIn>

        <FadeIn delay={200}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Player Attributes</Text>
            <TouchableOpacity onPress={openEditModal} style={styles.editPencilBtn}>
              <Edit3 size={15} color={theme.colors.primary} />
              <Text style={styles.editPencilText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Playing Hand</Text>
              <Text style={styles.detailValue}>{profile.playingHand}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Backhand</Text>
              <Text style={styles.detailValue}>{profile.backhand}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Skill Level</Text>
              <Text style={styles.detailValue}>{profile.skillLevel}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preferred Surface</Text>
              <Text style={styles.detailValue}>{profile.surface}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailValue}>{profile.height} cm</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={styles.detailValue}>{profile.age} yrs</Text>
            </View>
          </Card>
        </FadeIn>

        <FadeIn delay={300} style={styles.actions}>
          <Button
            title="Edit Profile"
            variant="secondary"
            onPress={openEditModal}
            style={styles.btn}
          />
          <Button
            title="Log Out"
            variant="ghost"
            onPress={handleLogout}
            textStyle={{ color: theme.colors.error, fontWeight: '700' }}
          />
        </FadeIn>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Player Profile</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {successMsg ? (
              <View style={styles.successBanner}>
                <Check size={18} color="#22C55E" style={{ marginRight: 6 }} />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.fullName}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, fullName: text }))}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                />
              </View>

              {/* Playing Hand */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dominant Hand</Text>
                <View style={styles.chipRow}>
                  {handOptions.map((hand) => (
                    <TouchableOpacity
                      key={hand}
                      style={[styles.chip, editForm.playingHand === hand && styles.chipActive]}
                      onPress={() => setEditForm(prev => ({ ...prev, playingHand: hand }))}
                    >
                      <Text style={[styles.chipText, editForm.playingHand === hand && styles.chipTextActive]}>
                        {hand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Backhand Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Backhand Type</Text>
                <View style={styles.chipRow}>
                  {backhandOptions.map((bh) => (
                    <TouchableOpacity
                      key={bh}
                      style={[styles.chip, editForm.backhand === bh && styles.chipActive]}
                      onPress={() => setEditForm(prev => ({ ...prev, backhand: bh }))}
                    >
                      <Text style={[styles.chipText, editForm.backhand === bh && styles.chipTextActive]}>
                        {bh}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Skill Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skill Level</Text>
                <View style={styles.chipRowWrap}>
                  {skillOptions.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[styles.chip, editForm.skillLevel === skill && styles.chipActive]}
                      onPress={() => setEditForm(prev => ({ ...prev, skillLevel: skill }))}
                    >
                      <Text style={[styles.chipText, editForm.skillLevel === skill && styles.chipTextActive]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preferred Surface */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Court Surface</Text>
                <View style={styles.chipRow}>
                  {surfaceOptions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, editForm.surface === s && styles.chipActive]}
                      onPress={() => setEditForm(prev => ({ ...prev, surface: s }))}
                    >
                      <Text style={[styles.chipText, editForm.surface === s && styles.chipTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Height & Age Row */}
              <View style={styles.twoColRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.height}
                    onChangeText={(val) => setEditForm(prev => ({ ...prev, height: val }))}
                    keyboardType="numeric"
                    placeholder="180"
                    placeholderTextColor="#666"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.age}
                    onChangeText={(val) => setEditForm(prev => ({ ...prev, age: val }))}
                    keyboardType="numeric"
                    placeholder="25"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1E1E24',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatarText: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: 4,
    fontWeight: '700',
  },
  email: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: 4,
    fontWeight: '800',
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },
  editPencilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
  },
  editPencilText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  detailsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  btn: {
    width: '100%',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#121216',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalForm: {
    marginVertical: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  successText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
});
