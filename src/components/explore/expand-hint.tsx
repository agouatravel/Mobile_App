import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, PrimaryGlow } from '@/constants/theme';

const SIZE = 16;
// The two chevrons overlap by well over half their nominal size: Ionicons draws
// the stroke inside a box much taller than it, so stacking them at their own
// height would leave an obvious gap between the two arrowheads.
const OVERLAP = 9;

// Two chevrons pulsing in sequence rather than one blinking on its own — the
// emphasis travels from the leading chevron to the trailing one, which reads as
// a nudge in that direction instead of as an icon flashing for attention.
export function ExpandHint({ open }: { open: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // `true` reverses on each pass, so the pulse eases back rather than
    // snapping to the start of the next cycle.
    progress.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress]);

  const lead = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.6,
    transform: [{ translateY: progress.value * 3 }],
  }));

  const trail = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.value * 0.6,
    transform: [{ translateY: progress.value * 3 }],
  }));

  // Swapped when open, so the emphasis runs bottom-to-top and the pulse follows
  // the arrows rather than fighting them.
  const name = open ? 'chevron-up' : 'chevron-down';

  return (
    <View style={styles.stack} pointerEvents="none">
      <Animated.View style={open ? trail : lead}>
        <Ionicons
          name={name}
          size={SIZE}
          color={Colors.onLight}
          style={styles.glyph}
        />
      </Animated.View>
      <Animated.View style={[styles.second, open ? lead : trail]}>
        <Ionicons
          name={name}
          size={SIZE}
          color={Colors.onLight}
          style={styles.glyph}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignItems: 'center',
  },
  second: {
    marginTop: -OVERLAP,
  },
  // A glow rather than a drop shadow, and set on the glyph rather than on the
  // view around it: Ionicons renders as text, so a text shadow follows the
  // chevron's actual outline. A view shadow would need a background to cast
  // from, and on Android `elevation` would draw the wrapper's rectangle.
  //
  // Offset stays at zero so the glow sits under the mark evenly — an offset
  // one reads as a second, blurred chevron at this size.
  glyph: {
    textShadowColor: PrimaryGlow.textShadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
});
