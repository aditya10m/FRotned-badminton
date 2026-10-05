import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import theme from '../../constants/theme';

interface ScoreCardProps {
  label: string;
  score: number;
  improvement?: number;
}

export const ScoreCard = ({ label, score, improvement }: ScoreCardProps) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.score}>{score}</Text>
        {improvement !== undefined && (
          <Text style={[
            styles.improvement,
            { color: improvement >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {improvement >= 0 ? '+' : ''}{improvement}% from last session
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    ...theme.typography.score,
    fontSize: 48,
    color: theme.colors.text,
    marginRight: theme.spacing.md,
  },
  improvement: {
    ...theme.typography.caption,
  },
});
