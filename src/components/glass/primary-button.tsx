import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

type PrimaryButtonProps = {
  label?: string;
  icon?: ReactNode;
  onPress: () => void;
  /** Circular icon-only button (e.g. the center FAB) instead of a pill. */
  round?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

// The app's filled action: a solid blue fill, no blur, no lift. Reserved for
// the one most important action per screen (main CTA / FAB); everything else
// is a grey surface or bare type.
//
// It was orange with a glow beneath it. Orange is down to two jobs in this
// theme and neither is a button, and the glow was the loudest thing on any
// screen it appeared on.
export function PrimaryButton({ label, icon, onPress, round, size = 56, style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        round ? { width: size, height: size, borderRadius: size / 2 } : styles.pill,
        pressed && styles.pressed,
        style,
      ]}>
      {icon}
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  label: {
    color: Colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
  },
});
