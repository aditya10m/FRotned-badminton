import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'positive' | 'warning' | 'error' | 'info';
}

export const Badge = ({ label, variant = 'info' }: BadgeProps) => {
  const getColors = () => {
    switch (variant) {
      case 'positive': return { bg: `${theme.colors.success}20`, text: theme.colors.success };
      case 'warning': return { bg: `${theme.colors.warning}20`, text: theme.colors.warning };
      case 'error': return { bg: `${theme.colors.error}20`, text: theme.colors.error };
      case 'info': default: return { bg: `${theme.colors.info}20`, text: theme.colors.info };
    }
  };
  
  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});
