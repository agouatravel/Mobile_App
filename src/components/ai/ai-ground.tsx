import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { Ai } from '@/constants/theme';

// The assistant's ground: a near-black field with the brand's two colours
// bloomed into opposite corners.
//
// Drawn in one place and used in two — the screen paints it, and the
// transition's landing layer paints the same thing as the expansion resolves.
// That is the whole reason it is a component rather than a style: the last
// frame of the animation and the first frame of the screen have to be the same
// picture, and two copies would drift apart the first time either was touched.
//
// It was a full-screen blue-to-orange ramp. That reads as a poster; a dark
// field with light thrown across it reads as a room, and it is far kinder to
// everything standing on it — white type, white cards and translucent chrome
// all have somewhere to sit, which on a saturated ramp they did not.

// The base, head to foot: lifted at the top, deepest at the bottom. Barely a
// gradient at all — three values within about fifteen points of each other —
// but a single flat colour behind a screen this tall reads as a void rather
// than as a space.
const FIELD = [Ai.dusk, Ai.base, Ai.olive] as const;
const FIELD_STOPS = [0, 0.45, 1] as const;

// The two lights, in the ground's own 0-100 space.
//
// Warm at the head, cool at the foot, and that order is not arbitrary: the orb
// is drawn over the top-right corner and is warm-cored, so the warm bloom sits
// behind it as its own spill rather than fighting it. The cool one anchors the
// opposite corner, which is what stops the field reading as lit from one side.
//
// Set on a diagonal rather than squarely facing each other — light on exact
// opposite corners reads as an effect, and this has to read as a room that
// happens to be lit.
const BLOOMS = [
  { key: 'warm', color: Ai.orbWarm, cx: 88, cy: 14, rx: 62, ry: 40, core: 0.3 },
  { key: 'cool', color: Ai.orbDeepLit, cx: 10, cy: 84, rx: 66, ry: 42, core: 0.34 },
] as const;

export function AiGround() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={FIELD} locations={FIELD_STOPS} style={StyleSheet.absoluteFill} />

      {/* `preserveAspectRatio="none"` so the blooms stretch with the screen
          rather than staying circular and leaving the corners of a tall phone
          untouched. Each runs out to zero opacity, so neither has an edge —
          which is what makes them light rather than shapes. */}
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {BLOOMS.map((bloom) => (
            <RadialGradient key={bloom.key} id={`aiBloom-${bloom.key}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={bloom.color} stopOpacity={bloom.core} />
              <Stop offset="42%" stopColor={bloom.color} stopOpacity={bloom.core * 0.4} />
              <Stop offset="100%" stopColor={bloom.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>

        {BLOOMS.map((bloom) => (
          <Ellipse
            key={bloom.key}
            cx={bloom.cx}
            cy={bloom.cy}
            rx={bloom.rx}
            ry={bloom.ry}
            fill={`url(#aiBloom-${bloom.key})`}
          />
        ))}
      </Svg>
    </View>
  );
}
