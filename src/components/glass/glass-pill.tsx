import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/glass/glass-surface';

type GlassPillProps = {
  children?: ReactNode;
  onPress?: () => void;
  tone?: 'neutral' | 'secondary';
  style?: StyleProp<ViewStyle>;
};

// Fully-rounded glass variant for tab switchers, filter chips, and stat
// badges (likes/comments counters, etc.).
export function GlassPill({ children, onPress, tone = 'neutral', style }: GlassPillProps) {
  return (
    <GlassSurface onPress={onPress} tone={tone} radius={999} style={[styles.pill, style]}>
      {children}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
});
