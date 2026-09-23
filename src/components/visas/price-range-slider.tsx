import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { formatPrice } from '@/constants/currency';
import { Colors, Lift } from '@/constants/theme';

const THUMB = 26;
// Thinner than the 5 it was. The track is the quietest thing on the sheet —
// a rule the handles run along — and at 5 it read as a bar in its own right,
// competing with the filled range drawn on top of it.
const TRACK_H = 4;

// The thumbs may not cross, and may not meet either: a range whose ends are
// equal matches at most one price and reads as a bug rather than a choice.
const MIN_GAP_STEPS = 1;

const GRAB_SPRING = { damping: 15, stiffness: 260, mass: 0.5 };

// A two-ended price filter.
//
// A blue track and two white-ringed handles: the grip lines that used to be
// drawn inside them are gone. Two hairlines on a 20pt disc is decoration
// pretending to be affordance — the shadow and the ring already say the handle
// can be taken hold of, and at this size the lines only muddied it.
//
// The thumbs are driven entirely on the UI thread — the pan writes to shared
// values and the track, fill and both handles derive from them — so dragging
// stays smooth regardless of what the list behind the sheet is doing. React
// only hears about it when the rounded value actually changes, which for a
// range of a few hundred riyals in steps of ten is a few dozen times across the
// whole width rather than once per frame.
export function PriceRangeSlider({
  min,
  max,
  step,
  initialLow,
  initialHigh,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  initialLow: number;
  initialHigh: number;
  onChange: (low: number, high: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const [low, setLow] = useState(initialLow);
  const [high, setHigh] = useState(initialHigh);

  const steps = Math.max(1, Math.round((max - min) / step));
  const span = Math.max(0, width - THUMB);

  // Positions are held in steps rather than pixels, so a rotation or a
  // re-measure cannot drift the thumbs off the values they represent.
  const lowStep = useSharedValue(Math.round((initialLow - min) / step));
  const highStep = useSharedValue(Math.round((initialHigh - min) / step));
  const lowLift = useSharedValue(0);
  const highLift = useSharedValue(0);

  const report = useCallback(
    (nextLowStep: number, nextHighStep: number) => {
      const nextLow = min + nextLowStep * step;
      const nextHigh = min + nextHighStep * step;
      setLow(nextLow);
      setHigh(nextHigh);
      onChange(nextLow, nextHigh);
    },
    [min, step, onChange]
  );

  const makePan = (
    self: typeof lowStep,
    other: typeof lowStep,
    lift: typeof lowLift,
    isLow: boolean
  ) =>
    Gesture.Pan()
      .onBegin(() => {
        lift.value = withSpring(1, GRAB_SPRING);
      })
      .onChange((event) => {
        if (span <= 0) return;
        const perStep = span / steps;
        const raw = self.value + event.changeX / perStep;
        const bounded = isLow
          ? clamp(raw, 0, other.value - MIN_GAP_STEPS)
          : clamp(raw, other.value + MIN_GAP_STEPS, steps);
        const snapped = Math.round(bounded);
        if (snapped !== Math.round(self.value)) {
          runOnJS(report)(
            Math.round(isLow ? snapped : other.value),
            Math.round(isLow ? other.value : snapped)
          );
        }
        self.value = bounded;
      })
      .onFinalize(() => {
        lift.value = withSpring(0, GRAB_SPRING);
        // Settle onto the step it reported, so the handle never rests between
        // two values while the label shows one of them.
        self.value = withSpring(Math.round(self.value), GRAB_SPRING);
      });

  const lowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: span > 0 ? (lowStep.value / steps) * span : 0 },
      { scale: 1 + lowLift.value * 0.18 },
    ],
  }));

  const highStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: span > 0 ? (highStep.value / steps) * span : 0 },
      { scale: 1 + highLift.value * 0.18 },
    ],
  }));

  // The lit section between the handles. Inset by half a thumb at each end so
  // it starts and stops under their centres rather than their edges.
  const fillStyle = useAnimatedStyle(() => {
    if (span <= 0) return { left: 0, width: 0 };
    const from = (lowStep.value / steps) * span;
    const to = (highStep.value / steps) * span;
    return { left: from + THUMB / 2, width: Math.max(0, to - from) };
  });

  return (
    <View>
      <View
        style={styles.trackRow}
        onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
        <View style={styles.track} />
        <Animated.View style={[styles.fill, fillStyle]} />

        <GestureDetector gesture={makePan(lowStep, highStep, lowLift, true)}>
          <Animated.View
            accessibilityRole="adjustable"
            accessibilityLabel="Minimum price"
            accessibilityValue={{ min, max, now: low }}
            style={[styles.thumb, lowStyle]}
          />
        </GestureDetector>

        <GestureDetector gesture={makePan(highStep, lowStep, highLift, false)}>
          <Animated.View
            accessibilityRole="adjustable"
            accessibilityLabel="Maximum price"
            accessibilityValue={{ min, max, now: high }}
            style={[styles.thumb, highStyle]}
          />
        </GestureDetector>
      </View>

      <View style={styles.labels}>
        <Text style={styles.value}>{formatPrice(low)}</Text>
        <Text style={styles.value}>{formatPrice(high)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trackRow: {
    height: THUMB + 12,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    marginHorizontal: THUMB / 2,
    backgroundColor: Colors.divider,
  },
  fill: {
    position: 'absolute',
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: Colors.primary,
  },
  // The handle is the only thing on this row meant to be grabbed, and on a
  // white sheet a flat disc gives no sign of that — so it keeps a lift where
  // almost nothing else in this theme does. It had one, lost it when shadows
  // came off the app wholesale, and is the one case where that was wrong: the
  // white ring and the shadow together are what lift it off its own track.
  //
  // `boxShadow` rather than the old shadow/elevation pair, which draws from a
  // view's square bounds on Android and would put a rectangle behind a 26pt
  // circle.
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.surface,
    boxShadow: Lift.card,
  },
  labels: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // These are prices, and prices are the accent — the same orange the offer
  // cards and the destination grid set them in. They were the action blue,
  // which on a control made of blue said "these numbers are part of the
  // slider" rather than "these are what it costs".
  value: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.accent,
  },
});
