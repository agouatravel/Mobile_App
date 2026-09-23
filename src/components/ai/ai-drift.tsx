import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export type DriftSpec = {
  /** One full there-and-back, in ms. Long: this must never read as a loop. */
  period: number;
  /** Offset into the cycle, so layers started together do not move together. */
  delay?: number;
  /** Half the total travel, in points, on each axis. */
  x?: number;
  y?: number;
  /** Half the total turn, in degrees. */
  turn?: number;
  /** Half the total size change, as a fraction of 1. */
  breathe?: number;
};

// One slowly wandering layer.
//
// Everything organic in the AI screen is built out of these: the orb is four
// stacked in place, the transition's ribbons are three sweeping across. Only
// transform properties are animated, so all of it runs on the UI thread and
// stays at frame rate no matter what the JS side is doing.
//
// The easing is a sine in and out rather than a linear ramp, and the loop
// reverses rather than restarting. That is the whole difference between
// something drifting and something on a conveyor belt: a linear repeat snaps
// back to its start every cycle, and the eye catches the snap immediately.
export function AiDrift({
  period,
  delay = 0,
  x = 0,
  y = 0,
  turn = 0,
  breathe = 0,
  children,
}: DriftSpec & { children: ReactNode }) {
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, [period, delay, phase]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(phase.value, [0, 1], [-x, x]) },
      { translateY: interpolate(phase.value, [0, 1], [-y, y]) },
      { rotate: `${interpolate(phase.value, [0, 1], [-turn, turn])}deg` },
      { scale: interpolate(phase.value, [0, 1], [1 - breathe, 1 + breathe]) },
    ],
  }));

  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}
