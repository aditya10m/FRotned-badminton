import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import theme from '../../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({ onPress, title, variant = 'primary', style, textStyle, disabled }: ButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => { scale.value = withSpring(0.95); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondary,
          text: styles.secondaryText,
        };
      case 'ghost':
        return {
          container: styles.ghost,
          text: styles.ghostText,
        };
      default:
        return {
          container: styles.primary,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        variantStyles.container,
        disabled && styles.disabled,
        style,
        animatedStyle,
      ]}
    >
      <Text style={[styles.baseText, variantStyles.text, textStyle]}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    ...theme.typography.h3,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: theme.colors.background,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryText: {
    color: theme.colors.text,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
