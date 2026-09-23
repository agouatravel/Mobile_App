import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Glass, Lift } from '@/constants/theme';

type GlassSurfaceProps = {
  children?: ReactNode;
  onPress?: () => void;
  radius?: number;
  tone?: 'neutral' | 'secondary';
  style?: StyleProp<ViewStyle>;
};

// The app's base surface: a white sheet on the warm ground, a hairline, and a
// lift at the threshold of visible. Used directly for cards and panels, and as
// the foundation for GlassPill and GlassButton.
//
// It was a frosted panel — a native blur behind a translucent fill and a
// brand-tinted glow. The blur is gone for good, and with it the reason the
// fill was translucent; what carries a card now is that it is a shade lighter
// than the page it sits on, with an edge to say where it ends.
//
// The name is a fossil, kept because it is imported widely. `tone` chooses
// what it sits on: `neutral` is a white card on the warm ground, `secondary`
// steps down a shade for a surface that has to sit on another surface.
export function GlassSurface({
  children,
  onPress,
  radius = 24,
  tone = 'neutral',
  style,
}: GlassSurfaceProps) {
  const fill = tone === 'secondary' ? Glass.secondaryFill : Glass.fill;
  const border = tone === 'secondary' ? Glass.secondaryBorder : Glass.border;

  // One view, where there were three. The fill is painted on the container
  // itself rather than by an absolutely-positioned layer over a blur, so a
  // surface costs a single native view again.
  const content = (
    <View
      style={[
        styles.container,
        { borderRadius: radius, backgroundColor: fill, borderColor: border },
        style,
      ]}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    boxShadow: Lift.card,
  },
  // Presses the surface down rather than fading it: on a flat grey fill there
  // is no translucency left for an opacity change to read against.
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
