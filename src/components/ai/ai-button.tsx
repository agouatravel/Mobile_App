import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AiMark } from '@/components/ai/ai-mark';
import { useAiTransition } from '@/components/ai/ai-transition';
import {
  PRESS_IN_MS,
  PRESS_OUT_SPRING,
  PRESS_SCALE,
} from '@/constants/ai-motion';
import { Colors, Lift } from '@/constants/theme';

// Slightly taller than the tab capsule it sits beside, so it reads as its own
// object rather than as a fifth tab that happens to be round.
export const AI_BUTTON_SIZE = 60;

const SIZE = AI_BUTTON_SIZE;

// The mark, as a fraction of the disc. Much larger than a glyph would normally
// sit in a button — this is a logo in a badge rather than an icon in a
// control, and the sparkle's arms taper to nothing, so it covers far less of
// its own box than a solid glyph would. At the 0.46 an icon would take, the
// mark read as a small white speck adrift in a lot of orange.
const MARK = 0.7;
// How far past the button the glow reaches at rest. The bloom scales out from
// there rather than from the button's own edge.
const HALO = 14;

export function AiButton() {
  const { enter } = useAiTransition();
  const button = useRef<View>(null);
  const reduced = useReducedMotion();

  // 0 at rest, 1 pressed. Drives the dip and the bloom together.
  const press = useSharedValue(0);

  function dip() {
    if (reduced) return;
    press.value = withTiming(1, { duration: PRESS_IN_MS });
  }

  // Springs back rather than easing, and rather than being held down until the
  // screen changes. The finger is still on the button when this happens, so it
  // is the one moment of the transition the reader feels as well as sees.
  function lift() {
    if (reduced) return;
    press.value = withSpring(0, PRESS_OUT_SPRING);
  }

  function open() {
    // Fired here rather than on `onPressIn`: the tap is confirmed by the time
    // this runs, so the device never buzzes for a touch that turned out to be
    // the start of a scroll. `Light` because the button is acknowledging a
    // press, not reporting a result — a heavier style reads as an alert.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // A device with no haptic engine, or one with system haptics switched
      // off. The transition is the feedback that matters; this was the
      // flourish on top of it.
    });

    // Measured at the moment of the press rather than held from layout: the
    // button sits above a safe-area inset inside a scrolling page, and its
    // place on screen is not something that can be assumed. The wash has to
    // grow out of where the finger actually landed, or the expansion looks
    // like it came from somewhere else on the page.
    button.current?.measureInWindow((x, y, width, height) => {
      enter({ x: x + width / 2, y: y + height / 2 });
    });
  }

  const disc = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * (1 - PRESS_SCALE) }],
  }));

  // The glow blooms outward as the button dips — the two together are what
  // make the press read as energy leaving the button rather than as a tap.
  const halo = useAnimatedStyle(() => ({
    opacity: press.value * 0.55,
    transform: [{ scale: 1 + press.value * 0.55 }],
  }));

  return (
    <Pressable
      ref={button}
      onPress={open}
      onPressIn={dip}
      onPressOut={lift}
      accessibilityRole="button"
      accessibilityLabel="Ask Agoua AI"
      accessibilityHint="Opens the AI travel assistant"
      style={styles.target}>
      {/* Invisible at rest and bloomed only by the press. A glow sitting
          permanently around a button is the kind of decoration this theme
          spends nothing on — but the transition this opens starts on the same
          warm colour, so releasing it at the moment of the tap is the wash
          beginning inside the button rather than after it. */}
      <Animated.View pointerEvents="none" style={[styles.halo, halo]} />

      <Animated.View style={[styles.disc, disc]}>
        <AiMark size={SIZE * MARK} color={Colors.primaryForeground} accent={Colors.accent} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Blurred by having no edge of its own: a heavily rounded box of the accent
  // at low opacity, which over a light page is softer than a real blur would
  // be and costs nothing to animate.
  halo: {
    backgroundColor: Colors.accent,
    opacity: 0,
    position: 'absolute',
    top: -HALO,
    left: -HALO,
    right: -HALO,
    bottom: -HALO,
    borderRadius: (SIZE + HALO * 2) / 2,
    overflow: 'hidden',
  },
  // The app's ink, and the one dark object in a light app.
  //
  // This was `Ai.base` — the assistant screen's own ground — so that the
  // button read as a keyhole into the room it opened. That reasoning went when
  // the assistant did: `Ai.base` is the near-white page now, and a button
  // painted in it would be invisible on the bar.
  //
  // Ink rather than a brand colour, still. The bar already carries the blue
  // selected pill, and a saturated circle beside it made the one piece of
  // furniture present on every screen the loudest thing in the app. A dark
  // disc says the assistant is not a place you navigate to, without spending
  // any of the palette to say it — and the accent is still here, on the mark's
  // companion star, which is also how the orb opens.
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.foreground,
    boxShadow: Lift.bar,
  },
});
