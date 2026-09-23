import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { AiDrift, type DriftSpec } from '@/components/ai/ai-drift';
import { PULSE_MAX, PULSE_MIN, PULSE_MS } from '@/constants/ai-motion';
import { Ai } from '@/constants/theme';

// A soft body of colour, drawn as a radial gradient that runs all the way out
// to zero opacity. That last stop is what gives the orb its blurred edge: there
// is no edge, because nothing is ever fully opaque at the rim. Cheaper than a
// real blur and it costs nothing per frame.
type Body = {
  key: string;
  color: string;
  /** Opacity at the very centre. */
  core: number;
  /** Ellipse geometry, in the orb's own 0–100 space. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  drift: DriftSpec;
};

// Orange and deep blue, and nothing else. There were four — a cyan and a
// violet drifted behind the brand pair at under a third of their opacity —
// which worked as light moving inside a sphere on a dark ground. On a
// near-white one they stop being light and start being two more colours.
//
// The pair is placed off-centre from each other so the orb has a warm side and
// a cool side that swap slowly as they drift, which is most of what makes it
// look like a body rather than a blend.
const BODIES: Body[] = [
  {
    key: 'deep',
    // The lit blue, not the deep one. The ground behind the orb is that deep
    // blue now, and a body painted in it disappears into its own background.
    color: Ai.orbDeepLit,
    core: 1,
    cx: 62,
    cy: 62,
    rx: 40,
    ry: 38,
    drift: { period: 13000, x: 7, y: 5, turn: 9, breathe: 0.05 },
  },
  {
    key: 'warm',
    color: Ai.orbWarm,
    core: 1,
    cx: 39,
    cy: 37,
    rx: 37,
    ry: 35,
    drift: { period: 11000, delay: 900, x: 9, y: 7, turn: 12, breathe: 0.06 },
  },
];

// The AI's presence on the screen.
//
// Two gradient bodies drifting inside one another, a highlight off to the
// upper left, and a wide halo behind them. The highlight is the whole reason
// it reads as a sphere rather than as a coloured smudge: a single light
// source, always in the same corner, is what the eye uses to decide something
// is round.
//
// It moves the whole time and is never the thing you are looking at — periods
// are nine to fifteen seconds and no body travels more than a tenth of the
// orb's width, so it is alive in peripheral vision and still when you read the
// heading beside it.
export function AiOrb({ size }: { size: number }) {
  // The glow is drawn outside the orb's own box, so the container has to be
  // bigger than the orb and the orb centred in it.
  const box = size * 1.5;

  // The listening pulse: one slow breath over the whole assembly, on top of
  // the individual bodies' much longer internal drift. The drift says the orb
  // is made of something moving; this says the orb itself is waiting for you.
  //
  // One shared value driving one transform on the outermost view, so the pulse
  // costs a single composited scale per frame no matter how many gradient
  // layers are inside it.
  const pulse = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      pulse.value = 0.5; // parked mid-breath, so the orb sits at its true size
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      // Reverses rather than restarting: a linear repeat snaps back to its
      // start every cycle and the eye catches the snap immediately.
      true
    );
  }, [pulse, reduced]);

  const breath = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [PULSE_MIN, PULSE_MAX]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { width: box, height: box }, breath]}>
      {/* The halo. Furthest back, slowest, and the only part that reaches the
          screen's ground — it is what stops the orb sitting on the background
          like a sticker. Back to full strength: it was held to two-thirds
          while the assistant was a white page, where colour bleeding outward
          reads far harder than it does against a coloured one. */}
      <AiDrift period={17000} breathe={0.05}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="aiHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={Ai.orbWarm} stopOpacity={0.34} />
              <Stop offset="45%" stopColor={Ai.orbDeepLit} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={Ai.orbDeepLit} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="50" cy="50" rx="50" ry="50" fill="url(#aiHalo)" />
        </Svg>
      </AiDrift>

      <View style={{ width: size, height: size }}>
        {BODIES.map((body) => (
          <AiDrift key={body.key} {...body.drift}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Defs>
                <RadialGradient id={`aiBody-${body.key}`} cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={body.color} stopOpacity={body.core} />
                  <Stop offset="38%" stopColor={body.color} stopOpacity={body.core * 0.62} />
                  <Stop offset="100%" stopColor={body.color} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Ellipse
                cx={body.cx}
                cy={body.cy}
                rx={body.rx}
                ry={body.ry}
                fill={`url(#aiBody-${body.key})`}
              />
            </Svg>
          </AiDrift>
        ))}

        {/* The light source. Barely there, and doing more than everything above
            it — take this layer out and the orb flattens into a stain.
            White again: it went warm while the screen was a white page, where
            a white highlight is the same colour as the ground and says
            nothing. On the coloured ground it is a lamp once more. */}
        <AiDrift period={12000} delay={1400} x={3} y={3} breathe={0.04}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="aiSheen" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.62} />
                <Stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.14} />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx="36" cy="32" rx="20" ry="16" fill="url(#aiSheen)" />
          </Svg>
        </AiDrift>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
