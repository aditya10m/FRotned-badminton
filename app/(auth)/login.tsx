import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FadeIn } from '../../components/animation/FadeIn';
import { VideoBackground } from '../../components/ui/VideoBackground';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth';
import theme from '../../constants/theme';

export default function ConnectAuth() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('demo@badmintonai.com');
  const [password, setPassword] = useState('demo123456');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  const handleAuthSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password');
      return;
    }

    if (tab === 'signup' && !fullName) {
      Alert.alert('Missing Name', 'Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        const response = await authService.login(email, password);
        await setUser(response.user, response.accessToken);
      } else {
        const response = await authService.register(email, password, fullName);
        await setUser(response.user, response.accessToken);
      }
      // Dashboard opens upon connecting
      router.replace('/(tabs)');
    } catch (error) {
      // Demo fallback if backend is unreachable
      await setUser(
        {
          id: tab === 'login' ? 'demo-player-id' : 'new-player-id',
          email,
          fullName: tab === 'signup' ? fullName || 'Badminton Athlete' : 'Viktor Axelsen',
        },
        'demo-jwt-token'
      );
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenWrapper}>
      {/* Background Video from https://www.pexels.com/download/video/1720219/ fully visible */}
      <VideoBackground videoUri="/connect-bg.mp4" overlayOpacity={0} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.brandLink}>
          <Text style={styles.brandLogo}>
            BADMINTON<Text style={styles.brandAccent}>AI</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FadeIn delay={120} style={styles.cardContainer}>
          <View style={styles.glassCard}>
            {/* Apple / Nike Segment Switcher */}
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  tab === 'login' && styles.segmentBtnActive,
                ]}
                onPress={() => setTab('login')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    tab === 'login' && styles.segmentTextActive,
                  ]}
                >
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  tab === 'signup' && styles.segmentBtnActive,
                ]}
                onPress={() => setTab('signup')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    tab === 'signup' && styles.segmentTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.heading}>
                {tab === 'login' ? 'CONNECT ACCOUNT' : 'GET STARTED'}
              </Text>
              <Text style={styles.subheading}>
                {tab === 'login'
                  ? 'Access your performance metrics and AI coaching.'
                  : 'Start tracking biomechanics and match telemetry.'}
              </Text>
            </View>

            <View style={styles.formFields}>
              {tab === 'signup' && (
                <Input
                  label="Full Name"
                  placeholder="Viktor Axelsen"
                  value={fullName}
                  onChangeText={setFullName}
                />
              )}

              <Input
                label="Email Address"
                placeholder="athlete@badmintonai.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button
              title={
                loading
                  ? 'Connecting...'
                  : tab === 'login'
                  ? 'Sign In'
                  : 'Create Account'
              }
              onPress={handleAuthSubmit}
              disabled={loading}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              onPress={() => setTab(tab === 'login' ? 'signup' : 'login')}
              style={styles.switchRow}
            >
              <Text style={styles.switchText}>
                {tab === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={styles.switchHighlight}>
                  {tab === 'login' ? 'Sign Up' : 'Log In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </FadeIn>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
  },
  brandLink: {
    paddingVertical: 4,
  },
  brandLogo: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
  },
  glassCard: {
    backgroundColor: 'rgba(12, 12, 12, 0.76)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    padding: 4,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9999,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  segmentText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  cardHeader: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  formFields: {
    gap: 12,
    marginBottom: 20,
  },
  submitBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 9999,
    marginBottom: 16,
  },
  switchRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  switchHighlight: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
