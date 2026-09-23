import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { AiDrift } from '@/components/ai/ai-drift';
import { AiGround } from '@/components/ai/ai-ground';
import {
  CLOSE_EASING,
  COLLAPSE_MS,
  COVER_MS,
  EXPAND_SPRING,
  PUSH_AT,
  REDUCED_MS,
  REVEAL_MS,
} from '@/constants/ai-motion';
import { Ai } from '@/constants/theme';

// Every duration and curve for this file lives in constants/ai-motion.ts —
// see the note at the top of it for how to retime the whole transition.

// The disc starts at the size of the button it comes out of.
const SEED = 64;

type Origin = { x: number; y: number };

// null while nothing is happening, which is also what unmounts the wash.
type Phase = 'enter' | 'exit' | null;

type AiTransitionValue = {
  /** Grow out of a point on screen, then land on the assistant. */
  enter: (origin: Origin) => void;
  /** Collapse back to wherever it opened from, and go back. */
  exit: () => void;
};

const AiTransitionContext = createContext<AiTransitionValue | null>(null);

export function useAiTransition() {
  const value = useContext(AiTransitionContext);
  if (!value) throw new Error('useAiTransition must be used inside an AiTransitionProvider');
  return value;
}

// Owns the full-screen wash and the navigation that happens behind it.
//
// It sits above the navigator rather than inside a screen, which is the only
// place a cover can survive the push it is hiding: anything rendered by the
// Home screen is unmounted the moment the assistant becomes the active route,
// and the transition would be cut off halfway.
export function AiTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  // What the wash is doing, and the only thing that mounts it. An idle app
  // should not be holding a screen-sized stack of gradients in the view tree.
  const [phase, setPhase] = useState<Phase>(null);
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0 });
  const running = phase !== null;

  // A ref rather than the state above, because both guards are read inside the
  // same handler that sets them: a second tap can arrive before React has
  // re-rendered, and `phase` would still be reading null when it does.
  const busy = useRef(false);
  // Set once per opening, so the threshold below cannot push twice — `grow`
  // crosses it again on the way back down during a close.
  const pushed = useRef(false);
  // Which phase the effect below has already started. It depends on `router`
  // among other things, and nothing guarantees that identity holds for the
  // life of a transition — without this, one re-render mid-flight would
  // restart the spring from zero and the disc would visibly jump back.
  const started = useRef<Phase>(null);

  // How far the disc has grown, 0 to 1. Everything the wash does is this.
  const grow = useSharedValue(0);
  // How much of the wash is on screen at all, which is what dissolves at the
  // end of an opening and builds at the start of a close.
  const cover = useSharedValue(0);

  // Far enough that the disc has swallowed the furthest corner from wherever it
  // started, whichever corner that turns out to be.
  const reach = useMemo(() => {
    const far = Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y));
    return (far * 2.1) / SEED;
  }, [origin, width, height]);

  const settle = useCallback(() => {
    busy.current = false;
    setPhase(null);
  }, []);

  const push = useCallback(() => {
    if (pushed.current) return;
    pushed.current = true;
    router.push('/assistant');
  }, [router]);

  // The animations start here rather than in `enter` and `exit`, and that is
  // the whole reason this is an effect at all.
  //
  // Those handlers set the state that mounts the wash, and React does not
  // commit that until after they return — so a spring started inside one of
  // them ran its first frames against a view that did not exist yet. The disc
  // appeared already part-grown, which is what a fast transition reads as when
  // it is actually a dropped opening. An effect runs after the commit, so the
  // first frame of the spring is also the first frame the disc is on screen.
  useEffect(() => {
    if (phase === null) {
      started.current = null;
      return;
    }
    if (started.current === phase) return;
    started.current = phase;

    if (phase === 'enter') {
      // Reduced motion: no expansion at all. The wash appears at full size,
      // holds for the length of a cross-fade, and dissolves. The screen still
      // changes; it just stops travelling to get there.
      if (reduced) {
        grow.value = 1;
        cover.value = 1;
        push();
        cover.value = withTiming(0, { duration: REDUCED_MS }, (finished) => {
          if (finished) runOnJS(settle)();
        });
        return;
      }

      grow.value = 0;
      cover.value = 1;
      grow.value = withSpring(1, EXPAND_SPRING, (finished) => {
        if (finished) {
          runOnJS(reveal)();
        }
      });
      return;
    }

    // Closing. The wash builds by fading in over the assistant and only then
    // collapses — growing it again from the button would mean drawing an
    // expansion the reader has to sit through twice.
    grow.value = 1;
    cover.value = withTiming(1, { duration: reduced ? REDUCED_MS : COVER_MS }, (finished) => {
      if (finished) runOnJS(home)();
    });

    function reveal() {
      cover.value = withTiming(0, { duration: REVEAL_MS }, (finished) => {
        if (finished) runOnJS(settle)();
      });
    }

    function home() {
      router.back();
      grow.value = withTiming(0, { duration: COLLAPSE_MS, easing: CLOSE_EASING }, (finished) => {
        if (finished) runOnJS(settle)();
      });
    }
  }, [phase, reduced, push, settle, router, grow, cover]);

  const value: AiTransitionValue = useMemo(
    () => ({
      enter(from: Origin) {
        // Ignored rather than restarted. A transition already halfway across
        // the screen has a push queued behind it, and beginning again would
        // land on the assistant twice.
        if (busy.current) return;
        busy.current = true;
        pushed.current = false;
        setOrigin(from);
        setPhase('enter');
      },

      exit() {
        if (busy.current) return;
        busy.current = true;
        setPhase('exit');
      },
    }),
    []
  );

  // Watches the expansion on the UI thread and hops to JS exactly once, at the
  // point the route has to change. A `setTimeout` alongside the animation would
  // drift from it — the spring's own clock is the only one that knows where the
  // disc actually is.
  useAnimatedReaction(
    () => grow.value >= PUSH_AT,
    (crossed, previous) => {
      if (crossed && !previous) runOnJS(push)();
    },
    [push]
  );

  return (
    <AiTransitionContext.Provider value={value}>
      {children}
      {running ? <Wash origin={origin} reach={reach} grow={grow} cover={cover} /> : null}
    </AiTransitionContext.Provider>
  );
}

function Wash({
  origin,
  reach,
  grow,
  cover,
}: {
  origin: Origin;
  reach: number;
  grow: SharedValue<number>;
  cover: SharedValue<number>;
}) {
  const veil = useAnimatedStyle(() => ({ opacity: cover.value }));

  const disc = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(grow.value, [0, 1], [0.2, reach]) }],
  }));

  // Clamped, unlike the scale above. The expansion is a spring and settles
  // from above, so `grow` passes 1 before it lands — which is exactly what the
  // disc's scale should do, and exactly what these must not: extrapolating the
  // last segment of any of these ramps past 1 runs the opacity negative.
  //
  // The colour journey. Orange is the ground the whole way and deep blue rises
  // through the middle, where the expansion is fastest — the app's two colours
  // and no others, the same pair the orb on the other side is made of.
  const deep = useAnimatedStyle(() => ({
    opacity: interpolate(grow.value, [0, 0.22, 0.55, 0.85, 1], [0, 0.85, 1, 0.5, 0], Extrapolation.CLAMP),
  }));

  // The ribbons sweep across as the disc opens and are gone before it lands,
  // so they are something glimpsed inside the expansion rather than decoration
  // laid over it.
  // The wash turning into the page it is about to reveal. Starts earlier than
  // it did (0.62 rather than 0.74) so the handover is a fade rather than a
  // swap in the last few frames.
  const land = useAnimatedStyle(() => ({
    opacity: interpolate(grow.value, [0, 0.62, 1], [0, 0, 1], Extrapolation.CLAMP),
  }));

  const ribbons = useAnimatedStyle(() => ({
    opacity: interpolate(grow.value, [0, 0.18, 0.62, 1], [0, 0.9, 0.7, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View pointerEvents="auto" style={[StyleSheet.absoluteFill, styles.root, veil]}>
      <Animated.View
        style={[
          styles.disc,
          { left: origin.x - SEED / 2, top: origin.y - SEED / 2 },
          disc,
        ]}>
        <LinearGradient
          colors={[Ai.orbWarm, '#E06E00']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={[StyleSheet.absoluteFill, deep]}>
          <LinearGradient
            colors={[Ai.orbDeep, '#06364F']}
            start={{ x: 0, y: 0.1 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* The landing. The wash resolves onto the assistant's own ground
            before the cover comes off, so the dissolve at the end has almost
            nothing left to cross — the expansion becomes the screen rather
            than being swapped for it. This is what the two removed hues used
            to occupy: on a dark assistant the wash could end on orange and cut
            straight to near-black, and nobody read it as a jump. Landing a
            saturated orange on a near-white page would be exactly that. */}
        {/* The landing. The wash resolves onto the assistant's ground — the
            very same component the screen paints itself with — so by the time
            the cover dissolves the two are the same picture and the reveal has
            nothing to cross. This used to be a flat sheet of the page colour,
            which is what made the end of the transition a blank pale moment
            before the content arrived. */}
        <Animated.View style={[StyleSheet.absoluteFill, land]}>
          <AiGround />
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, ribbons]}>
          <Ribbons />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// Light moving inside the wash. Three long soft ellipses, each on its own
// drift, drawn white at low opacity so they read as sheen on a fluid rather
// than as objects floating in front of one.
function Ribbons() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <AiDrift period={900} x={16} y={-10} turn={22} breathe={0.16}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id="aiRibbonA" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.42} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="34" cy="30" rx="40" ry="12" fill="url(#aiRibbonA)" />
        </Svg>
      </AiDrift>

      <AiDrift period={1150} delay={80} x={-14} y={12} turn={-18} breathe={0.2}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id="aiRibbonB" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.32} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="66" cy="64" rx="36" ry="10" fill="url(#aiRibbonB)" />
        </Svg>
      </AiDrift>

      <AiDrift period={780} delay={160} x={10} y={14} turn={30} breathe={0.14}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id="aiRibbonC" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.3} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="52" cy="80" rx="30" ry="8" fill="url(#aiRibbonC)" />
        </Svg>
      </AiDrift>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // Over the tab bar and the button both, so nothing pokes through the wash
    // while it is on screen.
    zIndex: 40,
  },
  disc: {
    position: 'absolute',
    width: SEED,
    height: SEED,
    borderRadius: SEED / 2,
    overflow: 'hidden',
  },
});
