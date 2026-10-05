import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import theme from '../../constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input = ({ label, error, secureTextEntry, style, ...props }: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // When secureTextEntry is provided, toggle between hidden and visible
  const isSecure = secureTextEntry ? !isPasswordVisible : false;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            secureTextEntry && styles.inputWithIcon,
            error && styles.inputError,
            style,
          ]}
          secureTextEntry={isSecure}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={19} color={theme.colors.primary} />
            ) : (
              <Eye size={19} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
