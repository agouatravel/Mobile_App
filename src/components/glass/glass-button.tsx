import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/glass/glass-surface';
import { Colors } from '@/constants/theme';

type GlassButtonProps = {
  label?: string;
  icon?: ReactNode;
  onPress: () => void;
  /** Circular icon-only button (e.g. close, share) instead of a pill. */
  round?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

// Secondary action button — blue type on a grey surface. Use for "Back",
// share, close (X), and other supporting actions. It differs from
// PrimaryButton by its surface, not its hue: both are the same blue, but that
// one fills with it and this one only writes in it.
export function GlassButton({ label, icon, onPress, round, size = 44, style }: GlassButtonProps) {
  return (
    <GlassSurface
      onPress={onPress}
      tone="secondary"
      radius={round ? size / 2 : 999}
      style={[
        round
          ? { width: size, height: size, alignItems: 'center', justifyContent: 'center' }
          : styles.pill,
        style,
      ]}>
      {icon}
      {label && <Text style={styles.label}>{label}</Text>}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  label: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
