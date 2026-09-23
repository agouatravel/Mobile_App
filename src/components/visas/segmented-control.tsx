import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const HEIGHT = 46;
const PAD = 4;

// The spring the pill rides. Slightly overdamped on purpose — a segmented
// control that overshoots and settles reads as a toy, but a pure timing curve
// reads as a screenshot changing. This lands once, quickly, with just enough
// weight to look physical.
const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };

// A single-select row where the selection is a pill that slides between the
// options rather than appearing under the one you pressed.
//
// The movement is the point: it is what says these are alternatives on one
// track, and that picking a new one gives up the last. Chips that light up
// independently say nothing of the sort, which is why the reference uses this
// shape for its either/or and chips for everything else.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  /** Shorter display text, when the stored value is too long for a segment. */
  labels?: Record<T, string>;
}) {
  // The pill cannot be positioned until the row has been measured, since its
  // travel is a fraction of a width that flex decides at layout.
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.indexOf(value));
  const offset = useSharedValue(0);

  const segment = width > 0 ? (width - PAD * 2) / options.length : 0;

  useEffect(() => {
    if (segment <= 0) return;
    const next = index * segment;
    // Snap into place on the first measure instead of sliding in from the
    // left, which would look like the control animating itself on open.
    offset.value = offset.value === 0 && index === 0 ? next : withSpring(next, SPRING);
  }, [index, segment, offset]);

  const pill = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View
      style={styles.track}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
      <Animated.View style={[styles.pill, pill]} />

      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={styles.segment}>
            <Text
              style={[styles.label, selected && styles.labelSelected]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>
              {labels?.[option] ?? option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    flexDirection: 'row',
    padding: PAD,
    borderRadius: HEIGHT / 2,
    // The unselected half of the reference's control is a wash of its accent
    // rather than grey, which is what keeps the whole control reading as one
    // object instead of a coloured pill sitting on a neutral bar.
    backgroundColor: `${Colors.primary}14`,
  },
  pill: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    bottom: PAD,
    borderRadius: (HEIGHT - PAD * 2) / 2,
    backgroundColor: Colors.primary,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  labelSelected: {
    color: Colors.primaryForeground,
  },
});
