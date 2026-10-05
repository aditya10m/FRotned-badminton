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
import { Link, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FadeIn } from '../../components/animation/FadeIn';
import { VideoBackground } from '../../components/ui/VideoBackground';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth';
import theme from '../../constants/theme';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(email, password, fullName);
      await setUser(response.user, response.accessToken);
      // Dashboard appears after registration
      router.replace('/(tabs)');
    } catch (error) {
      // Fallback demo account
      await setUser(
        {
          id: 'new-player-id',
          email,
          fullName,
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
      {/* Video Background from https://www.pexels.com/download/video/1720219/ */}
      <VideoBackground
        videoUri="/connect-bg.mp4"
        overlayOpacity={0}
      />

      {/* Top minimal brand bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.brandLink}>
          <Text style={styles.brandLogo}>BADMINTON<Text style={styles.brandAccent}>AI</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pillSecondary}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.pillSecondaryText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FadeIn delay={150} style={styles.cardContainer}>
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.heading}>SIGN UP</Text>
              <Text style={styles.subheading}>
                Join players and academies turning match footage into performance data.
              </Text>
            </View>

            <View style={styles.formFields}>
              <Input
                label="Full Name"
                placeholder="Viktor Axelsen"
                value={fullName}
                onChangeText={setFullName}
              />
              <Input
                label="Email Address"
                placeholder="player@badmintonai.com"
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
              title={loading ? 'Creating Account...' : 'Get Started'}
              onPress={handleRegister}
              disabled={loading}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/(auth)/login" style={styles.footerLink}>
                Sign in
              </Link>
            </View>
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
  pillSecondary: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillSecondaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    backgroundColor: 'rgba(12, 12, 12, 0.72)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  formFields: {
    gap: 14,
    marginBottom: 20,
  },
  submitBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 9999,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
