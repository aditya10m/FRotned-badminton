import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import theme from '../../constants/theme';

export const LoadingScreen = ({ text = 'Loading...' }: { text?: string }) => {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bounce.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ball, animatedStyle]} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  text: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
  },
});
