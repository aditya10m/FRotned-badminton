import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing, useAnimatedStyle, interpolateColor } from 'react-native-reanimated';
import theme from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ScoreCircle = ({ score, size = 120, strokeWidth = 10 }: ScoreCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * progress.value) / 100;
    return {
      strokeDashoffset,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 50, 80, 100],
      [theme.colors.error, theme.colors.warning, theme.colors.primary, theme.colors.success]
    );
    return { color };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          stroke={theme.colors.surfaceLight}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={theme.colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.textContainer]}>
        <Text style={[styles.scoreText, { fontSize: size / 3 }]}>{score}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...theme.typography.score,
    color: theme.colors.text,
  },
});
