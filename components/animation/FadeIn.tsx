import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeIn = ({ children, delay = 0, direction = 'up', distance = 20, duration = 500, style }: FadeInProps) => {
  const opacity = useSharedValue(0);
  const translate = useSharedValue(distance);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    translate.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  }, [delay, duration, distance]);

  const animatedStyle = useAnimatedStyle(() => {
    let transform: any[] = [];
    if (direction === 'up') transform.push({ translateY: translate.value });
    else if (direction === 'down') transform.push({ translateY: -translate.value });
    else if (direction === 'left') transform.push({ translateX: translate.value });
    else if (direction === 'right') transform.push({ translateX: -translate.value });

    return {
      opacity: opacity.value,
      transform: direction !== 'none' ? transform : undefined,
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};
