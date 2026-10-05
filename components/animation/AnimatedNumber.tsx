import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedProps, runOnJS } from 'react-native-reanimated';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  duration?: number;
}

export const AnimatedNumber = ({ value, style, duration = 1000 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration }, (finished) => {
      if (finished) {
        runOnJS(setDisplayValue)(value);
      }
    });
    
    // Quick polling to update display value during animation
    const interval = setInterval(() => {
      setDisplayValue(Math.round(animatedValue.value));
    }, 50);
    
    return () => clearInterval(interval);
  }, [value, duration]);

  return <Text style={style}>{displayValue}</Text>;
};
